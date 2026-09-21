import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Pencil, AlertTriangle, Info } from 'lucide-react'
import { Button, Card, Spinner, Modal, Input } from '../ui'
import { getApiErrorMessage } from '../../lib/apiError'
import { listConfigVersions } from '../../api/adminConfig'
import { listAdminStudios } from '../../api/adminStudios'
import useContent from '../../i18n/useContent'

/** Date-lock catalog — ranges match prototype Medical & Safety. */
export const DATE_LOCK_FIELDS = [
  {
    key: 'same_case_tage',
    i18n: 'sameCase',
    min: 14,
    max: 180,
  },
  {
    key: 'cross_case_tage',
    i18n: 'crossCase',
    min: 7,
    max: 180,
  },
  {
    key: 'uv_mittel_tage',
    i18n: 'uvModerate',
    min: 0,
    max: 180,
  },
  {
    key: 'uv_intensiv_tage',
    i18n: 'uvIntense',
    min: 0,
    max: 180,
  },
  {
    key: 'medikament_kurz_tage',
    i18n: 'medAntibiotics',
    min: 0,
    max: 180,
  },
  {
    key: 'medikament_retinoide_tage',
    i18n: 'medRetinoids',
    min: 0,
    max: 365,
  },
]

export const CONDITION_LOCK_KEYS = [
  'antidepressants',
  'skin_acne_medication',
  'other_unknown_medication',
  'illness_not_recovered',
]

const DEFAULT_CONDITIONS = {
  antidepressants: 'MEDICAL_CLEARANCE_REQUIRED',
  skin_acne_medication: 'MEDICAL_CLEARANCE_REQUIRED',
  other_unknown_medication: 'MEDICAL_REVIEW_REQUIRED',
  illness_not_recovered: 'MEDICAL_REVIEW_REQUIRED',
}

const fieldClass =
  'w-full max-w-[100px] rounded-[10px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[13px] px-3 py-2 outline-none focus:border-studio-gold/50'
const selectClass =
  'w-full max-w-[280px] rounded-[10px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[13px] px-3 py-2 outline-none focus:border-studio-gold/50'

const fmtDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Medical & Safety — prototype Date Locks / Condition Locks / version card.
 */
