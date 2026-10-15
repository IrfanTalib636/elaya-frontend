import useContent from '../../i18n/useContent'
import { getIn } from './masterDataSections'

const toNumber = (value) => {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

const formatDelta = (n) => {
  const rounded = Math.round(n * 1000) / 1000
  return rounded > 0 ? `+${rounded}` : String(rounded)
}

/** One factor group: LIVE (published) next to the editable shared DRAFT value. */
export default function MasterDataTable({ title, rows, live, draft, disabled, onChange }) {
  const { adminPages } = useContent()
  const copy = adminPages.engineMasterData || {}

  return (
    <div className="rounded-[12px] border border-elaya-border overflow-hidden">
      {title ? (
        <p className="m-0 px-4 py-2.5 text-[12px] font-semibold text-studio-white bg-studio-bg-4 border-b border-elaya-border">
          {title}
        </p>
      ) : null}
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="text-left text-studio-w3">
            <th className="px-4 py-2 font-medium">{copy.colFactor}</th>
            <th className="px-4 py-2 font-medium w-[90px]">{copy.colLive}</th>
            <th className="px-4 py-2 font-medium w-[130px]">{copy.colDraft}</th>
            <th className="px-4 py-2 font-medium w-[80px]">{copy.colDelta}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const liveValue = toNumber(getIn(live, row.path))
            const rawDraft = getIn(draft, row.path)
            const draftValue = rawDraft ?? liveValue
            const diff = toNumber(draftValue) - liveValue
            const changed = diff !== 0
            return (
              <tr key={row.path.join('.')} className="border-t border-elaya-border">
                <td className="px-4 py-1.5 text-studio-w1">{row.label}</td>
                <td className="px-4 py-1.5 text-studio-white font-medium tabular-nums">{liveValue}</td>
                <td className="px-4 py-1.5">
                  <input
                    type="number"
                    step={row.step || '1'}
                    value={draftValue}
                    disabled={disabled}
                    onChange={(e) => onChange(row.path, e.target.value === '' ? '' : Number(e.target.value))}
                    aria-label={`${row.label} ${copy.colDraft}`}
                    className={`w-full rounded-[8px] border bg-studio-bg-3 px-2 py-1 text-[12px] tabular-nums text-studio-white outline-none disabled:opacity-60 ${
                      changed ? 'border-amber-400' : 'border-elaya-border focus:border-studio-gold-2'
                    }`}
                  />
                </td>
                <td className={`px-4 py-1.5 tabular-nums ${changed ? 'text-amber-700 font-semibold' : 'text-studio-w3'}`}>
                  {changed ? formatDelta(diff) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
