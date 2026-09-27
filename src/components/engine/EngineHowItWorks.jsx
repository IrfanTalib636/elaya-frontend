import { BookOpen, Sparkles } from 'lucide-react'
import useContent from '../../i18n/useContent'

const Block = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-[12px] font-semibold text-studio-white m-0 mb-1.5">{title}</p>
    <p className="text-[12px] text-studio-w2 m-0 leading-relaxed">{children}</p>
  </div>
)

/**
 * Super Admin Engine — "How ELAYA works" section (nav item 1/8).
 * Pure explainer, no editable fields — mirrors the prototype's
 * `engineSecHowItWorks()` (price formula, delta system, lifestyle composite,
 * AI Training Center link note).
 */
const EngineHowItWorks = () => {
  const { adminPages } = useContent()
  const copy = adminPages.engine?.how || {}

  return (
    <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5">
      <h3 className="flex items-center gap-2 text-studio-white text-[14px] font-semibold m-0 mb-4">
        <BookOpen size={16} className="text-studio-gold-2" />
        {copy.title || 'How does ELAYA work?'}
      </h3>

      <Block title={copy.priceTitle}>{copy.priceText}</Block>
      <Block title={copy.deltaTitle}>{copy.deltaText}</Block>
      <Block title={copy.lifestyleTitle}>{copy.lifestyleText}</Block>

      <div className="rounded-[12px] border-l-4 border-studio-teal bg-studio-bg-4 px-4 py-3 mt-2">
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