export default function MedicalLockoutsPanel({
  canEdit = false,
  loadConfig,
  saveConfig,
  saveLabel,
  currentVersion = 0,
  hasDraft = false,
  onEnterEdit,
  editing = false,
  onRequestLifecycleRefresh,
}) {
  const { t } = useTranslation()
  const { adminPages } = useContent()
  const copy = adminPages.medicalSafety || {}

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState({})
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)
  const [baseline, setBaseline] = useState({})
  const [baselineConditions, setBaselineConditions] = useState(DEFAULT_CONDITIONS)
  const [exceptions, setExceptions] = useState({})
  const [baselineExceptions, setBaselineExceptions] = useState({})
  const [studios, setStudios] = useState([])
  const [latestMeta, setLatestMeta] = useState(null)
  const [excModal, setExcModal] = useState(null) // { studioId, mode: 'disable'|'enable' }
  const [excReason, setExcReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await loadConfig()
      const next = { ...(data?.sperrfristen || {}) }
      const cond = {
        ...DEFAULT_CONDITIONS,
        ...(next.condition_locks || {}),
      }
      const days = {}
      for (const { key } of DATE_LOCK_FIELDS) {
        days[key] = next[key]
      }
      const exc = { ...(next.studio_exceptions || {}) }
      setValues(days)
      setBaseline(days)
      setConditions(cond)
      setBaselineConditions(cond)
      setExceptions(exc)
      setBaselineExceptions(exc)

      try {
        const [verRes, studioRes] = await Promise.all([
          listConfigVersions('sperrfristen'),
          listAdminStudios({ limit: 100 }).catch(() => null),
        ])
        setLatestMeta((verRes.data?.data?.versions || [])[0] || null)
        const list =
          studioRes?.data?.data?.studios ||
          studioRes?.data?.data?.items ||
          studioRes?.data?.data ||
          []
        setStudios(Array.isArray(list) ? list : [])
      } catch {
        setLatestMeta(null)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('settings.loadFailed')))
    } finally {
      setLoading(false)
    }
  }, [loadConfig, t])

  useEffect(() => {
    void load()
  }, [load])

  const errors = useMemo(() => {
    const map = {}
    for (const { key, min, max } of DATE_LOCK_FIELDS) {
      const n = Number(values[key])
      if (!Number.isFinite(n) || n < min || n > max) {
        map[key] = true
      }
    }
    if (
      Number.isFinite(Number(values.uv_mittel_tage)) &&
      Number.isFinite(Number(values.uv_intensiv_tage)) &&
      Number(values.uv_mittel_tage) > Number(values.uv_intensiv_tage)
    ) {
      map.uv_mittel_tage = true
      map.uv_intensiv_tage = true
    }
    return map
  }, [values])

  const hasInvalid = Object.keys(errors).length > 0

  const dirty =
    DATE_LOCK_FIELDS.some(
      ({ key }) => String(values[key] ?? '') !== String(baseline[key] ?? '')
    ) ||
    CONDITION_LOCK_KEYS.some((k) => conditions[k] !== baselineConditions[k]) ||
    JSON.stringify(exceptions) !== JSON.stringify(baselineExceptions)

  const handleSave = async () => {
    if (!canEdit || !saveConfig || hasInvalid) {
      if (hasInvalid) {
        toast.error(copy.invalidRanges || 'Some values are outside the allowed range')
      }
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...Object.fromEntries(
          DATE_LOCK_FIELDS.map(({ key }) => [key, Number(values[key])]).filter(([, n]) =>
            Number.isFinite(n)
          )
        ),
        condition_locks: { ...conditions },
        studio_exceptions: { ...exceptions },
      }
      const data = await saveConfig({ sperrfristen: payload })
      const next = { ...(data?.sperrfristen || payload) }
      const days = {}
      for (const { key } of DATE_LOCK_FIELDS) days[key] = next[key]
      const cond = { ...DEFAULT_CONDITIONS, ...(next.condition_locks || conditions) }
      const exc = { ...(next.studio_exceptions || exceptions) }
      setValues(days)
      setBaseline(days)
      setConditions(cond)
      setBaselineConditions(cond)
      setExceptions(exc)
      setBaselineExceptions(exc)
      toast.success(
        t('adminPages.settings.draftSaved', { defaultValue: t('settings.saved') })
      )
      onRequestLifecycleRefresh?.()
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('settings.saveFailed')))
    } finally {
      setSaving(false)
    }
  }

  const applyException = () => {
    if (!excModal) return
    const id = String(excModal.studioId)
    if (excModal.mode === 'disable') {
      if (excReason.trim().length < 15) {
        toast.error(copy.excReasonMin || 'Reason must be at least 15 characters')
        return
      }
      setExceptions((prev) => ({
        ...prev,
        [id]: {
          date_locks_disabled: true,
          reason: excReason.trim(),
          set_by: 'Admin',
          set_at: new Date().toISOString(),
        },
      }))
    } else {
      setExceptions((prev) => ({
        ...prev,
        [id]: {
          date_locks_disabled: false,
          reason: '',
          set_by: 'Admin',
          set_at: new Date().toISOString(),
        },
      }))
    }
    setExcModal(null)
    setExcReason('')
  }

  const conditionBadge = (cond) => {
    const clearance = cond === 'MEDICAL_CLEARANCE_REQUIRED'
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          clearance
            ? 'bg-studio-amber/15 text-studio-amber'
            : 'bg-studio-gold/15 text-studio-gold-2'
        }`}
      >
        {clearance
          ? copy.conditionClearance || 'Medical clearance required'
          : copy.conditionReview || 'Medical review required'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const versionLabel =
    currentVersion > 0
      ? `v${currentVersion}`
      : latestMeta?.version
        ? `v${latestMeta.version}`
        : 'v0'
  const changedBy =
    latestMeta?.published_by?.name ||
    latestMeta?.published_by?.email ||
    copy.system ||
    'System'
  const reason = latestMeta?.note || copy.initialReason || 'Initial state'

  return (
    <div className="flex flex-col gap-5">
      {/* Active version card */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="m-0 text-[16px] font-semibold text-studio-white">
              {copy.activeVersion || 'Active rule version'}: {versionLabel}
            </h3>
            <p className="m-0 mt-2 text-[13px] text-studio-w2">
              {copy.lastChanged || 'Last changed'}{' '}
              {fmtDate(latestMeta?.published_at)}{' '}
              {copy.by || 'by'} {changedBy}
            </p>
            <p className="m-0 mt-1 text-[13px] text-studio-w2">
              {copy.reasonLabel || 'Reason'}: {reason}
            </p>
            {hasDraft ? (
              <p className="m-0 mt-2 text-[12px] text-studio-amber flex items-center gap-1.5">
                <AlertTriangle size={13} />
                {copy.draftActive || 'Draft active — publish to go live'}
              </p>
            ) : null}
          </div>
          {canEdit && !editing ? (
            <Button
              size="sm"
              onClick={() => onEnterEdit?.()}
              className="inline-flex items-center gap-1.5"
            >
              <Pencil size={14} />
              {copy.editRules || 'Edit rules'}
            </Button>
          ) : null}
          {canEdit && editing ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!dirty || saving || hasInvalid}
                loading={saving}
                onClick={() => void handleSave()}
              >
                {saveLabel || t('common.save')}
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Date locks */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3">
          <h3 className="m-0 text-[15px] font-semibold text-studio-white">
            {copy.dateLocksTitle || t('settingsPage.bookingRules.lockoutsTitle')}
          </h3>
          <p className="m-0 mt-1.5 text-[12px] text-studio-w2 max-w-[720px] leading-relaxed">
            {copy.dateLocksHint ||
              'The permitted setting range limits which values can be set in Admin. It protects against incorrect entries and is not information on the lockout itself.'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-elaya-border bg-studio-bg-4/50">
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.colRule || 'Rule'}
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.colValue || 'Value'}
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.colRange || 'Allowed range'}
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.colDesc || 'Description'}
                </th>
              </tr>
            </thead>
            <tbody>
              {DATE_LOCK_FIELDS.map(({ key, i18n, min, max }) => {
                const invalid = errors[key]
                return (
                  <tr key={key} className="border-b border-elaya-border last:border-0">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-studio-white align-top">
                      {copy.rules?.[i18n]?.label ||
                        t(`settingsPage.bookingRules.lockouts.${i18n === 'medAntibiotics' ? 'medShort' : i18n}`)}
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      {editing && canEdit ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={min}
                              max={max}
                              className={`${fieldClass} ${
                                invalid ? 'border-studio-amber' : ''
                              }`}
                              value={values[key] ?? ''}
                              disabled={saving}
                              onChange={(e) =>
                                setValues((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                            />
                            <span className="text-[12px] text-studio-w3">
                              {t('settingsPage.bookingRules.units.days')}
                            </span>
                          </div>
                          {invalid ? (
                            <p className="m-0 mt-1 text-[11px] text-studio-amber">
                              {min}–{max}{' '}
                              {t('settingsPage.bookingRules.units.days')}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-[13px] text-studio-white">
                          {values[key] ?? '—'}{' '}
                          {t('settingsPage.bookingRules.units.days')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-studio-w2 align-top whitespace-nowrap">
                      {min}–{max} {t('settingsPage.bookingRules.units.days')}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-studio-w2 align-top leading-relaxed max-w-[360px]">
                      {copy.rules?.[i18n]?.desc || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Condition locks */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3">
          <h3 className="m-0 text-[15px] font-semibold text-studio-white">
            {copy.conditionLocksTitle || 'Condition locks'}
          </h3>
          <p className="m-0 mt-1.5 text-[12px] text-studio-w2 max-w-[720px]">
            {copy.conditionLocksHint ||
              'No fixed day count. Treatment is blocked until clearance or review is completed.'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-elaya-border bg-studio-bg-4/50">
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.colRule || 'Rule'}
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.colCondition || 'Condition'}
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.colDesc || 'Description'}
                </th>
              </tr>
            </thead>
            <tbody>
              {CONDITION_LOCK_KEYS.map((key) => (
                <tr key={key} className="border-b border-elaya-border last:border-0">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-studio-white align-top">
                    {copy.conditions?.[key]?.label || key}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    {editing && canEdit ? (
                      <select
                        className={selectClass}
                        value={conditions[key]}
                        disabled={saving}
                        onChange={(e) =>
                          setConditions((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      >
                        <option value="MEDICAL_CLEARANCE_REQUIRED">
                          {copy.conditionClearance || 'Medical clearance required'}
                        </option>
                        <option value="MEDICAL_REVIEW_REQUIRED">
                          {copy.conditionReview || 'Medical review required'}
                        </option>
                      </select>
                    ) : (
                      conditionBadge(conditions[key])
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-studio-w2 align-top leading-relaxed max-w-[360px]">
                    {copy.conditions?.[key]?.desc || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Studio exceptions */}
      <Card padding="none">
        <div className="px-5 pt-5 pb-3">
          <h3 className="m-0 text-[15px] font-semibold text-studio-white">
            {copy.excTitle || 'Date-lock exceptions per studio'}
          </h3>
          <p className="m-0 mt-1.5 text-[12px] text-studio-w2 max-w-[720px]">
            {copy.excHint ||
              'Disables all Date Locks for one studio. Condition locks remain mandatory. Save draft and publish to apply.'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-elaya-border bg-studio-bg-4/50">
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.excStudio || 'Studio'}
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.excStatus || 'Status'}
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                  {copy.colDesc || 'Description'}
                </th>
                <th className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-studio-w3" />
              </tr>
            </thead>
            <tbody>
              {studios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[13px] text-studio-w2">
                    {copy.excEmpty || 'No studios found.'}
                  </td>
                </tr>
              ) : (
                studios.map((s) => {
                  const id = String(s.id || s._id)
                  const name = s.firma || s.name || s.studio_code || id
                  const exc = exceptions[id]
                  const disabled = !!exc?.date_locks_disabled
                  return (
                    <tr key={id} className="border-b border-elaya-border last:border-0">
                      <td className="px-5 py-3 text-[13px] text-studio-white font-medium">
                        {name}
                      </td>
                      <td className="px-5 py-3 text-[12px]">
                        {disabled ? (
                          <span className="text-studio-amber font-semibold">
                            {copy.excDisabled || 'Date locks disabled'}
                          </span>
                        ) : (
                          <span className="text-studio-teal">
                            {copy.excActive || 'Date locks active'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[12px] text-studio-w2 max-w-[280px]">
                        {disabled
                          ? `${exc.reason || '—'} · ${exc.set_by || ''} ${fmtDate(exc.set_at)}`
                          : '—'}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {editing && canEdit ? (
                          disabled ? (
                            <button
                              type="button"
                              className="rounded-[8px] border border-elaya-border bg-transparent text-studio-white text-[12px] font-semibold px-3 py-1.5 cursor-pointer"
                              onClick={() => setExcModal({ studioId: id, mode: 'enable' })}
                            >
                              {copy.excEnable || 'Re-enable'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="rounded-[8px] border border-studio-amber/40 bg-transparent text-studio-amber text-[12px] font-semibold px-3 py-1.5 cursor-pointer"
                              onClick={() => {
                                setExcReason('')
                                setExcModal({ studioId: id, mode: 'disable' })
                              }}
                            >
                              {copy.excDisable || 'Disable date locks'}
                            </button>
                          )
                        ) : null}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Calculation rule */}
      <Card>
        <h3 className="m-0 text-[15px] font-semibold text-studio-white flex items-center gap-2">
          <Info size={15} className="text-studio-gold-2" />
          {copy.calcTitle || 'Calculation rule'}
        </h3>
        <ul className="m-0 mt-3 pl-5 text-[13px] text-studio-w1 leading-relaxed space-y-2">
          <li>{copy.calc1 || 'All active locks are evaluated together.'}</li>
          <li>
            {copy.calc2 ||
              'Any open condition lock fully blocks treatment (reason, no date).'}
          </li>
          <li>
            {copy.calc3 ||
              'Otherwise the earliest bookable date is the latest end date of all active date locks.'}
          </li>
        </ul>
      </Card>

      {excModal ? (
        <Modal
          title={
            excModal.mode === 'disable'
              ? copy.excDisable || 'Disable date locks'
              : copy.excEnable || 'Re-enable'
          }
          onClose={() => setExcModal(null)}
        >
          {excModal.mode === 'disable' ? (
            <>
              <p className="text-[13px] text-studio-w2 m-0 mb-3">
                {copy.excDisableWarn ||
                  'Date locks will no longer apply for this studio. Condition locks stay mandatory. Provide a reason (min. 15 characters).'}
              </p>
              <Input
                label={copy.reasonLabel || 'Reason'}
                value={excReason}
                onChange={(e) => setExcReason(e.target.value)}
              />
            </>
          ) : (
            <p className="text-[13px] text-studio-w2 m-0 mb-3">
              {copy.excEnableConfirm ||
                'Re-enable platform date locks for this studio?'}
            </p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setExcModal(null)}>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="button" onClick={applyException}>
              {t('common.confirm', { defaultValue: 'Confirm' })}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
