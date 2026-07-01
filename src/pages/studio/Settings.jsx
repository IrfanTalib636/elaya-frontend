import { useState } from 'react'
import { Sun, Moon, Monitor, Check, User, DollarSign, Clock, Grid, Users } from 'lucide-react'
import { Card, PageHeader } from '../../components/ui'
import useTheme from '../../hooks/useTheme'

// ── Theme option card ─────────────────────────────────────────────────────
const THEME_OPTIONS = [
  { value: 'light',  icon: Sun,     label: 'Hell',   desc: 'Heller Hintergrund' },
  { value: 'dark',   icon: Moon,    label: 'Dunkel', desc: 'Dunkler Hintergrund' },
  { value: 'system', icon: Monitor, label: 'System', desc: 'Folgt Systemeinstellung' },
]

const ThemeOption = ({ value, icon: Icon, label, desc, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`flex flex-col items-start gap-2 p-4 rounded-[12px] border cursor-pointer transition-all text-left w-full
      ${active
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

// ── Section wrapper ───────────────────────────────────────────────────────
const Section = ({ title, desc, children }) => (
  <Card className="flex flex-col gap-5">
    <div className="border-b border-elaya-border pb-4">
      <h2 className="text-[15px] font-bold text-studio-white m-0">{title}</h2>
      {desc && <p className="text-studio-w3 text-[12px] m-0 mt-1">{desc}</p>}
    </div>
    {children}
  </Card>
)

// ── Stub row ──────────────────────────────────────────────────────────────
const ComingSoon = ({ label }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-studio-w2 text-[13px]">{label}</span>
    <span className="text-studio-w4 text-[11px] border border-elaya-border rounded-full px-2.5 py-0.5">Kommt bald</span>
  </div>
)

// ── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'appearance', icon: Monitor, label: 'Darstellung' },
  { id: 'profile',    icon: User,    label: 'Studio-Profil' },
  { id: 'pricing',    icon: DollarSign, label: 'Preise' },
  { id: 'hours',      icon: Clock,   label: 'Öffnungszeiten' },
  { id: 'rooms',      icon: Grid,    label: 'Räume' },
  { id: 'staff',      icon: Users,   label: 'Mitarbeiter' },
]

// ── Main component ────────────────────────────────────────────────────────
const StudioSettings = () => {
  const [activeTab, setActiveTab] = useState('appearance')
  const { preference, setPreference } = useTheme()

  return (
    <div className="p-6 max-w-[860px]">
      <PageHeader title="Einstellungen" subtitle="Studio-Konfiguration und Darstellung" />

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="flex flex-col gap-0.5 w-44 shrink-0">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors w-full text-left cursor-pointer border-0
                ${activeTab === id
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
            <Section
              title="Darstellung"
              desc="Wähle das Farbschema für das Studio-Dashboard."
            >
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

          {activeTab === 'profile' && (
            <Section title="Studio-Profil" desc="Name, Adresse und Kontaktdaten des Studios.">
              <ComingSoon label="Firmenname" />
              <ComingSoon label="Adresse" />
              <ComingSoon label="Telefon / E-Mail" />
              <ComingSoon label="Studio-Code" />
            </Section>
          )}

          {activeTab === 'pricing' && (
            <Section title="Preise & Multiplikatoren" desc="Interne Preiskalkulation für Behandlungen.">
              <ComingSoon label="Basispreis pro cm²" />
              <ComingSoon label="Mindestpreis pro Sitzung" />
              <ComingSoon label="Multiplikatoren (Farbe, Tiefe, Alter…)" />
            </Section>
          )}

          {activeTab === 'hours' && (
            <Section title="Öffnungszeiten" desc="Verfügbare Tage und Zeiten für Termine.">
              <ComingSoon label="Montag – Freitag" />
              <ComingSoon label="Samstag / Sonntag" />
              <ComingSoon label="Feiertage" />
            </Section>
          )}

          {activeTab === 'rooms' && (
            <Section title="Räume" desc="Behandlungsräume und Laser-Geräte.">
              <ComingSoon label="Raum hinzufügen" />
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
