import notificationSoundUrl from '../assets/sounds/notificationSound.mp3'

let audioCtx = null
let audioBuffer = null
let unlockBound = false
let loadPromise = null

const getContext = () => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

const loadBuffer = async () => {
  const ctx = getContext()
  if (!ctx || audioBuffer) return
  if (!loadPromise) {
    loadPromise = (async () => {
      const response = await fetch(notificationSoundUrl, { cache: 'force-cache' })
      if (!response.ok) throw new Error('notification sound missing')
      const data = await response.arrayBuffer()
      audioBuffer = await ctx.decodeAudioData(data.slice(0))
    })().catch(() => {
      loadPromise = null
    })
  }
  await loadPromise
}

/** Call from a user gesture so later message sounds are allowed. */
export const unlockNotificationSound = () => {
  if (typeof window === 'undefined' || unlockBound) return
  unlockBound = true
  const ctx = getContext()
  if (!ctx) return
  void ctx.resume().catch(() => undefined)
  void loadBuffer()
}

/**
 * Play the shared Elaya notification chime.
 * Requires a prior user gesture on the page (click / key / touch).
 */
export const playNotificationSound = () => {
  try {
    if (typeof window === 'undefined') return
    const ctx = getContext()
    if (!ctx) return

    const playBuffer = () => {
      if (!audioBuffer) return
      if (ctx.state === 'suspended') void ctx.resume()
      const source = ctx.createBufferSource()
      const gain = ctx.createGain()
      gain.gain.value = 1
      source.buffer = audioBuffer
      source.connect(gain)
      gain.connect(ctx.destination)
      source.start(0)
    }

    if (audioBuffer) {
      playBuffer()
      return
    }

    void (async () => {
      await ctx.resume().catch(() => undefined)
      await loadBuffer()
      playBuffer()
    })()
  } catch {
    // ignore autoplay / decode failures
  }
}

/** Mount once in the app shell to unlock audio after the first gesture. */
export const bindNotificationSoundUnlock = () => {
  if (typeof window === 'undefined') return () => undefined
  const unlock = () => unlockNotificationSound()
  const opts = { capture: true, passive: true }
  window.addEventListener('pointerdown', unlock, opts)
  window.addEventListener('keydown', unlock, opts)
  window.addEventListener('touchstart', unlock, opts)
  return () => {
    window.removeEventListener('pointerdown', unlock, opts)
    window.removeEventListener('keydown', unlock, opts)
    window.removeEventListener('touchstart', unlock, opts)
  }
}
