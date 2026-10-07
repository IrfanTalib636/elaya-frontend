import { ChevronDown } from 'lucide-react'

/** Collapsible engine note, same role as the prototype info boxes. */
const EngineDisclosure = ({ title, lines = [] }) => {
  if (!title) return null
  return (
    <details className="group rounded-[10px] border border-elaya-border border-l-4 border-l-studio-teal bg-studio-bg-4">
      <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-2.5 text-[13px] font-semibold text-studio-teal">
        <ChevronDown size={14} className="shrink-0 transition-transform group-open:rotate-180" />
        {title}
      </summary>
      <div className="px-3 pb-3 text-[12px] text-studio-w1 leading-relaxed flex flex-col gap-2">
        {lines.map((line) => (
          <p key={line} className="m-0">
            {line}
          </p>
        ))}
      </div>
    </details>
  )
}

export default EngineDisclosure
