import { useSocketEvent } from './useSocketEvent'

/**
 * Live platform + studio events, multiplexed over the shared dashboard socket.
 * - config:session_prediction_updated → room config:platform
 * - studio:schedule_updated → room availability:studio:{id}
 * - studio:availability_changed → room availability:studio:{id}
 *
 * Availability is debounced: a booking, a cancellation and a documented session
 * can land in quick succession, and each listening screen refetches on it.
 */
export default function usePlatformConfigSocket({
  enabled = true,
  onSessionPredictionUpdated,
  onStudioScheduleUpdated,
  onAvailabilityChanged,
} = {}) {
  useSocketEvent('config:session_prediction_updated', onSessionPredictionUpdated, {
    enabled: enabled && Boolean(onSessionPredictionUpdated),
  })

  useSocketEvent('studio:schedule_updated', onStudioScheduleUpdated, {
    enabled: enabled && Boolean(onStudioScheduleUpdated),
  })

  useSocketEvent('studio:availability_changed', onAvailabilityChanged, {
    enabled: enabled && Boolean(onAvailabilityChanged),
    debounceMs: 300,
  })
}
