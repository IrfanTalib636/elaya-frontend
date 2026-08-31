import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor, Check, User, DollarSign, Clock, Grid, Users, Plus, Trash2, Pencil, CreditCard, Activity, Layers, MapPin, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Input, Button, Spinner, Select, Badge } from '../../components/ui'
import LanguageToggle from '../../components/LanguageToggle'
import useTheme from '../../hooks/useTheme'
import useAuthStore from '../../store/authStore'
import { getStudioConfig, updateStudioConfig } from '../../api/config'
import {
  getStudioSettings,
  updateStudioSettings,
  getStudioStripeStatus,
  startStudioStripeConnect,
  refreshStudioStripeConnect,
} from '../../api/studio'
import PricingConfigForm from '../../components/pricing/PricingConfigForm'
import SessionPredictionForm from '../../components/sessionPrediction/SessionPredictionForm'
import { cloneSessionPrediction } from '../../components/sessionPrediction/sessionPredictionFields'
import usePlatformConfigSocket from '../../hooks/usePlatformConfigSocket'
import {
  PRICING_GROUPS,
  PRICING_LABELS,
  pricingValuesFromConfig,
  buildStudioPricing,
} from '../../components/pricing/pricingFields'
import { ROLES } from '../../constants/roles'
import { WEEKDAYS, MITARBEITER_ROLLEN } from '../../constants/studio'
import { formatTimeRange12, fmtDateDeLong } from '../../utils/time'

const TAB_I18N = {
  appearance: 'appearance',
  profile: 'profile',
  pricing: 'prices',
  sessions: 'sessionPrediction',
  hours: 'hours',
  group: 'groupBooking',
  booking: 'bookingRules',
  locations: 'locations',
  rooms: 'rooms',
  staff: 'staff',
  stripe: 'stripe',
}

const TABS = [
  { id: 'appearance', icon: Monitor },
  { id: 'profile',    icon: User },
  { id: 'pricing',    icon: DollarSign },
  { id: 'sessions',   icon: Activity },
  { id: 'hours',      icon: Clock },
  { id: 'group',      icon: Layers },
  { id: 'booking',    icon: ShieldAlert },
  { id: 'locations',  icon: MapPin },
  { id: 'rooms',      icon: Grid },
  { id: 'staff',      icon: Users },
  { id: 'stripe',     icon: CreditCard },
]

const THEME_OPTION_META = [
  { value: 'light',  icon: Sun,     labelKey: 'theme.light',  descKey: 'settingsPage.appearance.themeLightDesc' },
  { value: 'dark',   icon: Moon,    labelKey: 'theme.dark',   descKey: 'settingsPage.appearance.themeDarkDesc' },
  { value: 'system', icon: Monitor, labelKey: 'theme.system', descKey: 'settingsPage.appearance.themeSystemDesc' },
]

// ── Theme ──────────────────────────────────────────────────────────────────
const ThemeOption = ({ value, icon: Icon, label, desc, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`flex flex-col items-start gap-2 p-4 rounded-[12px] border cursor-pointer transition-all text-left w-full ${
      active
        ? 'border-studio-gold bg-studio-gold/10 text-studio-white'
        : 'border-elaya-border bg-studio-bg-4 text-studio-w1 hover:border-elaya-border-strong hover:bg-studio-bg-5'
    }`}
  >
    <div className="flex items-center justify-between w-full">
      <Icon size={18} className={active ? 'text-studio-gold-2' : 'text-studio-w2'} />
      {active && (
        <span className="w-5 h-5 rounded-full bg-studio-gold flex items-center justify-center shrink-0">
          <Check size={11} className="text-white" />
        </span>
      )}
    </div>
    <div>
      <p className="text-[13px] font-semibold m-0">{label}</p>
      <p className={`text-[11px] m-0 mt-0.5 ${active ? 'text-studio-w2' : 'text-studio-w3'}`}>{desc}</p>
    </div>
  </button>
)

// ── Shared layout ──────────────────────────────────────────────────────────
const InfoRow = ({ label, value, children }) => {
  const { t } = useTranslation()
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-elaya-border last:border-0">
      <span className="text-studio-w2 text-[12px] shrink-0 w-36">{label}</span>
      <span className="text-studio-white text-[12px] font-medium text-right break-all">
        {children ?? (value || t('settingsPage.shared.emptyValue'))}
      </span>
    </div>
  )
}

const Section = ({
  title,
  desc,
  children,
  canEdit,
  isEditing,
  onEdit,
  saving,
  onCancel,
  onSave,
}) => {
  const { t } = useTranslation()
  return (
    <Card className="flex flex-col gap-5">
      <div className="border-b border-elaya-border pb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-studio-white m-0">{title}</h2>
          {desc && <p className="text-studio-w3 text-[12px] m-0 mt-1">{desc}</p>}
        </div>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={t('settings.edit')}
            className="shrink-0 p-2 rounded-[10px] text-studio-w2 hover:text-studio-gold-2 hover:bg-studio-bg-4 border-0 bg-transparent cursor-pointer transition-colors"
          >
            <Pencil size={15} />
          </button>
        )}
      </div>
      {children}
      {isEditing && (
        <div className="flex justify-end gap-2 pt-2 border-t border-elaya-border">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>{t('settings.cancel')}</Button>
          <Button loading={saving} onClick={onSave}>{t('settings.save')}</Button>
        </div>
      )}
    </Card>
  )
}

const ReadOnlyHint = () => {
  const { t } = useTranslation()
  return (
    <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
      {t('settingsPage.shared.readOnlyHint')}
    </p>
  )
}

const useCanEditSettings = () => {
  const role = useAuthStore((s) => s.user?.role)
  return role === ROLES.STUDIO_ADMIN
}

const staffRoleLabel = (t, rolle) => {
  const found = MITARBEITER_ROLLEN.find((r) => r.value === rolle)
  return found ? t(`settingsPage.staff.roles.${found.i18nKey}`) : rolle
}

// ── Pricing tab ────────────────────────────────────────────────────────────
const BASE_PRICE_KEYS = ['basePricePerCm2', 'minPrice', 'pmuPrice']

const PricingTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [config,   setConfig]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [coinWert, setCoinWert] = useState('')
  const [pricing,  setPricing]  = useState(() => pricingValuesFromConfig())

  const applyConfig = (cfg) => {
    setConfig(cfg)
    setCoinWert(cfg.coin_wert ?? cfg.platform_limits?.coinWert ?? '')
    setPricing(pricingValuesFromConfig(cfg.studio_pricing))
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioConfig()
      applyConfig(res.data.data.studio_config)
    } catch {
      toast.error(t('settingsPage.pricing.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const handleCancel = () => {
    if (config) applyConfig(config)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        // studio_pricing replaces the whole override set — always send every filled key.
        studio_pricing: buildStudioPricing(pricing),
      }

      const coinVal = parseFloat(coinWert)
      if (!Number.isNaN(coinVal)) payload.coin_wert = coinVal

      const res = await updateStudioConfig(payload)
      applyConfig(res.data.data.studio_config)
      setIsEditing(false)
      toast.success(t('settingsPage.pricing.toasts.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  const limits = config?.platform_limits
  const fmtPrice = (v) => (
    v !== '' && v != null
      ? t('settingsPage.pricing.priceWithCurrency', { value: v })
      : t('settingsPage.pricing.platformDefault')
  )

  const overriddenMultipliers = PRICING_GROUPS
    .flatMap((group) => group.fields)
    .filter(({ key }) => !BASE_PRICE_KEYS.includes(key) && pricing[key] !== '')

  return (
    <Section
      title={t('settingsPage.pricing.title')}
      desc={t('settingsPage.pricing.desc')}
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {!isEditing ? (
        <>
          <InfoRow label={t('settingsPage.pricing.chfPerCoin')} value={fmtPrice(coinWert)} />
          {limits && (
            <p className="text-studio-w3 text-[11px] m-0 -mt-2">
              {t('settingsPage.pricing.allowedRange', {
                min: limits.minWert,
                max: limits.maxWert,
                default: limits.coinWert,
              })}
            </p>
          )}
          <div className="h-px bg-elaya-border" />
          <InfoRow label={t('settingsPage.pricing.basePricePerCm2')} value={fmtPrice(pricing.basePricePerCm2)} />
          <InfoRow label={t('settingsPage.pricing.minPricePerSession')} value={fmtPrice(pricing.minPrice)} />
          <InfoRow label={t('settingsPage.pricing.pmuPrice')} value={fmtPrice(pricing.pmuPrice)} />
          <div className="h-px bg-elaya-border" />
          {overriddenMultipliers.length === 0 ? (
            <p className="text-studio-w2 text-[12px] m-0">
              {t('settingsPage.pricing.allMultipliersPlatformDefault')}
            </p>
          ) : (
            <div>
              <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-1">
                {t('settingsPage.pricing.adjustedMultipliers', { count: overriddenMultipliers.length })}
              </p>
              {overriddenMultipliers.map(({ key }) => (
                <InfoRow
                  key={key}
                  label={PRICING_LABELS[key]}
                  value={t('settingsPage.pricing.multiplierValue', { value: pricing[key] })}
                />
              ))}
            </div>
          )}
          <p className="text-studio-w3 text-[11px] m-0">
            {t('settingsPage.pricing.aiPricingHint')}
          </p>
        </>
      ) : (
        <>
          <div>
            <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-3">{t('settingsPage.pricing.coinSectionTitle')}</p>
            <Input
              label={t('settingsPage.pricing.chfPerCoin')}
              type="number"
              min={limits?.minWert}
              max={limits?.maxWert}
              step="0.01"
              value={coinWert}
              onChange={(e) => setCoinWert(e.target.value)}
            />
            {limits && (
              <p className="text-studio-w3 text-[11px] m-0 mt-1.5">
                {t('settingsPage.pricing.allowedRange', {
                  min: limits.minWert,
                  max: limits.maxWert,
                  default: limits.coinWert,
                })}
              </p>
            )}
          </div>

          <div className="h-px bg-elaya-border" />

          <PricingConfigForm
            values={pricing}
            defaults={config?.pricing_defaults}
            savedPricing={pricingValuesFromConfig(config?.studio_pricing)}
            onChange={(key, value) => setPricing((prev) => ({ ...prev, [key]: value }))}
          />
        </>
      )}
    </Section>
  )
}

const SessionPredictionTab = () => {
  /**
   * TEMP testing phase: studio may tweak parameters locally to see the live
   * calculator effect. Changes are NOT saved — only Admin persists platform-wide.
   * Set to false for production (view-only form).
   */
  const TEMP_STUDIO_WHAT_IF = true

  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState(null)
  const [savedBaseline, setSavedBaseline] = useState(null)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const res = await getStudioConfig()
      const next = cloneSessionPrediction(res.data.data.studio_config?.session_prediction)
      setValues(next)
      setSavedBaseline(cloneSessionPrediction(next))
    } catch {
      toast.error(t('settingsPage.sessions.toasts.loadFailed'))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  usePlatformConfigSocket({
    enabled: true,
    onSessionPredictionUpdated: () => {
      toast(t('settingsPage.sessions.toasts.adminUpdated'), { icon: '↻' })
      load({ silent: true })
    },
  })

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <Section
      title={t('settingsPage.sessions.title')}
      desc={t('settingsPage.sessions.desc')}
    >
      <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
        {TEMP_STUDIO_WHAT_IF
          ? t('settingsPage.sessions.testModeHint')
          : t('settingsPage.sessions.viewOnlyHint')}
      </p>
      {values && Object.keys(values).length > 0 ? (
        <SessionPredictionForm
          values={values}
          onChange={TEMP_STUDIO_WHAT_IF ? setValues : () => {}}
          disabled={!TEMP_STUDIO_WHAT_IF}
          savedBaseline={savedBaseline}
        />
      ) : (
        <p className="text-studio-w2 text-[12px] m-0">{t('settingsPage.sessions.noParameters')}</p>
      )}
      {TEMP_STUDIO_WHAT_IF && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setValues(cloneSessionPrediction(savedBaseline))}
          disabled={!savedBaseline}
        >
          {t('settingsPage.sessions.resetToSaved')}
        </Button>
      )}
    </Section>
  )
}

