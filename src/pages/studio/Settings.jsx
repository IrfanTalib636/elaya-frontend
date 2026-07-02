import { useState, useEffect, useCallback } from 'react'
import { Sun, Moon, Monitor, Check, User, DollarSign, Clock, Grid, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Input, Button, Spinner } from '../../components/ui'
import useTheme from '../../hooks/useTheme'
import useAuthStore from '../../store/authStore'
import { getStudioConfig, updateStudioConfig } from '../../api/config'

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
const Section = ({ title, desc, children }) => (
  <Card className="flex flex-col gap-5">
    <div className="border-b border-elaya-border pb-4">
      <h2 className="text-[15px] font-bold text-studio-white m-0">{title}</h2>
      {desc && <p className="text-studio-w3 text-[12px] m-0 mt-1">{desc}</p>}
    </div>
    {children}
  </Card>
)

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-elaya-border last:border-0">
    <span className="text-studio-w2 text-[12px] shrink-0 w-36">{label}</span>
    <span className="text-studio-white text-[12px] font-medium text-right break-all">{value || '—'}</span>
  </div>
)

const ComingSoon = ({ label }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-elaya-border last:border-0">
    <span className="text-studio-w2 text-[13px]">{label}</span>
    <span className="text-studio-w4 text-[10px] border border-elaya-border rounded-full px-2.5 py-0.5">Kommt bald</span>
  </div>
)

// ── Tabs ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'appearance', icon: Monitor,     label: 'Darstellung'    },
  { id: 'profile',    icon: User,        label: 'Studio-Profil'  },
  { id: 'pricing',    icon: DollarSign,  label: 'Preise'         },
  { id: 'hours',      icon: Clock,       label: 'Öffnungszeiten' },
  { id: 'rooms',      icon: Grid,        label: 'Räume'          },
  { id: 'staff',      icon: Users,       label: 'Mitarbeiter'    },
]

