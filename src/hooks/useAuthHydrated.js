import { useEffect, useState } from 'react'
import useAuthStore from '../store/authStore'

/** Wait until Zustand persist has restored session from localStorage. */
const useAuthHydrated = () => {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    if (hydrated) return undefined
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [hydrated])

  return hydrated
}

export default useAuthHydrated
