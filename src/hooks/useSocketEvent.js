import { useEffect, useRef, useState } from 'react'
import { useSocketBus } from '../socket/socketContext'

/**
 * Subscribe to one server event for as long as the component is mounted.
 *
 * The handler is held in a ref, so callers can pass an inline arrow without
 * resubscribing on every render — only `event`, `enabled` and `debounceMs`
 * affect the subscription.
 *
 * `debounceMs` collapses a burst of events into a single call, which matters
 * for handlers that refetch: several screens listen for the same availability
 * event, and a studio documenting a few sessions in a row would otherwise fire
 * a request per event per screen.
 */
export const useSocketEvent = (event, handler, { enabled = true, debounceMs = 0 } = {}) => {
  const bus = useSocketBus()
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!bus || !enabled || !event) return undefined

    let timer = null
    const run = (payload) => handlerRef.current?.(payload)

    const unsubscribe = bus.subscribe(event, (payload) => {
      if (debounceMs <= 0) {
        run(payload)
        return
      }
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        run(payload)
      }, debounceMs)
    })

    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [bus, event, enabled, debounceMs])
}

/**
 * Live connection status. Separate from `useSocketEvent` so that screens which
 * only listen for events are not re-rendered when the socket reconnects.
 */
export const useSocketStatus = () => {
  const bus = useSocketBus()
  const [connected, setConnected] = useState(() => bus?.isConnected() ?? false)

  useEffect(() => {
    if (!bus) return undefined
    setConnected(bus.isConnected())
    return bus.onStatusChange(setConnected)
  }, [bus])

  return connected
}

export default useSocketEvent
