import { BookOpen, Sparkles } from 'lucide-react'
import useContent from '../../i18n/useContent'

const Card = ({ title, children }) => (
  <div className="rounded-[12px] border border-elaya-border border-l-4 border-l-studio-teal bg-studio-bg-4 px-4 py-4">
    <p className="text-[13px] font-semibold tracking-wide text-studio-teal m-0 mb-3 uppercase">
      {title}
    </p>
    <div className="flex flex-col gap-3 text-[13px] text-studio-w1 leading-relaxed">{children}</div>
  </div>
)

const Subhead = ({ children }) => (
  <p className="text-[12px] font-semibold text-studio-teal m-0 mb-1 uppercase tracking-wide">{children}</p>
)

const Lines = ({ items }) => (
  <div className="flex flex-col gap-0.5">
    {(items || []).map((line) => (
      <p key={line} className="m-0">
        {line}
      </p>
    ))}
  </div>
)

/**
 * Super Admin Engine — "How ELAYA works".
 * Full prototype explainers from engineSecHowItWorks():
 * delta worth, calculation walkthrough, lifestyle index, Live vs Draft, AI note.
 */
const EngineHowItWorks = () => {
  const { adminPages } = useContent()
  const copy = adminPages.engine?.how || {}
  const live = copy.liveDraft || {}
  const delta = copy.delta || {}
  const calc = copy.calc || {}
  const life = copy.lifestyle || {}

  return (
    <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5 flex flex-col gap-4">
      <h3 className="flex items-center gap-2 text-studio-white text-[14px] font-semibold m-0">
        <BookOpen size={16} className="text-studio-gold-2" />
        {copy.title || 'How does ELAYA work?'}
      </h3>

      <Card title={live.title}>
        <div>
          <p className="m-0 font-semibold text-studio-white">{live.liveTitle}</p>
          <p className="m-0">{live.liveText}</p>
        </div>
        <div>
          <p className="m-0 font-semibold text-studio-white">{live.draftTitle}</p>
          <p className="m-0">{live.draftText}</p>
        </div>
        <p className="m-0">{live.controls}</p>
        <p className="m-0">{live.split}</p>
        <p className="m-0 text-studio-gold-2 font-medium">{live.impact}</p>
      </Card>

      <Card title={delta.title}>
        <p className="m-0">{delta.intro}</p>
        <div>
          <Subhead>{delta.ruleTitle}</Subhead>
          <p className="m-0 text-amber-700">{delta.plus}</p>
          <p className="m-0 text-studio-teal">{delta.minus}</p>
        </div>
        <p className="m-0">
          <span className="font-semibold text-studio-gold-2">{delta.importantLabel} </span>
          {delta.important}
        </p>
        <div>
          <Subhead>{delta.exampleTitle}</Subhead>
          <div className="font-mono text-[12px] text-studio-white">
            {(delta.rows || []).map((row) => (
              <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_4.5rem] gap-3">
                <span>{row.label}</span>
                <span className="text-right">{row.value}</span>
              </div>
            ))}
            <div className="border-t border-elaya-border my-1.5" />
            <div className="grid grid-cols-[minmax(0,1fr)_4.5rem] gap-3">
              <span>{delta.rawLabel}</span>
              <span className="text-right">{delta.rawValue}</span>
            </div>
          </div>
          <div className="text-studio-teal mt-2">
            <Lines items={delta.multipliers} />
          </div>
        </div>
        <div>
          <Subhead>{delta.conclusionTitle}</Subhead>
          <p className="m-0 mb-1">{delta.conclusionIntro}</p>
          <Lines items={delta.conclusionLines} />
          <p className="m-0 mt-2 font-semibold text-studio-gold-2">{delta.conclusionEmphasis}</p>
        </div>
      </Card>

      <Card title={calc.title}>
        <div>
          <Subhead>{calc.priceTitle}</Subhead>
          <p className="m-0 mb-1">{calc.priceRule}</p>
          <Lines items={calc.priceExample} />
          <p className="m-0 mt-1 font-semibold text-studio-gold-2">{calc.priceColors}</p>
        </div>
        <div>
          <Subhead>{calc.sessionsTitle}</Subhead>
          <p className="m-0">{calc.sessionsText}</p>
        </div>
        <div>
          <Subhead>{calc.whatTitle}</Subhead>
          <p className="m-0">{calc.whatIntro}</p>
          <Lines items={calc.whatLines} />
          <p className="m-0 mt-1">{calc.colorImpact}</p>
        </div>
        <div>
          <Subhead>{calc.exampleTitle}</Subhead>
          <div className="text-studio-teal">
            <Lines items={calc.exampleLines} />
          </div>
        </div>
        <div>
          <Subhead>{calc.costTitle}</Subhead>
          <p className="m-0 text-studio-teal">{calc.costText}</p>
        </div>
        <div>
          <Subhead>{calc.effectTitle}</Subhead>
          <p className="m-0 mb-1">{calc.effectIntro}</p>
          <div className="text-studio-teal">
            <Lines items={calc.effectLines} />
          </div>
          <p className="m-0 mt-2 font-semibold text-studio-gold-2">{calc.effectEmphasis}</p>
        </div>
      </Card>

      <Card title={life.title}>
        <div>
          <p className="m-0">
            {life.step1Lead} <span className="font-semibold text-studio-gold-2">{life.step1Scale}</span>
          </p>
          <p className="m-0">{life.step2}</p>
          <p className="m-0">{life.step3}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          {(life.bands || []).map((band) => (
            <p key={band.range} className="m-0">
              {band.range}: <span className={band.tone === 'poor' ? 'text-red-700' : band.tone === 'normal' ? 'text-amber-700' : 'text-studio-teal'}>{band.name}</span>
              {' → '}
              <span className="text-studio-teal">{band.effect}</span>
            </p>
          ))}
        </div>
        <div>
          <Subhead>{life.exampleTitle}</Subhead>
          <div className="text-studio-teal">
            <Lines items={life.exampleLines} />
          </div>
        </div>
        <p className="m-0">{life.bmiNote}</p>
      </Card>

      <div className="rounded-[12px] border-l-4 border-studio-teal bg-studio-bg-4 px-4 py-3">
        <p className="flex items-center gap-2 text-[12px] font-semibold text-studio-teal m-0 mb-1">
          <Sparkles size={14} />
          {copy.aiTitle}
        </p>
        <p className="text-[12px] text-studio-w1 m-0">{copy.aiText}</p>
      </div>
    </div>
  )
}

export default EngineHowItWorks
