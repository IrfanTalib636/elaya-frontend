const EVENT = 'elaya:open-actions-changed'
const RETURN_KEY = 'elaya_actions_return'

/** Remember that Open was used, so finishing the step returns to the queue. */
export const markActionOpened = () => {
  try {
    sessionStorage.setItem(RETURN_KEY, '1')
  } catch {
    /* storage unavailable */
  }
}

export const notifyOpenActionsChanged = () => {
  window.dispatchEvent(new CustomEvent(EVENT))
}

export const subscribeOpenActionsChanged = (handler) => {
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}

/**
 * Refresh every open-actions surface. When this step was opened from the queue,
 * go back there so the removed task and the new count are on screen.
 */
export const finishOpenAction = (navigate) => {
  notifyOpenActionsChanged()
  let shouldReturn = false
  try {
    shouldReturn = sessionStorage.getItem(RETURN_KEY) === '1'
    sessionStorage.removeItem(RETURN_KEY)
  } catch {
    shouldReturn = false
  }
  if (shouldReturn && typeof navigate === 'function') {
    navigate('/studio/actions')
  }
}