// ── Profile tab ────────────────────────────────────────────────────────────
const ProfileTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const user = useAuthStore((s) => s.user)
  const refreshProfile = useAuthStore((s) => s.refreshProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firma: '', telefon: '', strasse: '', plz: '', ort: '', land: '', notizen: '',
  })
  const [readOnly, setReadOnly] = useState({
    email: '', studio_code: '', status: '',
  })

  const defaultCountry = t('settingsPage.profile.defaultCountry')

  const applyProfile = (profile) => {
    setForm({
      firma: profile.firma ?? '',
      telefon: profile.telefon ?? '',
      strasse: profile.strasse ?? '',
      plz: profile.plz ?? '',
      ort: profile.ort ?? '',
      land: profile.land ?? defaultCountry,
      notizen: profile.notizen ?? '',
    })
    setReadOnly({
      email: profile.email ?? user?.email ?? '',
      studio_code: profile.studio_code ?? '',
      status: profile.status ?? '',
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      applyProfile(res.data.data.settings.profile)
    } catch {
      toast.error(t('settingsPage.profile.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  // applyProfile closes over defaultCountry / user — intentionally reload when those change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, t, defaultCountry])

  useEffect(() => { load() }, [load])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleCancel = async () => {
    try {
      const res = await getStudioSettings()
      applyProfile(res.data.data.settings.profile)
    } catch {
      // keep current form on error
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateStudioSettings({ profile: form })
      await refreshProfile()
      setIsEditing(false)
      toast.success(t('settingsPage.profile.toasts.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  const address = [form.strasse, form.plz, form.ort, form.land].filter(Boolean).join(', ')
  const empty = t('settingsPage.shared.emptyValue')

  return (
    <Section
      title={t('settingsPage.profile.title')}
      desc={t('settingsPage.profile.desc')}
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {!isEditing ? (
        <>
          <InfoRow label={t('settingsPage.profile.companyName')} value={form.firma} />
          <InfoRow label={t('settingsPage.profile.phone')} value={form.telefon} />
          <InfoRow label={t('settingsPage.profile.address')} value={address} />
          <InfoRow label={t('settingsPage.profile.notes')} value={form.notizen} />
          <div className="h-px bg-elaya-border" />
          <InfoRow label={t('common.email')} value={readOnly.email} />
          <InfoRow label={t('settingsPage.profile.studioCode')} value={readOnly.studio_code} />
          <InfoRow label={t('commonUi.status')}>
            {readOnly.status
              ? <Badge variant="status" value={readOnly.status}>{readOnly.status}</Badge>
              : empty}
          </InfoRow>
          <p className="text-studio-w3 text-[11px] m-0 -mt-2">
            {t('settingsPage.profile.adminOnlyFieldsHint')}
          </p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label={t('settingsPage.profile.companyName')} value={form.firma} onChange={set('firma')} />
            <Input label={t('settingsPage.profile.phone')} value={form.telefon} onChange={set('telefon')} />
            <Input label={t('settingsPage.profile.street')} value={form.strasse} onChange={set('strasse')} />
            <Input label={t('settingsPage.profile.postalCode')} value={form.plz} onChange={set('plz')} />
            <Input label={t('settingsPage.profile.city')} value={form.ort} onChange={set('ort')} />
            <Input label={t('settingsPage.profile.country')} value={form.land} onChange={set('land')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notizen" className="text-studio-white text-[12px] font-semibold">{t('settingsPage.profile.notes')}</label>
            <textarea
              id="notizen"
              rows={3}
              value={form.notizen}
              onChange={set('notizen')}
              className="w-full px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold resize-y"
            />
          </div>

          <div className="h-px bg-elaya-border" />

          <InfoRow label={t('common.email')} value={readOnly.email} />
          <InfoRow label={t('settingsPage.profile.studioCode')} value={readOnly.studio_code} />
          <InfoRow label={t('commonUi.status')}>
            {readOnly.status
              ? <Badge variant="status" value={readOnly.status}>{readOnly.status}</Badge>
              : empty}
          </InfoRow>
        </>
      )}
    </Section>
  )
}

// ── Hours tab ──────────────────────────────────────────────────────────────
const HoursTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState({})
  const [pufferzeit, setPufferzeit] = useState('10')
  const [slotInterval, setSlotInterval] = useState('60')

  const applySettings = (settings) => {
    setHours(settings.oeffnungszeiten ?? {})
    setPufferzeit(String(settings.pufferzeit_minuten ?? 10))
    setSlotInterval(String(settings.slot_interval_minuten ?? 60))
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      applySettings(res.data.data.settings)
    } catch {
      toast.error(t('settingsPage.hours.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  usePlatformConfigSocket({
    enabled: true,
    onStudioScheduleUpdated: () => {
      if (isEditing) return
      void load()
    },
  })

  const setDay = (key, field, value) =>
    setHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))

  const handleCancel = async () => {
    try {
      const res = await getStudioSettings()
      applySettings(res.data.data.settings)
    } catch {
      // keep current form on error
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const puffer = parseInt(pufferzeit, 10)
      const interval = parseInt(slotInterval, 10)
      await updateStudioSettings({
        oeffnungszeiten: hours,
        pufferzeit_minuten: Number.isNaN(puffer) ? 10 : puffer,
        slot_interval_minuten: [15, 30, 45, 60].includes(interval) ? interval : 60,
      })
      setIsEditing(false)
      toast.success(t('settingsPage.hours.toasts.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  const weekdayLabel = (key) => t(`settingsPage.hours.weekdays.${key}`)

  return (
    <div className="flex flex-col gap-5">
    <Section
      title={t('settingsPage.hours.title')}
      desc={t('settingsPage.hours.desc')}
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {!isEditing ? (
        <>
          {WEEKDAYS.map(({ key }) => {
            const day = hours[key] ?? { offen: true, von: '10:00', bis: '19:00' }
            const open = day.offen !== false
            const range = open
              ? formatTimeRange12(day.von ?? '10:00', day.bis ?? '19:00')
              : t('commonUi.closed')
            const slotHint = open
              ? (() => {
                  const slots = []
                  const toMin = (tm) => {
                    const [h, m] = String(tm || '10:00').split(':').map(Number)
                    return h * 60 + m
                  }
                  const fromMin = (n) =>
                    `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
                  let cursor = toMin(day.von ?? '10:00')
                  const end = toMin(day.bis ?? '19:00')
                  const step = Math.max(15, parseInt(slotInterval, 10) || 60)
                  while (cursor < end) {
                    slots.push(fromMin(cursor))
                    cursor += step
                  }
                  if (!slots.length) return ''
                  if (slots.length <= 4) return slots.join(', ')
                  return t('settingsPage.hours.slotPreviewTruncated', {
                    first: slots[0],
                    second: slots[1],
                    last: slots[slots.length - 1],
                    count: slots.length,
                  })
                })()
              : ''
            return (
              <InfoRow
                key={key}
                label={weekdayLabel(key)}
                value={open && slotHint ? `${range} · ${slotHint}` : range}
              />
            )
          })}
          <div className="h-px bg-elaya-border" />
          <InfoRow
            label={t('settingsPage.hours.bufferLabel')}
            value={t('settingsPage.hours.bufferValue', { minutes: pufferzeit })}
          />
          <InfoRow
            label={t('settingsPage.hours.slotIntervalLabel')}
            value={t('settingsPage.hours.slotIntervalValue', { minutes: slotInterval })}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {WEEKDAYS.map(({ key }) => {
              const day = hours[key] ?? { offen: true, von: '10:00', bis: '19:00' }
              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center gap-3 py-2.5 border-b border-elaya-border last:border-0"
                >
                  <label className="flex items-center gap-2 w-32 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.offen !== false}
                      onChange={(e) => setDay(key, 'offen', e.target.checked)}
                      className="accent-studio-gold"
                    />
                    <span className="text-studio-white text-[13px] font-medium">{weekdayLabel(key)}</span>
                  </label>
                  <Input
                    label={t('commonUi.from')}
                    type="time"
                    value={day.von ?? '10:00'}
                    onChange={(e) => setDay(key, 'von', e.target.value)}
                    disabled={day.offen === false}
                    className="max-w-[130px]"
                  />
                  <Input
                    label={t('commonUi.to')}
                    type="time"
                    value={day.bis ?? '19:00'}
                    onChange={(e) => setDay(key, 'bis', e.target.value)}
                    disabled={day.offen === false}
                    className="max-w-[130px]"
                  />
                </div>
              )
            })}
          </div>

          <div className="h-px bg-elaya-border" />

          <Input
            label={t('settingsPage.hours.bufferInputLabel')}
            type="number"
            min={0}
            max={120}
            step={1}
            value={pufferzeit}
            onChange={(e) => setPufferzeit(e.target.value)}
            hint={t('settingsPage.hours.bufferHint')}
            className="max-w-[200px]"
          />
          <Select
            label={t('settingsPage.hours.slotIntervalLabel')}
            value={slotInterval}
            onChange={(e) => setSlotInterval(e.target.value)}
            hint={t('settingsPage.hours.slotIntervalHint')}
            className="max-w-[200px]"
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="60">60</option>
          </Select>
        </>
      )}
    </Section>
    <HoursExceptions canEdit={canEdit} />
    </div>
  )
}

const EMPTY_AUSNAHME = { datum: '', bis_datum: '', offen: true, von: '10:00', bis: '19:00', notiz: '' }

const HoursExceptions = ({ canEdit }) => {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [draft, setDraft] = useState(EMPTY_AUSNAHME)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      setItems(res.data.data.settings.oeffnungs_ausnahmen ?? [])
    } catch {
      toast.error(t('settingsPage.hours.toasts.exceptionsLoadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  usePlatformConfigSocket({
    enabled: true,
    onStudioScheduleUpdated: (payload) => {
      if (payload?.schedule?.exceptions) {
        setItems(payload.schedule.exceptions)
        return
      }
      void load()
    },
  })

  const persist = async (next) => {
    setSaving(true)
    try {
      const res = await updateStudioSettings({ oeffnungs_ausnahmen: next })
      setItems(res.data.data.settings.oeffnungs_ausnahmen ?? next)
      toast.success(t('settingsPage.hours.toasts.exceptionsSaved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  const addItem = async () => {
    if (!draft.datum) {
      toast.error(t('settingsPage.hours.toasts.dateRequired'))
      return
    }
    const start = draft.datum
    const end = draft.bis_datum && draft.bis_datum >= start ? draft.bis_datum : start
    const dates = []
    for (let cursor = new Date(`${start}T12:00:00`); cursor <= new Date(`${end}T12:00:00`); cursor.setDate(cursor.getDate() + 1)) {
      const y = cursor.getFullYear()
      const m = String(cursor.getMonth() + 1).padStart(2, '0')
      const d = String(cursor.getDate()).padStart(2, '0')
      dates.push(`${y}-${m}-${d}`)
    }
    const dateSet = new Set(dates)
    const entry = {
      offen: draft.offen !== false,
      von: draft.von,
      bis: draft.bis,
      notiz: draft.notiz,
    }
    const next = [
      ...items.filter((item) => !dateSet.has(item.datum)),
      ...dates.map((datum) => ({ ...entry, datum })),
    ].sort((a, b) => a.datum.localeCompare(b.datum))
    await persist(next)
    setDraft(EMPTY_AUSNAHME)
  }

  const removeItem = async (datum) => {
    await persist(items.filter((item) => item.datum !== datum))
  }

  if (loading) return null

  return (
    <Section
      title={t('settingsPage.hours.exceptions.title')}
      desc={t('settingsPage.hours.exceptions.desc')}
    >
      {!canEdit && <ReadOnlyHint />}

      {items.length === 0 ? (
        <p className="text-studio-w3 text-[12px] m-0">{t('settingsPage.hours.exceptions.empty')}</p>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.datum}
              className="flex items-center justify-between gap-3 py-2.5 border-b border-elaya-border last:border-0"
            >
              <button
                type="button"
                onClick={() => canEdit && setDraft({
                  datum: item.datum,
                  offen: item.offen !== false,
                  von: item.von || '10:00',
                  bis: item.bis || '19:00',
                  notiz: item.notiz || '',
                })}
                className={`text-left bg-transparent border-0 p-0 ${canEdit ? 'cursor-pointer' : ''}`}
              >
                <p className="text-studio-white text-[13px] font-medium m-0">
                  {fmtDateDeLong(item.datum)}
                </p>
                <p className="text-studio-w3 text-[11px] m-0 mt-0.5">
                  {item.offen !== false
                    ? t('settingsPage.hours.exceptions.openWithRange', {
                        range: formatTimeRange12(item.von, item.bis),
                      })
                    : t('commonUi.closed')}
                  {item.notiz ? ` · ${item.notiz}` : ''}
                </p>
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => removeItem(item.datum)}
                  disabled={saving}
                  className="p-1.5 rounded-[8px] text-studio-w3 hover:text-elaya-error border-0 bg-transparent cursor-pointer"
                  aria-label={t('settingsPage.hours.exceptions.removeDayAria')}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <div className="flex flex-col gap-3 pt-2 border-t border-elaya-border">
          <p className="text-studio-w2 text-[12px] m-0">{t('settingsPage.hours.exceptions.addOrOverwrite')}</p>
          <div className="flex flex-wrap items-end gap-3">
            <Input
              label={t('settingsPage.hours.exceptions.date')}
              type="date"
              value={draft.datum}
              onChange={(e) => setDraft((prev) => ({ ...prev, datum: e.target.value }))}
              className="max-w-[180px]"
            />
            <Input
              label={t('settingsPage.hours.exceptions.dateTo')}
              type="date"
              value={draft.bis_datum}
              onChange={(e) => setDraft((prev) => ({ ...prev, bis_datum: e.target.value }))}
              className="max-w-[180px]"
            />
            <label className="flex items-center gap-2 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.offen !== false}
                onChange={(e) => setDraft((prev) => ({ ...prev, offen: e.target.checked }))}
                className="accent-studio-gold"
              />
              <span className="text-studio-white text-[13px]">{t('commonUi.open')}</span>
            </label>
            <Input
              label={t('commonUi.from')}
              type="time"
              value={draft.von}
              onChange={(e) => setDraft((prev) => ({ ...prev, von: e.target.value }))}
              disabled={draft.offen === false}
              className="max-w-[130px]"
            />
            <Input
              label={t('commonUi.to')}
              type="time"
              value={draft.bis}
              onChange={(e) => setDraft((prev) => ({ ...prev, bis: e.target.value }))}
              disabled={draft.offen === false}
              className="max-w-[130px]"
            />
            <Input
              label={t('settingsPage.hours.exceptions.note')}
              value={draft.notiz}
              onChange={(e) => setDraft((prev) => ({ ...prev, notiz: e.target.value }))}
              placeholder={t('settingsPage.hours.exceptions.notePlaceholder')}
              className="max-w-[180px]"
            />
            <Button size="sm" onClick={addItem} loading={saving} disabled={!draft.datum}>
              <Plus size={14} />
              {t('settings.save')}
            </Button>
          </div>
        </div>
      )}
    </Section>
  )
}

// ── Locations tab ──────────────────────────────────────────────────────────
const emptyStandort = () => ({
  id: undefined,
  name: '',
  strasse: '',
  plz: '',
  ort: '',
  aktiv: true,
  pufferzeit_minuten: null,
  slot_interval_minuten: null,
})

const LocationsTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [standorte, setStandorte] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      setStandorte(res.data.data.settings.standorte ?? [])
    } catch {
      toast.error(t('settingsPage.locations.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const updateStandort = (index, field, value) =>
    setStandorte((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))

  const addStandort = () => setStandorte((prev) => [...prev, emptyStandort()])

  const removeStandort = (index) =>
    setStandorte((prev) => prev.filter((_, i) => i !== index))

  const handleCancel = async () => {
    try {
      const res = await getStudioSettings()
      setStandorte(res.data.data.settings.standorte ?? [])
    } catch {
      // keep current form on error
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (standorte.some((s) => !s.name?.trim())) {
      toast.error(t('settingsPage.locations.toasts.nameRequired'))
      return
    }
    setSaving(true)
    try {
      const payload = standorte.map((s) => ({
        ...(s.id ? { id: s.id } : {}),
        name: s.name.trim(),
        strasse: s.strasse ?? '',
        plz: s.plz ?? '',
        ort: s.ort ?? '',
        aktiv: s.aktiv !== false,
        pufferzeit_minuten:
          s.pufferzeit_minuten === '' || s.pufferzeit_minuten == null
            ? null
            : Number(s.pufferzeit_minuten),
        slot_interval_minuten:
          s.slot_interval_minuten === '' || s.slot_interval_minuten == null
            ? null
            : Number(s.slot_interval_minuten),
      }))
      const res = await updateStudioSettings({ standorte: payload })
      setStandorte(res.data.data.settings.standorte ?? [])
      setIsEditing(false)
      toast.success(t('settingsPage.locations.toasts.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <Section
      title={t('settingsPage.locations.title')}
      desc={t('settingsPage.locations.desc')}
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {standorte.length === 0 && (
        <p className="text-studio-w3 text-[13px] m-0">{t('settingsPage.locations.empty')}</p>
      )}

      {!isEditing ? (
        <div className="flex flex-col gap-3">
          {standorte.map((standort) => (
            <div
              key={standort.id}
              className="p-4 rounded-[12px] border border-elaya-border bg-studio-bg-4 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-studio-white text-[13px] font-semibold">{standort.name}</span>
                {standort.aktiv === false && (
                  <Badge variant="status" value="gesperrt">
                    {t('settingsPage.locations.inactive')}
                  </Badge>
                )}
              </div>
              <p className="text-studio-w2 text-[12px] m-0">
                {[standort.strasse, [standort.plz, standort.ort].filter(Boolean).join(' ')]
                  .filter(Boolean)
                  .join(', ') || t('settingsPage.shared.emptyValue')}
              </p>
              <p className="text-studio-w3 text-[11px] m-0">
                {standort.slot_interval_minuten
                  ? t('settingsPage.locations.slotOverride', {
                      minutes: standort.slot_interval_minuten,
                    })
                  : t('settingsPage.locations.inheritsHours')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {standorte.map((standort, index) => (
              <div
                key={standort.id ?? `new-${index}`}
                className="p-4 rounded-[12px] border border-elaya-border bg-studio-bg-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-studio-white text-[13px] font-semibold">
                    {standort.name || t('settingsPage.locations.fallbackName', { index: index + 1 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStandort(index)}
                    className="p-1.5 rounded-[8px] text-studio-w2 hover:text-studio-red hover:bg-studio-red/10 border-0 bg-transparent cursor-pointer"
                    aria-label={t('settingsPage.locations.removeAria')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label={t('settingsPage.locations.name')}
                    value={standort.name}
                    onChange={(e) => updateStandort(index, 'name', e.target.value)}
                  />
                  <Input
                    label={t('settingsPage.locations.street')}
                    value={standort.strasse ?? ''}
                    onChange={(e) => updateStandort(index, 'strasse', e.target.value)}
                  />
                  <Input
                    label={t('settingsPage.locations.zip')}
                    value={standort.plz ?? ''}
                    onChange={(e) => updateStandort(index, 'plz', e.target.value)}
                  />
                  <Input
                    label={t('settingsPage.locations.city')}
                    value={standort.ort ?? ''}
                    onChange={(e) => updateStandort(index, 'ort', e.target.value)}
                  />
                  <Select
                    label={t('settingsPage.locations.slotInterval')}
                    value={standort.slot_interval_minuten ?? ''}
                    onChange={(e) =>
                      updateStandort(
                        index,
                        'slot_interval_minuten',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                  >
                    <option value="">{t('settingsPage.locations.inherit')}</option>
                    {[15, 30, 45, 60].map((minutes) => (
                      <option key={minutes} value={minutes}>{`${minutes} min`}</option>
                    ))}
                  </Select>
                  <Input
                    label={t('settingsPage.locations.buffer')}
                    type="number"
                    min={0}
                    max={120}
                    value={standort.pufferzeit_minuten ?? ''}
                    placeholder={t('settingsPage.locations.inherit')}
                    onChange={(e) =>
                      updateStandort(
                        index,
                        'pufferzeit_minuten',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                  />
                  <div className="flex items-end gap-2 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={standort.aktiv !== false}
                        onChange={(e) => updateStandort(index, 'aktiv', e.target.checked)}
                        className="accent-studio-gold"
                      />
                      <span className="text-studio-w2 text-[12px]">
                        {t('settingsPage.locations.active')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={addStandort}>
            <Plus size={14} />
            {t('settingsPage.locations.addLocation')}
          </Button>
        </>
      )}
    </Section>
  )
}

// ── Rooms tab ──────────────────────────────────────────────────────────────
const emptyRoom = () => ({
  id: undefined,
  name: '',
  farbe: '#3B8BD4',
  aktiv: true,
  laser_brand: '',
  laser_model: '',
  standort_id: '',
})

const RoomsTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rooms, setRooms] = useState([])
  const [standorte, setStandorte] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      setRooms(res.data.data.settings.behandlungsraeume ?? [])
      setStandorte(res.data.data.settings.standorte ?? [])
    } catch {
      toast.error(t('settingsPage.rooms.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const updateRoom = (index, field, value) =>
    setRooms((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))

  const addRoom = () => setRooms((prev) => [...prev, emptyRoom()])

  const removeRoom = (index) =>
    setRooms((prev) => prev.filter((_, i) => i !== index))

  const handleCancel = async () => {
    try {
      const res = await getStudioSettings()
      setRooms(res.data.data.settings.behandlungsraeume ?? [])
    } catch {
      // keep current form on error
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (rooms.some((r) => !r.name?.trim())) {
      toast.error(t('settingsPage.rooms.toasts.nameRequired'))
      return
    }
    setSaving(true)
    try {
      const payload = rooms.map(
        ({ id, name, farbe, aktiv, laser_brand, laser_model, standort_id }) => ({
          ...(id ? { id } : {}),
          name: name.trim(),
          farbe: farbe || '#3B8BD4',
          aktiv: aktiv !== false,
          laser_brand: laser_brand ?? '',
          laser_model: laser_model ?? '',
          standort_id: standort_id ?? '',
        })
      )
      const res = await updateStudioSettings({ behandlungsraeume: payload })
      setRooms(res.data.data.settings.behandlungsraeume ?? [])
      setIsEditing(false)
      toast.success(t('settingsPage.rooms.toasts.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <Section
      title={t('settingsPage.rooms.title')}
      desc={t('settingsPage.rooms.desc')}
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {rooms.length === 0 && (
        <p className="text-studio-w3 text-[13px] m-0">{t('settingsPage.rooms.empty')}</p>
      )}

      {!isEditing ? (
        <div className="flex flex-col gap-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-4 rounded-[12px] border border-elaya-border bg-studio-bg-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: room.farbe ?? '#3B8BD4' }}
                />
                <span className="text-studio-white text-[13px] font-semibold">{room.name}</span>
                {room.aktiv === false && (
                  <Badge variant="status" value="gesperrt">{t('settingsPage.rooms.inactive')}</Badge>
                )}
              </div>
              {(room.laser_brand || room.laser_model) && (
                <p className="text-studio-w2 text-[12px] m-0">
                  {[room.laser_brand, room.laser_model].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {rooms.map((room, index) => (
              <div
                key={room.id ?? `new-${index}`}
                className="p-4 rounded-[12px] border border-elaya-border bg-studio-bg-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={room.farbe ?? '#3B8BD4'}
                      onChange={(e) => updateRoom(index, 'farbe', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                      aria-label={t('settingsPage.rooms.colorAria')}
                    />
                    <span className="text-studio-white text-[13px] font-semibold">
                      {room.name || t('settingsPage.rooms.fallbackName', { index: index + 1 })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="p-1.5 rounded-[8px] text-studio-w2 hover:text-studio-red hover:bg-studio-red/10 border-0 bg-transparent cursor-pointer"
                    aria-label={t('settingsPage.rooms.removeAria')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label={t('settingsPage.rooms.name')}
                    value={room.name}
                    onChange={(e) => updateRoom(index, 'name', e.target.value)}
                  />
                  <div className="flex items-end gap-2 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.aktiv !== false}
                        onChange={(e) => updateRoom(index, 'aktiv', e.target.checked)}
                        className="accent-studio-gold"
                      />
                      <span className="text-studio-w2 text-[12px]">{t('settingsPage.rooms.active')}</span>
                    </label>
                  </div>
                  <Input
                    label={t('settingsPage.rooms.laserBrand')}
                    value={room.laser_brand ?? ''}
                    onChange={(e) => updateRoom(index, 'laser_brand', e.target.value)}
                    placeholder={t('settingsPage.rooms.laserBrandPlaceholder')}
                  />
                  <Input
                    label={t('settingsPage.rooms.laserModel')}
                    value={room.laser_model ?? ''}
                    onChange={(e) => updateRoom(index, 'laser_model', e.target.value)}
                    placeholder={t('settingsPage.rooms.laserModelPlaceholder')}
                  />
                  {standorte.length > 0 && (
                    <Select
                      label={t('settingsPage.rooms.location')}
                      value={room.standort_id ?? ''}
                      onChange={(e) => updateRoom(index, 'standort_id', e.target.value)}
                    >
                      <option value="">{t('settingsPage.rooms.allLocations')}</option>
                      {standorte
                        .filter((s) => s.aktiv !== false)
                        .map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={addRoom}>
            <Plus size={14} />
            {t('settingsPage.rooms.addRoom')}
          </Button>
        </>
      )}
    </Section>
  )
}

// ── Staff tab ──────────────────────────────────────────────────────────────
const DEFAULT_STAFF_ROLE = 'Laser-Therapeutin'

const emptyStaff = () => ({
  id: undefined,
  vorname: '',
  nachname: '',
  rolle: DEFAULT_STAFF_ROLE,
  raum_id: '',
  standort_id: '',
  aktiv: true,
})

const StaffTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staff, setStaff] = useState([])
  const [rooms, setRooms] = useState([])
  const [standorte, setStandorte] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      const settings = res.data.data.settings
      setStaff(settings.mitarbeiter ?? [])
      setRooms(settings.behandlungsraeume ?? [])
      setStandorte(settings.standorte ?? [])
    } catch {
      toast.error(t('settingsPage.staff.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const empty = t('settingsPage.shared.emptyValue')
  const roomName = (raumId) =>
    rooms.find((r) => r.id === raumId)?.name ?? empty

  const updateMember = (index, field, value) =>
    setStaff((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))

  const addMember = () => setStaff((prev) => [...prev, emptyStaff()])

  const removeMember = (index) =>
    setStaff((prev) => prev.filter((_, i) => i !== index))

  const handleCancel = async () => {
    try {
      const res = await getStudioSettings()
      const settings = res.data.data.settings
      setStaff(settings.mitarbeiter ?? [])
      setRooms(settings.behandlungsraeume ?? [])
    } catch {
      // keep current form on error
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (staff.some((m) => !m.vorname?.trim() || !m.nachname?.trim())) {
      toast.error(t('settingsPage.staff.toasts.nameRequired'))
      return
    }
    setSaving(true)
    try {
      const payload = staff.map(
        ({ id, vorname, nachname, rolle, raum_id, standort_id, aktiv }) => ({
          ...(id ? { id } : {}),
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          rolle: rolle || DEFAULT_STAFF_ROLE,
          raum_id: raum_id ?? '',
          standort_id: standort_id ?? '',
          aktiv: aktiv !== false,
        })
      )
      const res = await updateStudioSettings({ mitarbeiter: payload })
      setStaff(res.data.data.settings.mitarbeiter ?? [])
      setIsEditing(false)
      toast.success(t('settingsPage.staff.toasts.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <Section
      title={t('settingsPage.staff.title')}
      desc={t('settingsPage.staff.desc')}
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {staff.length === 0 && (
        <p className="text-studio-w3 text-[13px] m-0">{t('settingsPage.staff.empty')}</p>
      )}

      {!isEditing ? (
        <div className="flex flex-col gap-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-[12px] border border-elaya-border bg-studio-bg-4 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-studio-white text-[13px] font-semibold">
                  {`${member.vorname} ${member.nachname}`.trim()}
                </span>
                {member.aktiv === false && (
                  <Badge variant="status" value="gesperrt">{t('settingsPage.staff.inactive')}</Badge>
                )}
              </div>
              <p className="text-studio-w2 text-[12px] m-0">{staffRoleLabel(t, member.rolle)}</p>
              {member.raum_id && (
                <p className="text-studio-w3 text-[11px] m-0">
                  {t('settingsPage.staff.roomPrefix', { name: roomName(member.raum_id) })}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          {rooms.length === 0 && (
            <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2">
              {t('settingsPage.staff.roomsTip')}
            </p>
          )}

          <div className="flex flex-col gap-4">
            {staff.map((member, index) => (
              <div
                key={member.id ?? `new-${index}`}
                className="p-4 rounded-[12px] border border-elaya-border bg-studio-bg-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-studio-white text-[13px] font-semibold">
                    {member.vorname || member.nachname
                      ? `${member.vorname} ${member.nachname}`.trim()
                      : t('settingsPage.staff.fallbackName', { index: index + 1 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="p-1.5 rounded-[8px] text-studio-w2 hover:text-studio-red hover:bg-studio-red/10 border-0 bg-transparent cursor-pointer"
                    aria-label={t('settingsPage.staff.removeAria')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label={t('settingsPage.staff.firstName')}
                    value={member.vorname}
                    onChange={(e) => updateMember(index, 'vorname', e.target.value)}
                  />
                  <Input
                    label={t('settingsPage.staff.lastName')}
                    value={member.nachname}
                    onChange={(e) => updateMember(index, 'nachname', e.target.value)}
                  />
                  <Select
                    label={t('settingsPage.staff.role')}
                    value={member.rolle ?? DEFAULT_STAFF_ROLE}
                    onChange={(e) => updateMember(index, 'rolle', e.target.value)}
                  >
                    {MITARBEITER_ROLLEN.map(({ value, i18nKey }) => (
                      <option key={value} value={value}>
                        {t(`settingsPage.staff.roles.${i18nKey}`)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label={t('settingsPage.staff.room')}
                    value={member.raum_id ?? ''}
                    onChange={(e) => updateMember(index, 'raum_id', e.target.value)}
                  >
                    <option value="">{t('settingsPage.staff.noRoom')}</option>
                    {rooms.filter((r) => r.aktiv !== false).map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Select>
                  {standorte.length > 0 && (
                    <Select
                      label={t('settingsPage.staff.location')}
                      value={member.standort_id ?? ''}
                      onChange={(e) => updateMember(index, 'standort_id', e.target.value)}
                    >
                      <option value="">{t('settingsPage.staff.allLocations')}</option>
                      {standorte
                        .filter((s) => s.aktiv !== false)
                        .map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Select>
                  )}
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.aktiv !== false}
                        onChange={(e) => updateMember(index, 'aktiv', e.target.checked)}
                        className="accent-studio-gold"
                      />
                      <span className="text-studio-w2 text-[12px]">{t('settingsPage.staff.active')}</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={addMember}>
            <Plus size={14} />
            {t('settingsPage.staff.addStaff')}
          </Button>
        </>
      )}
    </Section>
  )
}

// ── Stripe Connect tab ─────────────────────────────────────────────────────
const StripeTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioStripeStatus()
      setStatus(res.data.data)
    } catch {
      toast.error(t('settingsPage.stripe.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const flag = searchParams.get('stripe')
    if (flag === 'return' || flag === 'refresh') {
      ;(async () => {
        try {
          await refreshStudioStripeConnect()
          toast.success(t('settingsPage.stripe.toasts.statusUpdated'))
          load()
        } catch {
          /* ignore */
        }
      })()
    }
  }, [searchParams, load, t])

  const connect = async () => {
    if (!canEdit) return
    setBusy(true)
    try {
      const res = await startStudioStripeConnect()
      const url = res.data.data?.url
      if (!url) throw new Error('No onboarding URL')
      window.location.href = url
    } catch (err) {
      toast.error(err?.response?.data?.message || t('settingsPage.stripe.toasts.connectFailed'))
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <Section
      title={t('settingsPage.stripe.title')}
      desc={t('settingsPage.stripe.desc')}
    >
      {!status?.stripe_enabled ? (
        <p className="text-studio-w2 text-[13px] m-0">
          {t('settingsPage.stripe.notConfigured')}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="status" value={status.onboarding_complete ? 'aktiv' : 'ausstehend'}>
              {status.onboarding_complete
                ? t('settingsPage.stripe.onboardingComplete')
                : t('settingsPage.stripe.onboardingOpen')}
            </Badge>
            {status.stripe_test_mode ? (
              <Badge>{t('settingsPage.stripe.testMode')}</Badge>
            ) : null}
          </div>
          <div className="text-[13px] text-studio-w2 space-y-1">
            <p className="m-0">
              {t('settingsPage.stripe.accountLabel')}{' '}
              <span className="font-mono text-studio-w1">
                {status.account_id || t('settingsPage.stripe.notConnected')}
              </span>
            </p>
            <p className="m-0">
              {t('settingsPage.stripe.chargesPayouts', {
                charges: status.charges_enabled ? t('commonUi.yes') : t('commonUi.no'),
                payouts: status.payouts_enabled ? t('commonUi.yes') : t('commonUi.no'),
              })}
            </p>
          </div>
          {canEdit ? (
            <div className="flex gap-2">
              <Button disabled={busy} onClick={connect}>
                {status.account_id
                  ? t('settingsPage.stripe.continueOnboarding')
                  : t('settingsPage.stripe.connectWithStripe')}
              </Button>
              <Button variant="secondary" disabled={busy} onClick={load}>
                {t('settingsPage.stripe.refreshStatus')}
              </Button>
            </div>
          ) : (
            <p className="text-studio-w3 text-[12px] m-0">{t('settingsPage.stripe.adminOnly')}</p>
          )}
          <p className="text-studio-w4 text-[11px] m-0">
            {t('settingsPage.stripe.testModeHint')}
          </p>
        </div>
      )}
    </Section>
  )
}

// Placeholders only: `applyConfig` replaces these with server values on load,
// so no group-booking number is ever hardcoded in the client.
const EMPTY_GROUP = {
  klein_max_cm2: '',
  mittelgross_max_cm2: '',
  max_punkte: '',
  gruppen_rabatt_pct: '',
}

/**
 * One size tier in the group-booking panel: name, its point cost and the area
 * range it covers.
 */
const SizeCategoryHeader = ({ name, points, range }) => (
  <div className="flex items-baseline justify-between gap-3">
    <div className="flex items-baseline gap-2">
      <span className="text-studio-white text-[12px] font-semibold">{name}</span>
      <span className="text-studio-gold-2 text-[11px] font-medium whitespace-nowrap">{points}</span>
    </div>
    <span className="text-studio-w3 text-[11px] whitespace-nowrap">{range}</span>
  </div>
)

const GroupBookingTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_GROUP)

  // Points per tier come from the server too, so the labels below cannot drift
  // from the values the booking validation actually applies.
  const [punkte, setPunkte] = useState(null)

  const applyConfig = (cfg) => {
    // Fall back to the platform defaults the server ships, never to literals.
    const defaults = cfg?.gruppen_groessen_defaults ?? {}
    const gg = { ...defaults, ...(cfg?.gruppen_groessen ?? {}) }
    setPunkte(cfg?.gruppen_punkte ?? null)
    setForm({
      klein_max_cm2: gg.klein_max_cm2 ?? '',
      mittelgross_max_cm2: gg.mittelgross_max_cm2 ?? '',
      max_punkte: gg.max_punkte ?? '',
      gruppen_rabatt_pct:
        gg.gruppen_rabatt == null ? '' : Math.round(gg.gruppen_rabatt * 100),
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioConfig()
      applyConfig(res.data.data.studio_config)
    } catch {
      toast.error(t('settings.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  /** "2 Punkte" for a tier, or nothing until the server has told us the value. */
  const pointsLabel = (kategorie) => {
    const value = punkte?.[kategorie]
    return value == null ? '' : t('settingsPage.groupBooking.points', { count: value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const klein = Number(form.klein_max_cm2)
      const mittel = Number(form.mittelgross_max_cm2)
      const maxPts = Number(form.max_punkte)
      const pct = Number(form.gruppen_rabatt_pct)
      const res = await updateStudioConfig({
        gruppen_groessen: {
          klein_max_cm2: klein,
          mittelgross_max_cm2: mittel,
          max_punkte: maxPts,
          ...(Number.isNaN(pct) ? {} : { gruppen_rabatt: pct / 100 }),
        },
      })
      applyConfig(res.data.data.studio_config)
      setIsEditing(false)
      toast.success(t('settings.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settings.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <Section
      title={t('settingsPage.groupBooking.title')}
      desc={t('settingsPage.groupBooking.desc')}
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={() => { setIsEditing(false); load() }}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {/* All three tiers are always listed, so it is obvious that a case can
          only ever be small, medium or large — and what each costs in points. */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <SizeCategoryHeader
            name={t('settingsPage.groupBooking.categorySmall')}
            points={pointsLabel('klein')}
            range={t('settingsPage.groupBooking.rangeUpTo', { max: form.klein_max_cm2 })}
          />
          {isEditing ? (
            <Input
              label={t('settingsPage.groupBooking.smallUpTo')}
              type="number"
              min={1}
              value={form.klein_max_cm2}
              onChange={setField('klein_max_cm2')}
            />
          ) : (
            <InfoRow
              label={t('settingsPage.groupBooking.smallUpTo')}
              value={`${form.klein_max_cm2} cm²`}
            />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SizeCategoryHeader
            name={t('settingsPage.groupBooking.categoryMedium')}
            points={pointsLabel('mittelgross')}
            range={t('settingsPage.groupBooking.rangeBetween', {
              min: form.klein_max_cm2,
              max: form.mittelgross_max_cm2,
            })}
          />
          {isEditing ? (
            <Input
              label={t('settingsPage.groupBooking.mediumUpTo')}
              type="number"
              min={1}
              value={form.mittelgross_max_cm2}
              onChange={setField('mittelgross_max_cm2')}
            />
          ) : (
            <InfoRow
              label={t('settingsPage.groupBooking.mediumUpTo')}
              value={`${form.mittelgross_max_cm2} cm²`}
            />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SizeCategoryHeader
            name={t('settingsPage.groupBooking.categoryLarge')}
            points={pointsLabel('gross')}
            range={t('settingsPage.groupBooking.rangeAbove', { min: form.mittelgross_max_cm2 })}
          />
          {isEditing ? (
            // Large starts exactly where medium ends, so this edits the same
            // stored threshold. Keeping one value avoids an unreachable gap
            // between the tiers.
            <Input
              label={t('settingsPage.groupBooking.largeFrom')}
              type="number"
              min={1}
              value={form.mittelgross_max_cm2}
              onChange={setField('mittelgross_max_cm2')}
              hint={t('settingsPage.groupBooking.boundaryHint')}
            />
          ) : (
            <InfoRow
              label={t('settingsPage.groupBooking.largeFrom')}
              value={`> ${form.mittelgross_max_cm2} cm²`}
            />
          )}
          <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
            {t('settingsPage.groupBooking.largeNote')}
          </p>
        </div>

        <div className="border-t border-elaya-border pt-4">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('settingsPage.groupBooking.maxPoints')}
                type="number"
                min={1}
                max={16}
                value={form.max_punkte}
                onChange={setField('max_punkte')}
              />
              <Input
                label={t('settingsPage.groupBooking.discount')}
                type="number"
                min={0}
                max={100}
                value={form.gruppen_rabatt_pct}
                onChange={setField('gruppen_rabatt_pct')}
                hint={t('settingsPage.groupBooking.discountHint')}
              />
            </div>
          ) : (
            <>
              <InfoRow
                label={t('settingsPage.groupBooking.maxPoints')}
                value={String(form.max_punkte)}
              />
              <InfoRow
                label={t('settingsPage.groupBooking.discount')}
                value={`${form.gruppen_rabatt_pct} %`}
              />
            </>
          )}
        </div>

        <p className="text-studio-w3 text-[11px] m-0">
          {t('settingsPage.groupBooking.pointsFixedHint')}
        </p>
      </div>
    </Section>
  )
}

/**
 * Blocking periods and appointment settings. Every value here drives the
 * customer booking flow, so nothing about wait times or durations is hardcoded
 * in the apps.
 */
const SPERRFRIST_FIELDS = [
  { key: 'same_case_tage',            i18n: 'sameCase' },
  { key: 'cross_case_tage',           i18n: 'crossCase' },
  { key: 'uv_mittel_tage',            i18n: 'uvModerate' },
  { key: 'uv_intensiv_tage',          i18n: 'uvIntense' },
  { key: 'medikament_kurz_tage',      i18n: 'medShort' },
  { key: 'medikament_retinoide_tage', i18n: 'medRetinoids' },
]

const TERMIN_FIELDS = [
  { key: 'behandlung_dauer_minuten', i18n: 'treatmentDuration',  unit: 'minutes' },
  { key: 'beratung_dauer_minuten',   i18n: 'consultDuration',    unit: 'minutes' },
  { key: 'gruppen_dauer_minuten',    i18n: 'groupDuration',      unit: 'minutes' },
  { key: 'buchung_horizont_tage',    i18n: 'horizon',            unit: 'days', min: 1 },
  { key: 'min_vorlaufzeit_stunden',  i18n: 'leadTime',           unit: 'hours' },
]

const BookingRulesTab = () => {
  const { t } = useTranslation()
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sperren, setSperren] = useState({})
  const [termine, setTermine] = useState({})

  const applyConfig = (cfg) => {
    // Defaults come from the server so the UI never invents a fallback.
    setSperren({ ...(cfg?.sperrfristen_defaults ?? {}), ...(cfg?.sperrfristen ?? {}) })
    setTermine({
      ...(cfg?.termin_einstellungen_defaults ?? {}),
      ...(cfg?.termin_einstellungen ?? {}),
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioConfig()
      applyConfig(res.data.data.studio_config)
    } catch {
      toast.error(t('settings.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const toNumbers = (fields, values) =>
    Object.fromEntries(
      fields
        .map(({ key }) => [key, Number(values[key])])
        .filter(([, value]) => Number.isFinite(value))
    )

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateStudioConfig({
        sperrfristen: toNumbers(SPERRFRIST_FIELDS, sperren),
        termin_einstellungen: toNumbers(TERMIN_FIELDS, termine),
      })
      applyConfig(res.data.data.studio_config)
      setIsEditing(false)
      toast.success(t('settings.saved'))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settings.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  const unitLabel = (unit = 'days') => t(`settingsPage.bookingRules.units.${unit}`)

  const renderFields = (fields, values, setValues, group) =>
    isEditing ? (
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ key, i18n, unit, min }) => (
          <Input
            key={key}
            label={t(`settingsPage.bookingRules.${group}.${i18n}`)}
            type="number"
            min={min ?? 0}
            value={values[key] ?? ''}
            hint={unitLabel(unit)}
            onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
          />
        ))}
      </div>
    ) : (
      <>
        {fields.map(({ key, i18n, unit }) => (
          <InfoRow
            key={key}
            label={t(`settingsPage.bookingRules.${group}.${i18n}`)}
            value={`${values[key] ?? '—'} ${unitLabel(unit)}`}
          />
        ))}
      </>
    )

  return (
    <Section
      title={t('settingsPage.bookingRules.title')}
      desc={t('settingsPage.bookingRules.desc')}
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={() => { setIsEditing(false); load() }}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}
      <h4 className="text-studio-white text-[13px] font-semibold m-0 mt-1">
        {t('settingsPage.bookingRules.lockoutsTitle')}
      </h4>
      {renderFields(SPERRFRIST_FIELDS, sperren, setSperren, 'lockouts')}
      <h4 className="text-studio-white text-[13px] font-semibold m-0 mt-3">
        {t('settingsPage.bookingRules.appointmentsTitle')}
      </h4>
      {renderFields(TERMIN_FIELDS, termine, setTermine, 'appointments')}
    </Section>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
const StudioSettings = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    TABS.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : 'appearance'
  )
  const { preference, setPreference } = useTheme()

  const themeOptions = useMemo(
    () => THEME_OPTION_META.map((opt) => ({
      ...opt,
      label: t(opt.labelKey),
      desc: t(opt.descKey),
    })),
    [t],
  )

  useEffect(() => {
    if (tabFromUrl && TABS.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const selectTab = (id) => {
    setActiveTab(id)
    setSearchParams(id === 'appearance' ? {} : { tab: id })
  }

  return (
    // Pricing needs the extra width for its live calculator column; the other
    // tabs stay narrow so form rows don't stretch into unreadable lines.
    <div className={`p-6 ${activeTab === 'pricing' ? 'max-w-[1240px]' : 'max-w-[860px]'}`}>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="flex gap-6">
        <nav className="flex flex-col gap-0.5 w-44 shrink-0" translate="no">
          {TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors w-full text-left cursor-pointer border-0 ${
                activeTab === id
                  ? 'bg-(--nav-active-bg) text-studio-gold-2'
                  : 'bg-transparent text-studio-w1 hover:text-studio-white hover:bg-studio-bg-4'
              }`}
            >
              <Icon size={14} className="shrink-0" />
              {t(`settings.tabs.${TAB_I18N[id]}`)}
            </button>
          ))}
        </nav>

        <div className="flex-1 flex flex-col gap-5">
          {activeTab === 'appearance' && (
            <Section title={t('theme.title')} desc={t('theme.desc')}>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((opt) => (
                  <ThemeOption
                    key={opt.value}
                    value={opt.value}
                    icon={opt.icon}
                    label={opt.label}
                    desc={opt.desc}
                    active={preference === opt.value}
                    onSelect={setPreference}
                  />
                ))}
              </div>
              <LanguageToggle />
              <p className="text-studio-w4 text-[11px] m-0">
                {t('settingsPage.appearance.deviceNote')}
              </p>
            </Section>
          )}

          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'pricing' && <PricingTab />}
          {activeTab === 'sessions' && <SessionPredictionTab />}
          {activeTab === 'hours'   && <HoursTab />}
          {activeTab === 'group'   && <GroupBookingTab />}
          {activeTab === 'booking' && <BookingRulesTab />}
          {activeTab === 'locations' && <LocationsTab />}
          {activeTab === 'rooms'   && <RoomsTab />}
          {activeTab === 'staff'   && <StaffTab />}
          {activeTab === 'stripe'  && <StripeTab />}
        </div>
      </div>
    </div>
  )
}

export default StudioSettings
