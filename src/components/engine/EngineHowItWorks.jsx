import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, Sparkles, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import useContent from '../../i18n/useContent'
import { getEngineHowItWorks, saveConfigDraft } from '../../api/adminConfig'
import { getApiErrorMessage } from '../../lib/apiError'
import ConfigLifecycleBar from '../settings/ConfigLifecycleBar'
import { Button, Spinner } from '../ui'

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

const fill = (template, vars) => {
  if (typeof template !== 'string') return template
  return template.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, key) =>
    vars[key] == null ? '' : String(vars[key])
  )
}

const fillDeep = (node, vars) => {
  if (typeof node === 'string') return fill(node, vars)
  if (Array.isArray(node)) return node.map((item) => fillDeep(item, vars))
  if (node && typeof node === 'object') {
    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, fillDeep(value, vars)]))
  }
  return node
}

const getPath = (obj, path) => path.reduce((node, key) => (node == null ? undefined : node[key]), obj)

const setPath = (obj, path, value) => {
  if (!path.length) return value
  const [head, ...rest] = path
  return { ...obj, [head]: setPath(obj[head] || {}, rest, value) }
}

const FIELD_GROUPS = [
  {
    id: 'liveDraft',
    paths: [
      ['liveDraft', 'liveText'],
      ['liveDraft', 'draftText'],
      ['liveDraft', 'controls'],
      ['liveDraft', 'split'],
      ['liveDraft', 'impact'],
    ],
  },
  {
    id: 'delta',
    paths: [
      ['delta', 'intro'],
      ['delta', 'plus'],
      ['delta', 'minus'],
      ['delta', 'important'],
      ['delta', 'conclusionIntro'],
      ['delta', 'conclusionEmphasis'],
    ],
  },
  {
    id: 'calc',
    paths: [
      ['calc', 'priceRule'],
      ['calc', 'sessionsText'],
      ['calc', 'colorImpact'],
      ['calc', 'effectIntro'],
      ['calc', 'effectEmphasis'],
    ],
  },
  {
    id: 'lifestyle',
    paths: [
      ['lifestyle', 'step2'],
      ['lifestyle', 'step3'],
      ['lifestyle', 'bmiNote'],
    ],
  },
  {
    id: 'ai',
    paths: [['aiText']],
  },
]

const HowCards = ({ copy }) => {
  const live = copy.liveDraft || {}
  const delta = copy.delta || {}
  const calc = copy.calc || {}
  const life = copy.lifestyle || {}

  return (
    <>
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
              {band.range}:{' '}
              <span
                className={
                  band.tone === 'poor'
                    ? 'text-red-700'
                    : band.tone === 'normal'
                      ? 'text-amber-700'
                      : 'text-studio-teal'
                }
              >
                {band.name}
              </span>
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
    </>
  )
}

/**
 * Super Admin Engine — "How ELAYA works".
 * Numbers always come from the current Engine (draft if one exists).
 * Wording is editable, saved as engine_explainer DRAFT, LIVE after Publish.
 */
