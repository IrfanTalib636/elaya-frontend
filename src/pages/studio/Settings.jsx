import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sun, Moon, Monitor, Check, User, DollarSign, Clock, Grid, Users, Plus, Trash2, Pencil, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Input, Button, Spinner, Select, Badge } from '../../components/ui'
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
import {
  PRICING_GROUPS,
  PRICING_LABELS,
  pricingValuesFromConfig,
  buildStudioPricing,
} from '../../components/pricing/pricingFields'
import { ROLES } from '../../constants/roles'
import { WEEKDAYS, MITARBEITER_ROLLEN } from '../../constants/studio'
import { formatTimeRange12, fmtDateDeLong } from '../../utils/time'

// ── Theme ──────────────────────────────────────────────────────────────────
const THEME_OPTIONS = [
  { value: 'light',  icon: Sun,     label: 'Hell',   desc: 'Heller Hintergrund'      },
  { value: 'dark',   icon: Moon,    label: 'Dunkel', desc: 'Dunkler Hintergrund'      },
  { value: 'system', icon: Monitor, label: 'System', desc: 'Folgt Systemeinstellung'  },
]

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
const InfoRow = ({ label, value, children }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-elaya-border last:border-0">
    <span className="text-studio-w2 text-[12px] shrink-0 w-36">{label}</span>
    <span className="text-studio-white text-[12px] font-medium text-right break-all">
      {children ?? (value || '—')}
    </span>
  </div>
)

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
}) => (
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
          aria-label="Bearbeiten"
          className="shrink-0 p-2 rounded-[10px] text-studio-w2 hover:text-studio-gold-2 hover:bg-studio-bg-4 border-0 bg-transparent cursor-pointer transition-colors"
        >
          <Pencil size={15} />
        </button>
      )}
    </div>
    {children}
    {isEditing && (
      <div className="flex justify-end gap-2 pt-2 border-t border-elaya-border">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Abbrechen</Button>
        <Button loading={saving} onClick={onSave}>Speichern</Button>
      </div>
    )}
  </Card>
)

const ReadOnlyHint = () => (
  <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
    Nur Studio-Administratoren können Einstellungen ändern.
  </p>
)

// ── Tabs ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'appearance', icon: Monitor,     label: 'Darstellung'    },
  { id: 'profile',    icon: User,        label: 'Studio-Profil'  },
  { id: 'pricing',    icon: DollarSign,  label: 'Preise'         },
  { id: 'hours',      icon: Clock,       label: 'Öffnungszeiten' },
  { id: 'rooms',      icon: Grid,        label: 'Räume'          },
  { id: 'staff',      icon: Users,       label: 'Mitarbeiter'    },
  { id: 'stripe',     icon: CreditCard,  label: 'Stripe'         },
]

const useCanEditSettings = () => {
  const role = useAuthStore((s) => s.user?.role)
  return role === ROLES.STUDIO_ADMIN
}

// ── Pricing tab ────────────────────────────────────────────────────────────
const BASE_PRICE_KEYS = ['basePricePerCm2', 'minPrice', 'pmuPrice']

