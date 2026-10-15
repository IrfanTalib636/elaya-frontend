import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { listLasers } from '../../api/adminPhase4'
import {
  activeKeysForCase,
  buildEngineCaseInput,
  caseArea,
  defaultEngineCase,
  laserLabel,
  readStoredEngineCase,
  writeStoredEngineCase,
} from './engineCaseModel'

const EngineCaseContext = createContext(null)

/** `refreshKey` re-reads the laser catalog (its LIVE colour deltas) after publish / discard. */
export function EngineCaseProvider({ children, refreshKey = 0 }) {
  const [form, setForm] = useState(() => readStoredEngineCase() || defaultEngineCase())
  const [lasers, setLasers] = useState([])
  const [lasersReady, setLasersReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    listLasers()
      .then((res) => {
        if (cancelled) return
        const devices = (res.data?.data?.devices || []).filter((d) => d.active !== false)
        setLasers(devices)
        setForm((prev) => (prev.laserId || !devices.length ? prev : { ...prev, laserId: devices[0].id }))
        setLasersReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setLasers([])
          setLasersReady(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  useEffect(() => {
    writeStoredEngineCase(form)
  }, [form])

  const selectedLaser = useMemo(
    () => lasers.find((l) => l.id === form.laserId) || lasers[0] || null,
    [lasers, form.laserId]
  )

  // LIVE and DRAFT run the same case; only the config (published vs draft) differs.
  const caseInput = useMemo(() => buildEngineCaseInput(form, selectedLaser), [form, selectedLaser])

  const value = useMemo(
    () => ({
      form,
      setForm,
      lasers,
      lasersReady,
      setLasers,
      selectedLaser,
      activeKeys: activeKeysForCase(form),
      area: caseArea(form),
      laserName: laserLabel(selectedLaser),
      publishedCaseInput: caseInput,
      draftCaseInput: caseInput,
    }),
    [form, lasers, lasersReady, selectedLaser, caseInput]
  )

  return <EngineCaseContext.Provider value={value}>{children}</EngineCaseContext.Provider>
}

export function useEngineCaseOptional() {
  return useContext(EngineCaseContext)
}
