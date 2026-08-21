import { Check } from 'lucide-react'
import useContent from '../../i18n/useContent'

const CaseWizardProgress = ({ step, steps }) => {
  const { t, caseForm } = useContent()
  const resolvedSteps = steps ?? caseForm.wizardSteps
  const total = resolvedSteps.length
  const pct = Math.round(((step + 1) / total) * 100)
  const current = resolvedSteps[step]

  return (
    <div className="mb-6 select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono tracking-widest text-studio-teal-2 uppercase">
          {current?.code} · {t('components.caseWizard.stepOf', { current: step + 1, total })}
        </span>
        <span className="text-[10px] text-studio-w3 tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-linear-to-r from-studio-teal to-studio-gold transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mb-5">
        <h3 className="text-[20px] font-bold text-studio-white m-0 leading-tight">
          {current?.title}
          <span className="text-studio-gold-2 font-normal"> · {current?.subtitle}</span>
        </h3>
      </div>

      <div className="overflow-x-auto pb-2 pt-2 -mx-1 px-1">
        <div className="flex items-start min-w-max">
          {resolvedSteps.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <div key={s.id} className="flex items-start">
                <div className="flex flex-col items-center w-[64px] shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all duration-300 shrink-0
                      ${done
                        ? 'border-studio-teal-2 bg-studio-teal/20 text-studio-teal-2'
                        : active
                          ? 'border-studio-gold bg-studio-gold/15 text-studio-gold-2 shadow-[0_0_12px_rgba(201,168,76,0.25)] ring-2 ring-studio-gold/20'
                          : 'border-elaya-border bg-studio-bg-4 text-studio-w4'
                      }`}
                  >
                    {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                  </div>
                  <span
                    className={`text-[9px] text-center leading-tight mt-2 min-h-[24px] max-w-[58px]
                      ${active ? 'text-studio-white font-semibold' : done ? 'text-studio-teal-2' : 'text-studio-w4'}`}
                  >
                    {s.title}
                  </span>
                </div>
                {i < resolvedSteps.length - 1 && (
                  <div className="w-6 sm:w-8 h-9 flex items-center shrink-0" aria-hidden>
                    <div
                      className={`h-0.5 w-full rounded transition-colors duration-300
                        ${i < step ? 'bg-studio-teal/50' : 'bg-white/10'}`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CaseWizardProgress