const PricingTab = () => {
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
      toast.error('Konfiguration konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

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
      toast.success('Preise gespeichert.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  const limits = config?.platform_limits
  const fmtPrice = (v) => (v !== '' && v != null ? `CHF ${v}` : 'Plattform-Standard')

  const overriddenMultipliers = PRICING_GROUPS
    .flatMap((group) => group.fields)
    .filter(({ key }) => !BASE_PRICE_KEYS.includes(key) && pricing[key] !== '')

  return (
    <Section
      title="Preise & Elaycoin"
      desc="Studio-spezifische Preisanpassungen. Plattform-Standardwerte gelten, wenn kein Wert gesetzt ist."
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
          <InfoRow label="CHF pro Coin" value={fmtPrice(coinWert)} />
          {limits && (
            <p className="text-studio-w3 text-[11px] m-0 -mt-2">
              Erlaubter Bereich: CHF {limits.minWert} – CHF {limits.maxWert}
              &nbsp;·&nbsp;Plattform-Standard: CHF {limits.coinWert}
            </p>
          )}
          <div className="h-px bg-elaya-border" />
          <InfoRow label="Basispreis / cm²" value={fmtPrice(pricing.basePricePerCm2)} />
          <InfoRow label="Mindestpreis / Sitzung" value={fmtPrice(pricing.minPrice)} />
          <InfoRow label="PMU-Preis" value={fmtPrice(pricing.pmuPrice)} />
          <div className="h-px bg-elaya-border" />
          {overriddenMultipliers.length === 0 ? (
            <p className="text-studio-w2 text-[12px] m-0">
              Alle Multiplikatoren (Farbe, Tiefe, Alter…) verwenden den Plattform-Standard.
            </p>
          ) : (
            <div>
              <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-1">
                Angepasste Multiplikatoren ({overriddenMultipliers.length})
              </p>
              {overriddenMultipliers.map(({ key }) => (
                <InfoRow key={key} label={PRICING_LABELS[key]} value={`× ${pricing[key]}`} />
              ))}
            </div>
          )}
          <p className="text-studio-w3 text-[11px] m-0">
            Diese Werte steuern die KI-Preisberechnung und die Sitzungsschätzung für die Kunden
            dieses Studios.
          </p>
        </>
      ) : (
        <>
          <div>
            <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-3">Elaycoin-Wert</p>
            <Input
              label="CHF pro Coin"
              type="number"
              min={limits?.minWert}
              max={limits?.maxWert}
              step="0.01"
              value={coinWert}
              onChange={(e) => setCoinWert(e.target.value)}
            />
            {limits && (
              <p className="text-studio-w3 text-[11px] m-0 mt-1.5">
                Erlaubter Bereich: CHF {limits.minWert} – CHF {limits.maxWert}
                &nbsp;·&nbsp;Plattform-Standard: CHF {limits.coinWert}
              </p>
            )}
          </div>

          <div className="h-px bg-elaya-border" />

          <PricingConfigForm
            values={pricing}
            defaults={config?.pricing_defaults}
            onChange={(key, value) => setPricing((prev) => ({ ...prev, [key]: value }))}
          />
        </>
      )}
    </Section>
  )
}

