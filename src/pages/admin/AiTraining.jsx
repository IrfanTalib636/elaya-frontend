import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader, Card, Button, Spinner } from '../../components/ui'
import { Link } from 'react-router-dom'
import { getAiConfig, updateAiConfig } from '../../api/adminPhase4'
import { getEngineHowItWorks } from '../../api/adminConfig'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'

const PROMPT_KEYS = ['nachsorge', 'verblassung', 'customer_chat', 'studio_chat']

export default function AdminAiTraining() {
  const { adminPages, i18n } = useContent()
  const copy = adminPages.aiTraining || {}
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modelName, setModelName] = useState('')
  const [prompts, setPrompts] = useState({})
  const [activeKey, setActiveKey] = useState('nachsorge')
  const [reason, setReason] = useState('')
  const [engine, setEngine] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAiConfig()
      const cfg = res.data.data.ai_config || {}
      setPrompts(cfg.prompts || {})
      setModelName(cfg.model_name || '')
      try {
        const engineRes = await getEngineHowItWorks((i18n?.language || 'de').startsWith('en') ? 'en' : 'de')
        setEngine(engineRes.data.data)
      } catch {
        setEngine(null)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError || 'Failed to load AI config'))
    } finally {
      setLoading(false)
    }
  }, [copy.loadError, i18n?.language])

  useEffect(() => {
    void load()
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAiConfig({
        model_name: modelName,
        prompts: { [activeKey]: prompts[activeKey] },
        reason: reason.trim() || copy.changeReason || 'AI prompt update',
      })
      toast.success(copy.saved || 'AI config saved')
      setReason('')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.saveFailed || 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-[960px] flex flex-col gap-5">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {engine?.facts || engine?.published_facts ? (
        <Card className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-studio-white m-0">
            {copy.engineTitle || 'Published Engine (source of truth for Chat)'}
          </p>
          <p className="text-[12px] text-studio-w1 m-0 leading-relaxed">
            {copy.engineHint ||
              'ELAYA Chat always reads the published Live Engine. Automatic model training is not yet active — the current published configuration is versioned and used as the only rule source.'}
          </p>
          <p className="text-[12px] text-studio-w2 m-0">
            session_prediction v{engine.versions?.session_prediction || 0}
            {' · '}
            default_pricing v{engine.versions?.default_pricing || 0}
            {' · '}
            engine_explainer v{engine.versions?.engine_explainer || 0}
          </p>
          <p className="text-[12px] text-studio-w1 m-0">
            Base {(engine.published_facts || engine.facts).base_sessions} · range −
            {(engine.published_facts || engine.facts).range_minus} / +
            {(engine.published_facts || engine.facts).range_plus} ·{' '}
            {(engine.published_facts || engine.facts).color_aggregation_rule}
          </p>
          <Link
            to="/admin/engine?view=admin"
            className="text-[12px] font-semibold text-studio-gold-2 no-underline hover:underline w-fit"
          >
            {copy.openEngine || 'Open Prediction Engine'}
          </Link>
        </Card>
      ) : null}

      <Card className="flex flex-col gap-3">
        <label className="text-[12px] font-semibold text-studio-white">
          {copy.modelName || 'Model name'}
          <input
            className="mt-1.5 w-full px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {PROMPT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveKey(key)}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] border cursor-pointer ${
                activeKey === key
                  ? 'border-studio-gold text-studio-gold-2 bg-studio-bg-4'
                  : 'border-elaya-border text-studio-w2 bg-transparent'
              }`}
            >
              {copy.prompts?.[key] || key}
            </button>
          ))}
        </div>

        <textarea
          rows={16}
          className="w-full px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] font-mono outline-none resize-y"
          value={prompts[activeKey] || ''}
          onChange={(e) =>
            setPrompts((prev) => ({ ...prev, [activeKey]: e.target.value }))
          }
        />

        <label className="text-[12px] font-semibold text-studio-white">
          {copy.changeReason || 'Change reason'}
          <input
            className="mt-1.5 w-full px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={copy.changeReasonPh || ''}
          />
        </label>

        <div className="flex justify-end">
          <Button loading={saving} onClick={() => void handleSave()}>
            {copy.savePrompt || 'Save prompt'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
