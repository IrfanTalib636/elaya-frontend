const UV_OPTIONS = [
  { value: 'keine', label: 'Keine' },
  { value: 'leicht', label: 'Leicht' },
  { value: 'mittel', label: 'Mittel (+21 Tage)' },
  { value: 'intensiv', label: 'Intensiv (+28 Tage)' },
]

const MED_OPTIONS = [
  { value: 'keine', label: 'Keine' },
  { value: 'retinoide', label: 'Retinoide (+180 Tage)' },
  { value: 'antibiotika', label: 'Antibiotika (+14 Tage)' },
  { value: 'antidepressiva', label: 'Antidepressiva (+14 Tage)' },
]

const REAL_MED_KEYS = new Set(['retinoide', 'antibiotika', 'antidepressiva'])

export const EMPTY_PRE_SESSION = {
  uv_exposition: 'keine',
  medikamente: [],
  medikament_datum: '',
}

export const preSessionToParams = (check = EMPTY_PRE_SESSION) => {
  const params = {}
  if (check.uv_exposition && check.uv_exposition !== 'keine') {
    params.uv_exposition = check.uv_exposition
  }
  if (check.medikamente?.length) {
    params.medikamente = check.medikamente.join(',')
  }
  if (check.medikament_datum) {
    params.medikament_datum = check.medikament_datum
  }
  return params
}

export const preSessionToBody = (check = EMPTY_PRE_SESSION) => {
  const body = {
    uv_exposition: check.uv_exposition || 'keine',
    medikamente: check.medikamente ?? [],
  }
  if (check.medikament_datum) {
    body.medikament_datum = check.medikament_datum
  }
  return body
}

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2.5 py-1 rounded-[7px] text-[11px] border transition-colors cursor-pointer
      ${active
        ? 'border-studio-teal-2 bg-studio-teal-2/15 text-studio-teal-2'
        : 'border-elaya-border bg-transparent text-studio-w2 hover:text-studio-white'}`}
  >
    {children}
  </button>
)

const PreSessionCheck = ({ value, onChange, compact = false }) => {
  const meds = value.medikamente ?? []
  const realMeds = meds.filter((m) => REAL_MED_KEYS.has(m))

  const setUv = (uv_exposition) => onChange({ ...value, uv_exposition })
  const toggleMed = (med) => {
    if (med === 'keine') {
      const next = meds.includes('keine') ? [] : ['keine']
      onChange({ ...value, medikamente: next, medikament_datum: '' })
      return
    }
    const withoutKeine = meds.filter((m) => m !== 'keine')
    const next = withoutKeine.includes(med)
      ? withoutKeine.filter((m) => m !== med)
      : [...withoutKeine, med]
    onChange({
      ...value,
      medikamente: next,
      ...(next.length ? {} : { medikament_datum: '' }),
    })
  }

  return (
    <div className={`rounded-[10px] border border-elaya-border bg-studio-bg-4 ${compact ? 'px-3 py-2.5' : 'px-3 py-3'} flex flex-col gap-3`}>
      <div>
        <p className="text-studio-w3 text-[10px] uppercase tracking-wider m-0 mb-2">
          Vorbehandlungs-Check
        </p>
        <p className="text-studio-w3 text-[10px] m-0 mb-2">
          UV-Exposition und Medikamente beeinflussen die Sperrfrist.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {UV_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={value.uv_exposition === opt.value}
              onClick={() => setUv(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="text-studio-w3 text-[10px] m-0 mb-2">Medikamente (letzte Einnahme)</p>
        <div className="flex flex-wrap gap-1.5">
          {MED_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={(value.medikamente ?? []).includes(opt.value)}
              onClick={() => toggleMed(opt.value)}
            >
              {(value.medikamente ?? []).includes(opt.value) ? '✓ ' : ''}{opt.label}
            </Chip>
          ))}
        </div>
        {realMeds.length > 0 && (
          <input
            type="date"
            value={value.medikament_datum || ''}
            onChange={(e) => onChange({ ...value, medikament_datum: e.target.value })}
            className="mt-2 w-full rounded-[8px] border border-elaya-border bg-studio-bg px-2.5 py-1.5 text-[12px] text-studio-white"
          />
        )}
      </div>
    </div>
  )
}

export default PreSessionCheck