// ── Profile tab ────────────────────────────────────────────────────────────
const ProfileTab = () => {
  const canEdit = useCanEditSettings()
  const user = useAuthStore((s) => s.user)
  const refreshProfile = useAuthStore((s) => s.refreshProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firma: '', telefon: '', strasse: '', plz: '', ort: '', land: 'Schweiz', notizen: '',
  })
  const [readOnly, setReadOnly] = useState({
    email: '', studio_code: '', status: '',
  })

  const applyProfile = (profile) => {
    setForm({
      firma: profile.firma ?? '',
      telefon: profile.telefon ?? '',
      strasse: profile.strasse ?? '',
      plz: profile.plz ?? '',
      ort: profile.ort ?? '',
      land: profile.land ?? 'Schweiz',
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
      toast.error('Profil konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

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
      toast.success('Profil gespeichert.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  const address = [form.strasse, form.plz, form.ort, form.land].filter(Boolean).join(', ')

  return (
    <Section
      title="Studio-Profil"
      desc="Kontakt- und Standortdaten des Studios."
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
          <InfoRow label="Firmenname" value={form.firma} />
          <InfoRow label="Telefon" value={form.telefon} />
          <InfoRow label="Adresse" value={address} />
          <InfoRow label="Notizen" value={form.notizen} />
          <div className="h-px bg-elaya-border" />
          <InfoRow label="E-Mail" value={readOnly.email} />
          <InfoRow label="Studio-Code" value={readOnly.studio_code} />
          <InfoRow label="Status">
            {readOnly.status
              ? <Badge variant="status" value={readOnly.status}>{readOnly.status}</Badge>
              : '—'}
          </InfoRow>
          <p className="text-studio-w3 text-[11px] m-0 -mt-2">
            E-Mail, Studio-Code und Status können nur vom Elaya-Administrator geändert werden.
          </p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Firmenname" value={form.firma} onChange={set('firma')} />
            <Input label="Telefon" value={form.telefon} onChange={set('telefon')} />
            <Input label="Strasse" value={form.strasse} onChange={set('strasse')} />
            <Input label="PLZ" value={form.plz} onChange={set('plz')} />
            <Input label="Ort" value={form.ort} onChange={set('ort')} />
            <Input label="Land" value={form.land} onChange={set('land')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notizen" className="text-studio-white text-[12px] font-semibold">Notizen</label>
            <textarea
              id="notizen"
              rows={3}
              value={form.notizen}
              onChange={set('notizen')}
              className="w-full px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold resize-y"
            />
          </div>

          <div className="h-px bg-elaya-border" />

          <InfoRow label="E-Mail" value={readOnly.email} />
          <InfoRow label="Studio-Code" value={readOnly.studio_code} />
          <InfoRow label="Status">
            {readOnly.status
              ? <Badge variant="status" value={readOnly.status}>{readOnly.status}</Badge>
              : '—'}
          </InfoRow>
        </>
      )}
    </Section>
  )
}

// ── Hours tab ──────────────────────────────────────────────────────────────
const HoursTab = () => {
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState({})
  const [pufferzeit, setPufferzeit] = useState('10')

  const applySettings = (settings) => {
    setHours(settings.oeffnungszeiten ?? {})
    setPufferzeit(String(settings.pufferzeit_minuten ?? 10))
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      applySettings(res.data.data.settings)
    } catch {
      toast.error('Öffnungszeiten konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

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
      await updateStudioSettings({
        oeffnungszeiten: hours,
        pufferzeit_minuten: Number.isNaN(puffer) ? 10 : puffer,
      })
      setIsEditing(false)
      toast.success('Öffnungszeiten gespeichert.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="flex flex-col gap-5">
    <Section
      title="Öffnungszeiten"
      desc="Wöchentliches Schema. Einzelne Tage (extra öffnen oder schliessen) stehen darunter."
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
          {WEEKDAYS.map(({ key, label }) => {
            const day = hours[key] ?? { offen: true, von: '10:00', bis: '19:00' }
            return (
              <InfoRow
                key={key}
                label={label}
                value={day.offen !== false
                  ? formatTimeRange12(day.von ?? '10:00', day.bis ?? '19:00')
                  : 'Geschlossen'}
              />
            )
          })}
          <div className="h-px bg-elaya-border" />
          <InfoRow label="Pufferzeit" value={`${pufferzeit} Min.`} />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {WEEKDAYS.map(({ key, label }) => {
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
                    <span className="text-studio-white text-[13px] font-medium">{label}</span>
                  </label>
                  <Input
                    label="Von"
                    type="time"
                    value={day.von ?? '10:00'}
                    onChange={(e) => setDay(key, 'von', e.target.value)}
                    disabled={day.offen === false}
                    className="max-w-[130px]"
                  />
                  <Input
                    label="Bis"
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
            label="Pufferzeit nach Terminen (Minuten)"
            type="number"
            min={0}
            max={120}
            step={1}
            value={pufferzeit}
            onChange={(e) => setPufferzeit(e.target.value)}
            hint="Zeit zwischen aufeinanderfolgenden Terminen."
            className="max-w-[200px]"
          />
        </>
      )}
    </Section>
    <HoursExceptions canEdit={canEdit} />
    </div>
  )
}

const EMPTY_AUSNAHME = { datum: '', offen: true, von: '10:00', bis: '19:00', notiz: '' }

const HoursExceptions = ({ canEdit }) => {
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
      toast.error('Einzelne Tage konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const persist = async (next) => {
    setSaving(true)
    try {
      const res = await updateStudioSettings({ oeffnungs_ausnahmen: next })
      setItems(res.data.data.settings.oeffnungs_ausnahmen ?? next)
      toast.success('Verfügbare Tage gespeichert.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  const addItem = async () => {
    if (!draft.datum) {
      toast.error('Bitte ein Datum wählen.')
      return
    }
    const next = [
      ...items.filter((item) => item.datum !== draft.datum),
      { ...draft, offen: draft.offen !== false },
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
      title="Einzelne Tage"
      desc="Zusätzliche Öffnungstage oder geschlossene Tage (z. B. Feiertage) — unabhängig vom Wochenschema."
    >
      {!canEdit && <ReadOnlyHint />}

      {items.length === 0 ? (
        <p className="text-studio-w3 text-[12px] m-0">Noch keine einzelnen Tage hinterlegt.</p>
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
                    ? `Geöffnet ${formatTimeRange12(item.von, item.bis)}`
                    : 'Geschlossen'}
                  {item.notiz ? ` · ${item.notiz}` : ''}
                </p>
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => removeItem(item.datum)}
                  disabled={saving}
                  className="p-1.5 rounded-[8px] text-studio-w3 hover:text-elaya-error border-0 bg-transparent cursor-pointer"
                  aria-label="Tag entfernen"
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
          <p className="text-studio-w2 text-[12px] m-0">Tag hinzufügen oder überschreiben</p>
          <div className="flex flex-wrap items-end gap-3">
            <Input
              label="Datum"
              type="date"
              value={draft.datum}
              onChange={(e) => setDraft((prev) => ({ ...prev, datum: e.target.value }))}
              className="max-w-[180px]"
            />
            <label className="flex items-center gap-2 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.offen !== false}
                onChange={(e) => setDraft((prev) => ({ ...prev, offen: e.target.checked }))}
                className="accent-studio-gold"
              />
              <span className="text-studio-white text-[13px]">Geöffnet</span>
            </label>
            <Input
              label="Von"
              type="time"
              value={draft.von}
              onChange={(e) => setDraft((prev) => ({ ...prev, von: e.target.value }))}
              disabled={draft.offen === false}
              className="max-w-[130px]"
            />
            <Input
              label="Bis"
              type="time"
              value={draft.bis}
              onChange={(e) => setDraft((prev) => ({ ...prev, bis: e.target.value }))}
              disabled={draft.offen === false}
              className="max-w-[130px]"
            />
            <Input
              label="Notiz"
              value={draft.notiz}
              onChange={(e) => setDraft((prev) => ({ ...prev, notiz: e.target.value }))}
              placeholder="z. B. Feiertag"
              className="max-w-[180px]"
            />
            <Button size="sm" onClick={addItem} loading={saving} disabled={!draft.datum}>
              <Plus size={14} />
              Speichern
            </Button>
          </div>
        </div>
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
})

const RoomsTab = () => {
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rooms, setRooms] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      setRooms(res.data.data.settings.behandlungsraeume ?? [])
    } catch {
      toast.error('Räume konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

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
      toast.error('Jeder Raum braucht einen Namen.')
      return
    }
    setSaving(true)
    try {
      const payload = rooms.map(({ id, name, farbe, aktiv, laser_brand, laser_model }) => ({
        ...(id ? { id } : {}),
        name: name.trim(),
        farbe: farbe || '#3B8BD4',
        aktiv: aktiv !== false,
        laser_brand: laser_brand ?? '',
        laser_model: laser_model ?? '',
      }))
      const res = await updateStudioSettings({ behandlungsraeume: payload })
      setRooms(res.data.data.settings.behandlungsraeume ?? [])
      setIsEditing(false)
      toast.success('Räume gespeichert.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <Section
      title="Räume & Geräte"
      desc="Behandlungsräume und Laser-Geräte für Kalender und Sitzungen."
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {rooms.length === 0 && (
        <p className="text-studio-w3 text-[13px] m-0">Noch keine Räume angelegt.</p>
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
                  <Badge variant="status" value="gesperrt">Inaktiv</Badge>
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
                      aria-label="Raumfarbe"
                    />
                    <span className="text-studio-white text-[13px] font-semibold">
                      {room.name || `Raum ${index + 1}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="p-1.5 rounded-[8px] text-studio-w2 hover:text-studio-red hover:bg-studio-red/10 border-0 bg-transparent cursor-pointer"
                    aria-label="Raum entfernen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Name"
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
                      <span className="text-studio-w2 text-[12px]">Aktiv</span>
                    </label>
                  </div>
                  <Input
                    label="Laser-Marke"
                    value={room.laser_brand ?? ''}
                    onChange={(e) => updateRoom(index, 'laser_brand', e.target.value)}
                    placeholder="z. B. Candela"
                  />
                  <Input
                    label="Laser-Modell"
                    value={room.laser_model ?? ''}
                    onChange={(e) => updateRoom(index, 'laser_model', e.target.value)}
                    placeholder="z. B. GentleMax Pro"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={addRoom}>
            <Plus size={14} />
            Raum hinzufügen
          </Button>
        </>
      )}
    </Section>
  )
}

// ── Staff tab ──────────────────────────────────────────────────────────────
const emptyStaff = () => ({
  id: undefined,
  vorname: '',
  nachname: '',
  rolle: 'Laser-Therapeutin',
  raum_id: '',
  aktiv: true,
})

const StaffTab = () => {
  const canEdit = useCanEditSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staff, setStaff] = useState([])
  const [rooms, setRooms] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioSettings()
      const settings = res.data.data.settings
      setStaff(settings.mitarbeiter ?? [])
      setRooms(settings.behandlungsraeume ?? [])
    } catch {
      toast.error('Mitarbeiter konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const roomName = (raumId) =>
    rooms.find((r) => r.id === raumId)?.name ?? '—'

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
      toast.error('Vor- und Nachname sind Pflichtfelder.')
      return
    }
    setSaving(true)
    try {
      const payload = staff.map(({ id, vorname, nachname, rolle, raum_id, aktiv }) => ({
        ...(id ? { id } : {}),
        vorname: vorname.trim(),
        nachname: nachname.trim(),
        rolle: rolle || 'Laser-Therapeutin',
        raum_id: raum_id ?? '',
        aktiv: aktiv !== false,
      }))
      const res = await updateStudioSettings({ mitarbeiter: payload })
      setStaff(res.data.data.settings.mitarbeiter ?? [])
      setIsEditing(false)
      toast.success('Mitarbeiter gespeichert.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <Section
      title="Mitarbeiter"
      desc="Team-Roster für Kalender und Zuordnung. Login-Einladungen folgen in einer späteren Version."
      canEdit={canEdit}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      saving={saving}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {!canEdit && <ReadOnlyHint />}

      {staff.length === 0 && (
        <p className="text-studio-w3 text-[13px] m-0">Noch keine Mitarbeiter erfasst.</p>
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
                  <Badge variant="status" value="gesperrt">Inaktiv</Badge>
                )}
              </div>
              <p className="text-studio-w2 text-[12px] m-0">{member.rolle}</p>
              {member.raum_id && (
                <p className="text-studio-w3 text-[11px] m-0">Raum: {roomName(member.raum_id)}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          {rooms.length === 0 && (
            <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2">
              Tipp: Lege zuerst unter «Räume» mindestens einen Behandlungsraum an.
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
                      : `Mitarbeiter ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="p-1.5 rounded-[8px] text-studio-w2 hover:text-studio-red hover:bg-studio-red/10 border-0 bg-transparent cursor-pointer"
                    aria-label="Mitarbeiter entfernen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Vorname"
                    value={member.vorname}
                    onChange={(e) => updateMember(index, 'vorname', e.target.value)}
                  />
                  <Input
                    label="Nachname"
                    value={member.nachname}
                    onChange={(e) => updateMember(index, 'nachname', e.target.value)}
                  />
                  <Select
                    label="Rolle"
                    value={member.rolle ?? 'Laser-Therapeutin'}
                    onChange={(e) => updateMember(index, 'rolle', e.target.value)}
                  >
                    {MITARBEITER_ROLLEN.map((rolle) => (
                      <option key={rolle} value={rolle}>{rolle}</option>
                    ))}
                  </Select>
                  <Select
                    label="Raum"
                    value={member.raum_id ?? ''}
                    onChange={(e) => updateMember(index, 'raum_id', e.target.value)}
                  >
                    <option value="">— Kein Raum —</option>
                    {rooms.filter((r) => r.aktiv !== false).map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Select>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.aktiv !== false}
                        onChange={(e) => updateMember(index, 'aktiv', e.target.checked)}
                        className="accent-studio-gold"
                      />
                      <span className="text-studio-w2 text-[12px]">Aktiv</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={addMember}>
            <Plus size={14} />
            Mitarbeiter hinzufügen
          </Button>
        </>
      )}
    </Section>
  )
}

// ── Stripe Connect tab ─────────────────────────────────────────────────────
const StripeTab = () => {
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
      toast.error('Stripe-Status konnte nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const flag = searchParams.get('stripe')
    if (flag === 'return' || flag === 'refresh') {
      ;(async () => {
        try {
          await refreshStudioStripeConnect()
          toast.success('Stripe-Status aktualisiert')
          load()
        } catch {
          /* ignore */
        }
      })()
    }
  }, [searchParams, load])

  const connect = async () => {
    if (!canEdit) return
    setBusy(true)
    try {
      const res = await startStudioStripeConnect()
      const url = res.data.data?.url
      if (!url) throw new Error('No onboarding URL')
      window.location.href = url
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Stripe Connect fehlgeschlagen')
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
      title="Stripe Connect"
      desc="Verbinde dein Studio-Konto, um Shop-Provisionen ausgezahlt zu bekommen (Testmodus möglich)."
    >
      {!status?.stripe_enabled ? (
        <p className="text-studio-w2 text-[13px] m-0">
          Stripe ist auf dem Server noch nicht konfiguriert (STRIPE_SECRET_KEY fehlt).
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="status" value={status.onboarding_complete ? 'aktiv' : 'ausstehend'}>
              {status.onboarding_complete ? 'Onboarding fertig' : 'Onboarding offen'}
            </Badge>
            {status.stripe_test_mode ? (
              <Badge>Testmodus</Badge>
            ) : null}
          </div>
          <div className="text-[13px] text-studio-w2 space-y-1">
            <p className="m-0">
              Account:{' '}
              <span className="font-mono text-studio-w1">
                {status.account_id || '— noch nicht verbunden'}
              </span>
            </p>
            <p className="m-0">
              Charges: {status.charges_enabled ? 'ja' : 'nein'} · Payouts:{' '}
              {status.payouts_enabled ? 'ja' : 'nein'}
            </p>
          </div>
          {canEdit ? (
            <div className="flex gap-2">
              <Button disabled={busy} onClick={connect}>
                {status.account_id ? 'Onboarding fortsetzen' : 'Mit Stripe verbinden'}
              </Button>
              <Button variant="secondary" disabled={busy} onClick={load}>
                Status aktualisieren
              </Button>
            </div>
          ) : (
            <p className="text-studio-w3 text-[12px] m-0">Nur Studio-Admin kann Stripe verbinden.</p>
          )}
          <p className="text-studio-w4 text-[11px] m-0">
            Im Stripe-Testmodus kannst du die Onboarding-Formulare mit Testdaten ausfüllen.
            Später werden die Live-Keys des Clients eingetragen.
          </p>
        </div>
      )}
    </Section>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
const StudioSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : 'appearance'
  )
  const { preference, setPreference } = useTheme()

  useEffect(() => {
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const selectTab = (id) => {
    setActiveTab(id)
    setSearchParams(id === 'appearance' ? {} : { tab: id })
  }

  return (
    <div className="p-6 max-w-[860px]">
      <PageHeader title="Einstellungen" subtitle="Studio-Konfiguration und Darstellung" />

      <div className="flex gap-6">
        <nav className="flex flex-col gap-0.5 w-44 shrink-0" translate="no">
          {TABS.map(({ id, icon: Icon, label }) => (
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
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 flex flex-col gap-5">
          {activeTab === 'appearance' && (
            <Section title="Darstellung" desc="Wähle das Farbschema für das Studio-Dashboard.">
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map((opt) => (
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
              <p className="text-studio-w4 text-[11px] m-0">
                Die Einstellung wird im Browser gespeichert und gilt nur für dieses Gerät.
              </p>
            </Section>
          )}

          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'pricing' && <PricingTab />}
          {activeTab === 'hours'   && <HoursTab />}
          {activeTab === 'rooms'   && <RoomsTab />}
          {activeTab === 'staff'   && <StaffTab />}
          {activeTab === 'stripe'  && <StripeTab />}
        </div>
      </div>
    </div>
  )
}

export default StudioSettings
