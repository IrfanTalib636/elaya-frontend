import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader, Card, Button, Spinner } from '../../components/ui'
import { getAiConfig, updateAiConfig } from '../../api/adminPhase4'
import { getApiErrorMessage } from '../../lib/apiError'

const PROMPT_FIELDS = [
  { key: 'nachsorge', label: 'Nachsorge (photo check)' },
  { key: 'verblassung', label: 'Verblassung (fading analysis)' },
  { key: 'customer_chat', label: 'Customer Elaya chat' },
  { key: 'studio_chat', label: 'Studio Elaya chat' },
]

export default function AdminAiTraining() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modelName, setModelName] = useState('')
  const [prompts, setPrompts] = useState({})
  const [activeKey, setActiveKey] = useState('nachsorge')
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAiConfig()
      const cfg = res.data.data.ai_config || {}
      setPrompts(cfg.prompts || {})
      setModelName(cfg.model_name || '')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load AI config'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAiConfig({
        model_name: modelName,
        prompts: { [activeKey]: prompts[activeKey] },
        reason: reason.trim() || 'AI prompt update',
      })
      toast.success('AI config saved')
      setReason('')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Save failed'))
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
      <PageHeader
        title="AI Training Center"
        subtitle="Edit system prompts used by live AI agents. Feature flags still gate each agent per studio."
      />

      <Card className="flex flex-col gap-3">
        <label className="text-[12px] font-semibold text-studio-white">
          Model name
          <input
            className="mt-1.5 w-full px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {PROMPT_FIELDS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveKey(f.key)}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] border cursor-pointer ${
                activeKey === f.key
                  ? 'border-studio-gold text-studio-gold-2 bg-studio-bg-4'
                  : 'border-elaya-border text-studio-w2 bg-transparent'
              }`}
            >
              {f.label}
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
          Change reason
          <input
            className="mt-1.5 w-full px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you changing this prompt?"
          />
        </label>

        <div className="flex justify-end">
          <Button loading={saving} onClick={() => void handleSave()}>
            Save prompt
          </Button>
        </div>
      </Card>
    </div>
  )
}