// ── Pricing tab ────────────────────────────────────────────────────────────
const PricingTab = () => {
  const [config,   setConfig]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({
    coin_wert:        '',
    basePricePerCm2:  '',
    minPrice:         '',
    pmuPrice:         '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudioConfig()
      const cfg = res.data.data.studio_config
      setConfig(cfg)
      setForm({
        coin_wert:       cfg.coin_wert        ?? cfg.platform_limits.coinWert ?? '',
        basePricePerCm2: cfg.studio_pricing?.basePricePerCm2 ?? '',
        minPrice:        cfg.studio_pricing?.minPrice        ?? '',
        pmuPrice:        cfg.studio_pricing?.pmuPrice        ?? '',
      })
    } catch {
      toast.error('Konfiguration konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {}

      const coinVal = parseFloat(form.coin_wert)
      if (!Number.isNaN(coinVal)) payload.coin_wert = coinVal

      const pricing = {}
      const baseVal = parseFloat(form.basePricePerCm2)
      const minVal  = parseFloat(form.minPrice)
      const pmuVal  = parseFloat(form.pmuPrice)
      if (!Number.isNaN(baseVal)) pricing.basePricePerCm2 = baseVal
      if (!Number.isNaN(minVal))  pricing.minPrice        = minVal
      if (!Number.isNaN(pmuVal))  pricing.pmuPrice        = pmuVal
      if (Object.keys(pricing).length) payload.studio_pricing = pricing

      const res = await updateStudioConfig(payload)
      const updated = res.data.data.studio_config
      setConfig(updated)
      toast.success('Preise gespeichert.')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  const limits = config?.platform_limits

  return (
    <Section
      title="Preise & Elaycoin"
      desc="Studio-spezifische Preisanpassungen. Plattform-Standardwerte gelten, wenn kein Wert gesetzt ist."
    >
      {/* Coin value */}
      <div>
        <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-3">Elaycoin-Wert</p>
        <Input
          label="CHF pro Coin"
          type="number"
          min={limits?.minWert}
          max={limits?.maxWert}
          step="0.01"
          value={form.coin_wert}
          onChange={set('coin_wert')}
        />
        {limits && (
          <p className="text-studio-w3 text-[11px] m-0 mt-1.5">
            Erlaubter Bereich: CHF {limits.minWert} – CHF {limits.maxWert}
            &nbsp;·&nbsp;Plattform-Standard: CHF {limits.coinWert}
          </p>
        )}
      </div>

      <div className="h-px bg-elaya-border" />

      {/* Pricing overrides */}
      <div>
        <p className="text-[12px] font-semibold text-studio-w2 m-0 mb-3">Preiskalkulation</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Basispreis / cm² (CHF)"
            type="number"
            min={0}
            step="0.01"
            value={form.basePricePerCm2}
            onChange={set('basePricePerCm2')}
            placeholder="3.00"
          />
          <Input
            label="Mindestpreis / Sitzung (CHF)"
            type="number"
            min={0}
            step="1"
            value={form.minPrice}
            onChange={set('minPrice')}
            placeholder="90"
          />
          <Input
            label="PMU-Preis (CHF)"
            type="number"
            min={0}
            step="1"
            value={form.pmuPrice}
            onChange={set('pmuPrice')}
            placeholder="149"
          />
        </div>
        <p className="text-studio-w3 text-[11px] m-0 mt-2">
          Leere Felder verwenden den Plattform-Standard.
          Multiplikatoren (Farbe, Tiefe, Alter…) werden in einer späteren Version konfigurierbar.
        </p>
      </div>

      <div className="flex justify-end">
        <Button loading={saving} onClick={handleSave}>
          Speichern
        </Button>
      </div>
    </Section>
  )
}

// ── Profile tab ────────────────────────────────────────────────────────────
const ProfileTab = () => {
  const profile = useAuthStore((s) => s.profile)
  const user    = useAuthStore((s) => s.user)

  const address = [profile?.strasse, profile?.plz, profile?.ort, profile?.land]
    .filter(Boolean)
    .join(', ')

  return (
    <Section
      title="Studio-Profil"
      desc="Kontakt- und Standortdaten des Studios. Änderungen über den Administrator."
    >
      <InfoRow label="Firmenname"   value={profile?.firma}       />
      <InfoRow label="E-Mail"       value={profile?.email ?? user?.email} />
      <InfoRow label="Telefon"      value={profile?.telefon}     />
      <InfoRow label="Adresse"      value={address}              />
      <InfoRow label="Studio-Code"  value={profile?.studio_code} />
      <InfoRow label="Status"       value={profile?.status}      />

      <p className="text-studio-w3 text-[11px] m-0 -mt-2">
        Profildaten können nur vom Elaya-Administrator bearbeitet werden.
      </p>
    </Section>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
const StudioSettings = () => {
  const [activeTab, setActiveTab] = useState('appearance')
  const { preference, setPreference } = useTheme()

  return (
    <div className="p-6 max-w-[860px]">
      <PageHeader title="Einstellungen" subtitle="Studio-Konfiguration und Darstellung" />

      <div className="flex gap-6">
        {/* Tab nav */}
        <nav className="flex flex-col gap-0.5 w-44 shrink-0" translate="no">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
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

        {/* Content */}
        <div className="flex-1 flex flex-col gap-5">

          {activeTab === 'appearance' && (
            <Section title="Darstellung" desc="Wähle das Farbschema für das Studio-Dashboard.">
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map((opt) => (
                  <ThemeOption
                    key={opt.value}
                    {...opt}
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

          {activeTab === 'hours' && (
            <Section title="Öffnungszeiten" desc="Verfügbare Tage und Zeiten für Termine.">
              <ComingSoon label="Montag – Freitag" />
              <ComingSoon label="Samstag / Sonntag" />
              <ComingSoon label="Feiertage" />
            </Section>
          )}

          {activeTab === 'rooms' && (
            <Section title="Räume & Geräte" desc="Behandlungsräume und Laser-Geräte.">
              <ComingSoon label="Räume verwalten" />
              <ComingSoon label="Laser-Geräte" />
            </Section>
          )}

          {activeTab === 'staff' && (
            <Section title="Mitarbeiter" desc="Studio-Konten und Zugriffsrechte.">
              <ComingSoon label="Mitarbeiter einladen" />
              <ComingSoon label="Rollen verwalten" />
            </Section>
          )}

        </div>
      </div>
    </div>
  )
}

export default StudioSettings
