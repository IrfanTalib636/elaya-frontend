import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listLasers } from '../../api/adminPhase4'
import {
  activeKeysForCase,
  buildEngineCaseInput,
  caseArea,
  defaultEngineCase,
  laserLabel,
} from './engineCaseModel'

const EngineCaseContext = createContext(null)

export function EngineCaseProvider({ children }) {
  const [form, setForm] = useState(defaultEngineCase)
  const [lasers, setLasers] = useState([])
  const [lasersReady, setLasersReady] = useState(false)
  const [laserDrafts, setLaserDrafts] = useState({})

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
  }, [])

  const setLaserColorDelta = useCallback((laserId, color, value) => {
    if (!laserId) return
    const n = value === '' || value == null ? 0 : Number(value)
    setLaserDrafts((prev) => ({
      ...prev,
      [laserId]: { ...(prev[laserId] || {}), [color]: Number.isFinite(n) ? n : 0 },
    }))
  }, [])

  const selectedLaser = useMemo(
    () => lasers.find((l) => l.id === form.laserId) || lasers[0] || null,
    [lasers, form.laserId]
  )

  const publishedCaseInput = useMemo(
    () => buildEngineCaseInput(form, selectedLaser, null),
    [form, selectedLaser]
  )
  const draftCaseInput = useMemo(
    () => buildEngineCaseInput(form, selectedLaser, laserDrafts[selectedLaser?.id] || null),
    [form, selectedLaser, laserDrafts]
  )

  const value = useMemo(
    () => ({
      form,
      setForm,
      lasers,
      lasersReady,
      setLasers,
      selectedLaser,
      laserDrafts,
      setLaserColorDelta,
      activeKeys: activeKeysForCase(form),
      area: caseArea(form),
      laserName: laserLabel(selectedLaser),
      publishedCaseInput,
      draftCaseInput,
    }),
    [
      form,
      lasers,
      lasersReady,
      selectedLaser,
      laserDrafts,
      setLaserColorDelta,
      publishedCaseInput,
      draftCaseInput,
    ]
  )

  return <EngineCaseContext.Provider value={value}>{children}</EngineCaseContext.Provider>
}

export function useEngineCaseOptional() {
  return useContext(EngineCaseContext)
}
