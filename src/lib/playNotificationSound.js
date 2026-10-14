import notificationSoundUrl from '../assets/sounds/notificationSound.mp3'

let audio

/**
 * Play the shared Elaya notification chime (best-effort; browsers may block
 * until the user has interacted with the page).
 */
export const playNotificationSound = () => {
  try {
    if (typeof window === 'undefined') return
    if (!audio) {
      audio = new Audio(notificationSoundUrl)
      audio.preload = 'auto'
    }
    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  } catch {
    // ignore autoplay / missing-asset failures
  }
}
