/**
 * Proves the shared socket really multiplexes: many subscribers, one physical
 * connection, one socket-level listener per event, and every subscriber gets
 * the event.
 *
 * Runs the real `createSocketConnection` from the app against the running
 * backend, with a browser-ish localStorage shim.
 *
 * Needs the backend dev server up. Run through vite-node so the app's
 * extensionless imports and `import.meta.env` resolve:
 *   npx vite-node scripts/verifySocketMultiplexing.mjs
 */
import { createRequire } from 'node:module'

// The backend is CommonJS and lives outside this package; load it the Node way
// so Vite never tries to transform it.
const BACKEND = '/Users/macbook/elaya/elaya-backend'
const require = createRequire(`${BACKEND}/package.json`)
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: `${BACKEND}/.env`, quiet: true })

// Minimal browser globals the app modules expect.
const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
}
// One source of truth for the target: the socket and the REST calls below must
// hit the same server, or the fan-out check silently tests nothing.
process.env.VITE_API_URL ??= `http://localhost:${process.env.PORT || 4000}/api/v1`
const ORIGIN = new URL(process.env.VITE_API_URL).origin
globalThis.location = { href: `${ORIGIN}/`, origin: ORIGIN, protocol: 'http:', host: new URL(ORIGIN).host }
globalThis.document = { cookie: '' }
globalThis.navigator ??= { userAgent: 'node' }
globalThis.window = globalThis

const { createSocketConnection } = await import('../src/lib/socketConnection.js')
const { TOKEN_KEY } = await import('../src/lib/session.js')

const User = require('./models/userModel')
const Case = require('./models/caseModel')
const Appointment = require('./models/appointmentModel')

const fail = (msg) => {
  console.error(`ASSERTION FAILED: ${msg}`)
  process.exitCode = 1
}
const check = (label, actual, expected) => {
  const ok = actual === expected
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`)
  if (!ok) fail(label)
}

await mongoose.connect(process.env.MONGO_URI)

const [group] = await Case.aggregate([
  { $match: { customer: { $ne: null }, studio: { $ne: null } } },
  { $group: { _id: { customer: '$customer', studio: '$studio' }, cases: { $push: '$_id' } } },
  { $match: { 'cases.1': { $exists: true } } },
  { $limit: 1 },
])
const { customer: customerId, studio: studioId } = group._id

const [studioUser, customerUser] = await Promise.all([
  User.findOne({ studio_id: studioId, role: { $in: ['studio_admin', 'studio_staff'] } }).lean(),
  User.findOne({ customer_id: customerId }).lean(),
])
const sign = (id) => jwt.sign({ userId: id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })

// The app reads its token from localStorage.
localStorage.setItem(TOKEN_KEY, sign(studioUser._id))

const connection = createSocketConnection()

// Five independent "screens" subscribing to the same event, as a studio user
// with the case panel, the booking modal and the group modal open would.
const hits = [0, 0, 0, 0, 0]
const unsubs = hits.map((_, i) => connection.subscribe('studio:availability_changed', () => { hits[i] += 1 }))
// Plus one subscriber on a different event, to confirm listeners are per-event.
const unsubSchedule = connection.subscribe('studio:schedule_updated', () => {})

console.log('\n--- registry before connect ---')
check('distinct events with subscribers', connection.stats().events, 2)
check('socket-level listeners attached', connection.stats().socketListeners, 0)

await connection.connect()
await new Promise((r) => setTimeout(r, 1200))

console.log('\n--- after connect ---')
check('connected', connection.isConnected(), true)
check('distinct events with subscribers', connection.stats().events, 2)
check('socket-level listeners (one per event, not per subscriber)', connection.stats().socketListeners, 2)

// Trigger a real event by booking as the customer.
const customerToken = sign(customerUser._id)
const caseA = await Case.findById(group.cases[0])
const standorte = await (
  await fetch(`${ORIGIN}/api/v1/cases/${caseA._id}/standorte`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  })
).json()
const standortId = standorte?.data?.standorte?.[0]?.id ?? null
const availability = await (
  await fetch(`${ORIGIN}/api/v1/cases/${caseA._id}/availability?consultationOnly=true`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  })
).json()

const book = await fetch(`${ORIGIN}/api/v1/appointments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
  body: JSON.stringify({
    case_id: String(caseA._id),
    date: `${availability.data.fruehestes}T10:00:00.000Z`,
    time: '10:00',
    type: 'beratung',
    consultationOnly: true,
    ...(standortId ? { standort_id: standortId } : {}),
  }),
})
const bookBody = await book.json()
console.log(`\nPOST /appointments -> ${book.status}`)
if (!book.ok) console.log('  ', JSON.stringify(bookBody).slice(0, 300))
const apptId = bookBody?.data?.appointments?.[0]?.id

await new Promise((r) => setTimeout(r, 1500))

console.log('\n--- fan-out ---')
hits.forEach((n, i) => check(`subscriber ${i + 1} received the event`, n, 1))

// Unsubscribing one must not detach the shared listener.
unsubs[0]()
console.log('\n--- after one unsubscribe ---')
check('socket-level listeners still attached', connection.stats().socketListeners, 2)

unsubs.slice(1).forEach((fn) => fn())
console.log('\n--- after all availability subscribers gone ---')
check('distinct events with subscribers', connection.stats().events, 1)
check('socket-level listeners', connection.stats().socketListeners, 1)

// Subscriptions survive a logout/login cycle, because disconnect keeps the
// registry and only drops the transport.
connection.disconnect()
check('disconnected', connection.isConnected(), false)
check('registry kept across disconnect', connection.stats().events, 1)
await connection.connect()
await new Promise((r) => setTimeout(r, 1200))
check('reconnected', connection.isConnected(), true)
check('listener re-attached after reconnect', connection.stats().socketListeners, 1)

unsubSchedule()
connection.disconnect()

if (apptId) {
  await Appointment.deleteOne({ _id: apptId })
  console.log(`\ncleaned up appointment ${apptId}`)
}
await mongoose.disconnect()
console.log(process.exitCode ? '\nSOME CHECKS FAILED' : '\nALL CHECKS PASSED')