const EngineHowItWorks = ({
  canEdit = false,
  refreshKey = 0,
  onPublished,
  onDraftDiscarded,
}) => {
  const { adminPages, i18n } = useContent()
  const fallback = adminPages.engine?.how || {}
  const editorCopy = adminPages.engine?.howEditor || {}
  const uiLang = (i18n?.language || 'de').startsWith('en') ? 'en' : 'de'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editLang, setEditLang] = useState(uiLang)
  const [bundle, setBundle] = useState(null)
  const [working, setWorking] = useState(null)
  const [lifecycle, setLifecycle] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getEngineHowItWorks(uiLang)
      const data = res.data.data
      setBundle(data)
      setWorking(data.explainer)
      setLifecycle({
        has_draft: Boolean(data.has_draft?.engine_explainer),
        current_version: data.versions?.engine_explainer || 0,
      })
    } catch (err) {
      toast.error(getApiErrorMessage(err, editorCopy.loadError || 'Could not load explanation'))
    } finally {
      setLoading(false)
    }
  }, [uiLang, editorCopy.loadError])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  const facts = bundle?.facts || {}
  const previewCopy = useMemo(() => {
    if (!working || !bundle?.view) return fallback
    const filled = fillDeep(working[uiLang] || working.de || {}, facts)
    return {
      ...bundle.view,
      ...filled,
      liveDraft: { ...(bundle.view.liveDraft || {}), ...(filled.liveDraft || {}) },
      delta: { ...(bundle.view.delta || {}), ...(filled.delta || {}) },
      calc: { ...(bundle.view.calc || {}), ...(filled.calc || {}) },
      lifestyle: { ...(bundle.view.lifestyle || {}), ...(filled.lifestyle || {}) },
    }
  }, [working, bundle, facts, uiLang, fallback])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await saveConfigDraft('engine_explainer', working, editorCopy.draftNote || '')
      setLifecycle({
        has_draft: true,
        current_version: res.data.data?.current_version || lifecycle?.current_version || 0,
      })
      toast.success(editorCopy.saved || 'Draft saved')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, editorCopy.saveFailed || 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading && !bundle) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {canEdit ? (
        <ConfigLifecycleBar
          domain="engine_explainer"
          canEdit={canEdit}
          hasDraft={Boolean(lifecycle?.has_draft)}
          currentVersion={lifecycle?.current_version || 0}
          onPublished={(payload) => {
            onPublished?.(payload)
            void load()
          }}
          onDraftDiscarded={(life) => {
            onDraftDiscarded?.(life)
            void load()
          }}
        />
      ) : null}

      <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 px-4 py-3 text-[12px] text-studio-w1 leading-relaxed">
        <p className="m-0 font-semibold text-studio-white mb-1">
          {editorCopy.factsTitle || 'Current Engine rule (always from the numbers, not from this text)'}
        </p>
        <p className="m-0">
          {(editorCopy.factsLine ||
            'Base {{base}} · range −{{minus}} / +{{plus}} · clamp {{min}}–{{max}} · price MAX({{minPrice}} CHF, area × {{price}} CHF) rounded up to CHF {{round}} · colours: {{colors}}')
            .replace('{{base}}', facts.base_sessions ?? '—')
            .replace('{{minus}}', facts.range_minus ?? '—')
            .replace('{{plus}}', facts.range_plus ?? '—')
            .replace('{{min}}', facts.min_sessions ?? '—')
            .replace('{{max}}', facts.max_sessions ?? '—')
            .replace('{{minPrice}}', facts.min_price ?? '—')
            .replace('{{price}}', facts.price_per_cm2 ?? '—')
            .replace('{{round}}', facts.price_round_to ?? '—')
            .replace('{{colors}}', facts.color_aggregation_rule ?? '—')}
        </p>
        <p className="m-0 mt-1 text-studio-w3">
          {editorCopy.placeholderHint ||
            'Placeholders such as {{base_sessions}} and {{range_minus}} are filled from the Engine when you save. Do not type the range as a fixed −1/+1.'}
        </p>
      </div>

      {canEdit ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={editing ? 'secondary' : 'ghost'}
            onClick={() => setEditing((v) => !v)}
          >
            <Pencil size={14} />
            {editing ? editorCopy.closeEditor || 'Close editor' : editorCopy.editWording || 'Edit wording'}
          </Button>
        </div>
      ) : null}

      {editing && canEdit ? (
        <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5 flex flex-col gap-4">
          <div className="flex gap-2">
            {['de', 'en'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setEditLang(code)}
                className={`px-3 py-1.5 rounded-[8px] text-[12px] border cursor-pointer ${
                  editLang === code
                    ? 'border-studio-gold text-studio-gold-2 bg-studio-bg-4'
                    : 'border-elaya-border text-studio-w2 bg-transparent'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          {FIELD_GROUPS.map((group) => (
            <div key={group.id} className="flex flex-col gap-3">
              {group.paths.map((path) => {
                const value = getPath(working?.[editLang], path) || ''
                return (
                  <label key={path.join('.')} className="text-[11px] font-semibold text-studio-w2">
                    {path.join(' · ')}
                    <textarea
                      rows={3}
                      className="mt-1 w-full px-3 py-2 rounded-[10px] border border-elaya-border-strong bg-studio-bg-4 text-studio-white text-[12px] outline-none resize-y"
                      value={value}
                      onChange={(e) =>
                        setWorking((prev) => ({
                          ...prev,
                          [editLang]: setPath(prev?.[editLang] || {}, path, e.target.value),
                        }))
                      }
                    />
                  </label>
                )
              })}
            </div>
          ))}
          <div className="flex justify-end">
            <Button loading={saving} onClick={() => void handleSave()}>
              {editorCopy.saveDraft || 'Save draft'}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-elaya-border bg-studio-bg-3 p-5 flex flex-col gap-4">
        <h3 className="flex items-center gap-2 text-studio-white text-[14px] font-semibold m-0">
          <BookOpen size={16} className="text-studio-gold-2" />
          {previewCopy.title || fallback.title || 'How does ELAYA work?'}
        </h3>
        <HowCards copy={previewCopy} />
      </div>
    </div>
  )
}

export default EngineHowItWorks
