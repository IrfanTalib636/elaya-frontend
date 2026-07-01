import { useState } from 'react'
import { Input, Select, Button } from '../ui'

// ── Constants ─────────────────────────────────────────────────────────────
const CASE_TYPES = [
  { value: 'tattoo', label: 'Tattoo-Entfernung' },
  { value: 'pmu',    label: 'PMU-Entfernung'    },
]

const FITZPATRICK = [1, 2, 3, 4, 5, 6]

const COLORS = ['Schwarz', 'Grau', 'Rot', 'Blau', 'Grün', 'Gelb', 'Orange', 'Violett', 'Weiß', 'Braun']

const INITIAL = {
  type:               'tattoo',
  bodyLabel:          '',
  tc_title:           '',
  tc_type:            '',
  tc_coverup:         'none',
  tc_size_length:     '',
  tc_size_width:      '',
  tc_age_years:       '',
  skin_fitzpatrick:   '',
  tc_colors_present:  [],
  goal_target:        '',
  sessionsMin:        '',
  sessionsMax:        '',
}

// ── Helpers ───────────────────────────────────────────────────────────────
const num = (v) => (v !== '' && v != null ? Number(v) : undefined)

// ── CaseForm ──────────────────────────────────────────────────────────────
const CaseForm = ({ onSubmit, loading, onCancel }) => {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const toggleColor = (color) =>
    setForm((p) => ({
      ...p,
      tc_colors_present: p.tc_colors_present.includes(color)
        ? p.tc_colors_present.filter((c) => c !== color)
        : [...p.tc_colors_present, color],
    }))

  const toggleFitzpatrick = (n) =>
    setForm((p) => ({ ...p, skin_fitzpatrick: p.skin_fitzpatrick === n ? '' : n }))

  const validate = () => {
    const errs = {}
    if (!form.bodyLabel.trim()) errs.bodyLabel = 'Pflichtfeld'
    if (form.sessionsMax && form.sessionsMin && Number(form.sessionsMin) > Number(form.sessionsMax)) {
      errs.sessionsMin = 'Min. darf nicht größer als Max. sein'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const sessMax = num(form.sessionsMax) ?? 0
    const sessMin = num(form.sessionsMin) ?? 0

    onSubmit({
      type:              form.type,
      bodyLabel:         form.bodyLabel.trim(),
      tc_title:          form.tc_title.trim() || undefined,
      tc_type:           form.tc_type        || undefined,
      tc_coverup:        form.tc_coverup     || 'none',
      tc_size_length:    num(form.tc_size_length),
      tc_size_width:     num(form.tc_size_width),
      tc_age_years:      num(form.tc_age_years),
      skin_fitzpatrick:  num(form.skin_fitzpatrick),
      tc_colors_present: form.tc_colors_present,
      goal_target:       form.goal_target    || undefined,
      sessionsMin:       sessMin,
      sessionsMax:       sessMax,
      sessions:          sessMax,
      zonen:             [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" translate="no">

      {/* Case type */}
      <div>
        <p className="text-studio-white text-[12px] font-semibold mb-2">Fall-Typ</p>
        <div className="flex gap-2">
          {CASE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: t.value }))}
              className={`flex-1 py-2 rounded-[10px] text-[12px] font-semibold border cursor-pointer transition-colors
                ${form.type === t.value
                  ? 'border-studio-gold/50 bg-studio-gold/10 text-studio-white'
                  : 'border-elaya-border bg-transparent text-studio-w2 hover:border-elaya-border-strong hover:text-studio-white'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Körperstelle *"
          value={form.bodyLabel}
          onChange={set('bodyLabel')}
          error={errors.bodyLabel}
          placeholder="z. B. Unterarm links"
          autoFocus
        />
        <Input
          label="Bezeichnung"
          value={form.tc_title}
          onChange={set('tc_title')}
          placeholder="z. B. Tribal, Schriftzug"
        />
      </div>

      {/* Tattoo details */}
      <div className="grid grid-cols-2 gap-4">
        <Select label="Tätowierungsart" value={form.tc_type} onChange={set('tc_type')}>
          <option value="">— Auswählen —</option>
          <option value="amateur">Amateur</option>
          <option value="cosmetic">Kosmetisch</option>
          <option value="professional">Professionell</option>
          <option value="coverup">Cover-up</option>
        </Select>
        <Select label="Cover-up" value={form.tc_coverup} onChange={set('tc_coverup')}>
          <option value="none">Kein Cover-up</option>
          <option value="once">Einmal</option>
          <option value="multiple">Mehrfach</option>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Länge (cm)"
          type="number"
          min="0"
          step="0.1"
          value={form.tc_size_length}
          onChange={set('tc_size_length')}
          placeholder="10"
        />
        <Input
          label="Breite (cm)"
          type="number"
          min="0"
          step="0.1"
          value={form.tc_size_width}
          onChange={set('tc_size_width')}
          placeholder="5"
        />
        <Input
          label="Alter (Jahre)"
          type="number"
          min="0"
          value={form.tc_age_years}
          onChange={set('tc_age_years')}
          placeholder="3"
        />
      </div>

      {/* Fitzpatrick */}
      <div>
        <p className="text-studio-white text-[12px] font-semibold mb-2">Fitzpatrick-Typ</p>
        <div className="flex gap-1.5">
          {FITZPATRICK.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleFitzpatrick(n)}
              className={`flex-1 py-1.5 rounded-[6px] text-[11px] font-semibold border cursor-pointer transition-colors
                ${form.skin_fitzpatrick === n
                  ? 'border-studio-gold/50 bg-studio-gold/10 text-studio-gold-2'
                  : 'border-elaya-border bg-transparent text-studio-w3 hover:text-studio-white hover:border-elaya-border-strong'
                }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-studio-w4 text-[10px] mt-1.5 m-0">1 = sehr hell, 6 = sehr dunkel</p>
      </div>

      {/* Colors */}
      <div>
        <p className="text-studio-white text-[12px] font-semibold mb-2">Farben</p>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((color) => {
            const active = form.tc_colors_present.includes(color)
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border cursor-pointer transition-colors
                  ${active
                    ? 'border-studio-gold/50 bg-studio-gold/15 text-studio-gold-2'
                    : 'border-elaya-border bg-transparent text-studio-w3 hover:text-studio-white hover:border-elaya-border-strong'
                  }`}
              >
                {color}
              </button>
            )
          })}
        </div>
      </div>

      {/* Treatment plan */}
      <div className="pt-3 border-t border-elaya-border flex flex-col gap-4">
        <p className="text-studio-white text-[13px] font-semibold m-0">Behandlungsplan</p>

        <Select label="Behandlungsziel" value={form.goal_target} onChange={set('goal_target')}>
          <option value="">— Auswählen —</option>
          <option value="full">Vollständige Entfernung</option>
          <option value="partial_fade">Teilweises Aufhellen</option>
          <option value="lightening_for_coverup">Aufhellen für Cover-up</option>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sitzungen Min."
            type="number"
            min="0"
            value={form.sessionsMin}
            onChange={set('sessionsMin')}
            error={errors.sessionsMin}
            placeholder="3"
          />
          <Input
            label="Sitzungen Max."
            type="number"
            min="0"
            value={form.sessionsMax}
            onChange={set('sessionsMax')}
            placeholder="6"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-elaya-border">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Abbrechen
        </Button>
        <Button type="submit" loading={loading}>
          Fall anlegen
        </Button>
      </div>
    </form>
  )
}

export default CaseForm
