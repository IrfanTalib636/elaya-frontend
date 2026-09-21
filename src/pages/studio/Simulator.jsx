import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/ui'
import EngineCaseSimulator from '../../components/engine/EngineCaseSimulator'
import useContent from '../../i18n/useContent'

/**
 * Studio Tattoo Case Simulator — live pricing + session prediction.
 * Read-only: calculation parameters are owned by Super Admin (Engine).
 */
const StudioSimulator = () => {
  const { t } = useTranslation()
  const { studioPages } = useContent()
  const copy = studioPages?.simulator || {}

  return (
    <div className="p-6 max-w-[1240px]">
      <PageHeader
        title={copy.title || t('studioNav.simulator', { defaultValue: 'Case Simulator' })}
        subtitle={
          copy.subtitle ||
          'Simulate prices and session forecasts with live platform rules. You cannot change the underlying calculation logic — only Elaya Super Admin can.'
        }
      />

      <div className="mb-5 rounded-[12px] border border-studio-gold/25 bg-studio-gold/5 px-4 py-3 text-[12px] text-studio-w1">
        {copy.readOnlyBanner ||
          'Simulator only — pricing and prediction parameters are controlled centrally by Elaya Admin.'}
      </div>

      <EngineCaseSimulator mode="studio" />
    </div>
  )
}

export default StudioSimulator
