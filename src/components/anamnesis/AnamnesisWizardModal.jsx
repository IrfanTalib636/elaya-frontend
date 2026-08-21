import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { previewCaseAnamnesis, upsertCaseAnamnesis } from '../../api/anamnesis'
import { getApiErrorMessage } from '../../lib/apiError'
import { Modal, Button } from '../ui'
import {
  EMPTY_ANAMNESIS,
  computeAmpel,
  computeInlineHints,
  isAnamnesisComplete,
  pickAnamnesisAnswers,
  AMPEL_LABELS,
} from '../../utils/anamnesisAmpel'
import useContent from '../../i18n/useContent'

const HAUT_KEYS = ['nein', 'neurodermitis', 'psoriasis', 'ekzem', 'vitiligo', 'akne', 'herpes', 'andere']
const INFEKT_KEYS = ['nein', 'hepatitis', 'hiv', 'andere']
const DIABETES_KEYS = ['nein', 'typ1', 'typ2', 'unbekannt']
const STEP_IDS = ['skin', 'health1', 'health2', 'closing', 'summary']

const Opt = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-[8px] text-[12px] border cursor-pointer transition-colors
      ${active
        ? 'border-studio-gold/50 bg-studio-gold/15 text-studio-white font-semibold'
        : 'border-elaya-border bg-studio-bg-4 text-studio-w2 hover:border-elaya-border-strong hover:text-studio-white'
      }`}
  >
    {children}
  </button>
)

const Question = ({ num, label, children, hint }) => (
  <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 p-4 flex flex-col gap-3">
    <p className="text-studio-white text-[13px] font-semibold m-0">{num}. {label}</p>
    {children}
    {hint?.text && (
      <div
        className={`rounded-[10px] border px-3 py-2 text-[11px] leading-relaxed ${
          hint.level === 'orange'
            ? 'border-studio-gold/30 bg-studio-gold/8 text-studio-gold'
            : 'border-studio-red/25 bg-studio-red/8 text-studio-red'
        }`}
      >
        {hint.text}
      </div>
    )}
  </div>
)

const JaNein = ({ value, onChange, yesLabel, noLabel }) => (
  <div className="flex flex-wrap gap-2">
    <Opt active={value === 'nein'} onClick={() => onChange('nein')}>{noLabel}</Opt>
    <Opt active={value === 'ja'} onClick={() => onChange('ja')}>{yesLabel}</Opt>
  </div>
)

const SectionTitle = ({ children }) => (
  <p className="text-studio-teal-2 text-[10px] font-semibold uppercase tracking-widest m-0">{children}</p>
)

const AnamnesisWizardModal = ({ caseId, initialAnswers, onClose, onSaved }) => {
  const { components } = useContent()
  const w = components.anamnesis.wizard
  const [form, setForm] = useState(() => ({
    ...EMPTY_ANAMNESIS,
    ...pickAnamnesisAnswers(initialAnswers),
  }))
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [previewHints, setPreviewHints] = useState(null)
  const previewSeqRef = useRef(0)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const toggleMulti = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || []
      if (value === 'nein') return { ...prev, [field]: ['nein'] }
      const withoutNein = current.filter((x) => x !== 'nein')
      const next = withoutNein.includes(value)
        ? withoutNein.filter((x) => x !== value)
        : [...withoutNein, value]
      return { ...prev, [field]: next.length ? next : [] }
    })
  }

  const localEval = useMemo(() => computeInlineHints(form), [form])
  const hintsByKey = {
    ...localEval.hintsByKey,
    ...(previewHints?.hintsByKey ?? {}),
  }
  const has_ko_flags = previewHints?.has_ko_flags ?? localEval.has_ko_flags

  const ampel = useMemo(() => computeAmpel(form), [form])
  const ampelMeta = AMPEL_LABELS[ampel.ampel_status]

  const steps = STEP_IDS.map((id) => w.steps[id])

  useEffect(() => {
    if (!caseId) return undefined

    let cancelled = false
    const seq = ++previewSeqRef.current

    const timer = window.setTimeout(async () => {
      try {
        const res = await previewCaseAnamnesis(caseId, {
          antworten: pickAnamnesisAnswers(form),
        })
        if (cancelled || seq !== previewSeqRef.current) return
        const hints = res.data.data?.inline_hints ?? []
        const byKey = Object.fromEntries(
          hints.map((h) => [
            h.frage_key,
            { level: h.level, text: h.text_de || h.text_en || '' },
          ])
        )
        setPreviewHints({
          hintsByKey: byKey,
          has_ko_flags: !!res.data.data?.has_ko_flags,
        })
      } catch {
        if (!cancelled && seq === previewSeqRef.current) setPreviewHints(null)
      }
    }, 150)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [caseId, form])

  const handleSubmit = async () => {
    if (!isAnamnesisComplete(form)) {
      toast.error(w.incomplete)
      return
    }

    setLoading(true)
    try {
      const answers = pickAnamnesisAnswers(form)
      const res = await upsertCaseAnamnesis(caseId, {
        antworten: { ...answers, ausgefuellt_im_studio: true },
      })
      toast.success(w.saved)
      if (onSaved) {
        await onSaved(res.data.data)
      } else {
        onClose()
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={w.title} onClose={onClose} width="max-w-2xl" scrollResetKey={step}>
      <div className="flex flex-col gap-5">
        <div className="flex gap-1.5 flex-wrap">
          {steps.map((label, i) => (
            <span
              key={STEP_IDS[i]}
              className={`text-[10px] px-2.5 py-1 rounded-full border ${
                i === step
                  ? 'border-studio-gold/40 bg-studio-gold/10 text-studio-white font-semibold'
                  : i < step
                    ? 'border-studio-teal-2/30 text-studio-teal-2'
                    : 'border-elaya-border text-studio-w3'
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <SectionTitle>{w.sectionSkin}</SectionTitle>
            <Question num={1} label={w.q1} hint={hintsByKey.hauterkrankungen}>
              <div className="flex flex-wrap gap-2">
                {HAUT_KEYS.map((v) => (
                  <Opt key={v} active={(form.hauterkrankungen || []).includes(v)} onClick={() => toggleMulti('hauterkrankungen', v)}>
                    {w.haut[v]}
                  </Opt>
                ))}
              </div>
              {(form.hauterkrankungen || []).includes('andere') && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder={w.specifyPh}
                  value={form.hauterkrankungen_andere}
                  onChange={(e) => set('hauterkrankungen_andere', e.target.value)}
                />
              )}
            </Question>
            <Question num={2} label={w.q2} hint={hintsByKey.pigmentstoerungen}>
              <JaNein value={form.pigmentstoerungen} onChange={(v) => set('pigmentstoerungen', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <SectionTitle>{w.sectionHealth1}</SectionTitle>
            <Question num={3} label={w.q3} hint={hintsByKey.akute_erkrankung}>
              <JaNein value={form.akute_erkrankung} onChange={(v) => set('akute_erkrankung', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            <Question num={4} label={w.q4} hint={hintsByKey.chronische_erkrankungen}>
              <JaNein value={form.chronische_erkrankungen} onChange={(v) => set('chronische_erkrankungen', v)} yesLabel={w.yes} noLabel={w.no} />
              {form.chronische_erkrankungen === 'ja' && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder={w.whichOptional}
                  value={form.chronische_erkrankungen_text}
                  onChange={(e) => set('chronische_erkrankungen_text', e.target.value)}
                />
              )}
            </Question>
            <Question num={5} label={w.q5} hint={hintsByKey.diabetes}>
              <div className="flex flex-wrap gap-2">
                {DIABETES_KEYS.map((v) => (
                  <Opt key={v} active={form.diabetes === v} onClick={() => set('diabetes', v)}>{w.diabetes[v]}</Opt>
                ))}
              </div>
            </Question>
            <Question num={6} label={w.q6} hint={hintsByKey.autoimmun}>
              <JaNein value={form.autoimmun} onChange={(v) => set('autoimmun', v)} yesLabel={w.yes} noLabel={w.no} />
              {form.autoimmun === 'ja' && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder={w.whichOptional}
                  value={form.autoimmun_text}
                  onChange={(e) => set('autoimmun_text', e.target.value)}
                />
              )}
            </Question>
            <Question num={7} label={w.q7} hint={hintsByKey.immunschwaeche}>
              <JaNein value={form.immunschwaeche} onChange={(v) => set('immunschwaeche', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <SectionTitle>{w.sectionHealth2}</SectionTitle>
            <Question num={8} label={w.q8} hint={hintsByKey.herz_kreislauf}>
              <JaNein value={form.herz_kreislauf} onChange={(v) => set('herz_kreislauf', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            <Question num={9} label={w.q9} hint={hintsByKey.epilepsie}>
              <JaNein value={form.epilepsie} onChange={(v) => set('epilepsie', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            <Question num={10} label={w.q10} hint={hintsByKey.blutgerinnung}>
              <JaNein value={form.blutgerinnung} onChange={(v) => set('blutgerinnung', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            <Question num={11} label={w.q11} hint={hintsByKey.blutverduenner}>
              <JaNein value={form.blutverduenner} onChange={(v) => set('blutverduenner', v)} yesLabel={w.yes} noLabel={w.no} />
              {form.blutverduenner === 'ja' && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder={w.whichOptional}
                  value={form.blutverduenner_text}
                  onChange={(e) => set('blutverduenner_text', e.target.value)}
                />
              )}
            </Question>
            <Question num={12} label={w.q12} hint={hintsByKey.infektionskrankheiten}>
              <div className="flex flex-wrap gap-2">
                {INFEKT_KEYS.map((v) => (
                  <Opt key={v} active={(form.infektionskrankheiten || []).includes(v)} onClick={() => toggleMulti('infektionskrankheiten', v)}>
                    {w.infekt[v]}
                  </Opt>
                ))}
              </div>
            </Question>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <SectionTitle>{w.sectionClosing}</SectionTitle>
            <Question num={13} label={w.q13} hint={hintsByKey.allergien}>
              <JaNein value={form.allergien} onChange={(v) => set('allergien', v)} yesLabel={w.yes} noLabel={w.no} />
              {form.allergien === 'ja' && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder={w.whichOptional}
                  value={form.allergien_text}
                  onChange={(e) => set('allergien_text', e.target.value)}
                />
              )}
            </Question>
            <Question num={14} label={w.q14} hint={hintsByKey.wundheilung}>
              <JaNein value={form.wundheilung} onChange={(v) => set('wundheilung', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            <Question num={15} label={w.q15} hint={hintsByKey.herpes_bereich}>
              <JaNein value={form.herpes_bereich} onChange={(v) => set('herpes_bereich', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            <Question num={16} label={w.q16} hint={hintsByKey.schwanger}>
              <div className="flex flex-wrap gap-2">
                {[['nein', w.no], ['ja', w.yes], ['unsicher', w.unsure]].map(([v, l]) => (
                  <Opt key={v} active={form.schwanger === v} onClick={() => set('schwanger', v)}>{l}</Opt>
                ))}
              </div>
            </Question>
            <Question num={17} label={w.q17} hint={hintsByKey.alkohol_drogen}>
              <JaNein value={form.alkohol_drogen} onChange={(v) => set('alkohol_drogen', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            <Question num={18} label={w.q18} hint={hintsByKey.urteilsfaehig}>
              <JaNein value={form.urteilsfaehig} onChange={(v) => set('urteilsfaehig', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            <Question num={19} label={w.q19} hint={hintsByKey.mindestalter_18}>
              <JaNein value={form.mindestalter_18} onChange={(v) => set('mindestalter_18', v)} yesLabel={w.yes} noLabel={w.no} />
            </Question>
            {has_ko_flags && step === 3 && (
              <div className="rounded-[12px] border border-studio-red/30 bg-studio-red/8 px-4 py-3 text-[12px] text-studio-w2 leading-relaxed">
                <p className="text-studio-red font-semibold m-0 mb-1">{w.koBannerTitle}</p>
                {w.koBannerBody}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className={`rounded-[12px] border px-4 py-3 ${ampelMeta.className}`}>
              <p className="text-[14px] font-bold m-0">{ampelMeta.emoji} {ampelMeta.label}</p>
            </div>
            {ampel.orange_fragen.length > 0 && (
              <div className="rounded-[12px] border border-studio-gold/25 bg-studio-gold/5 p-4">
                <p className="text-studio-gold text-[12px] font-semibold m-0 mb-2">{w.studioHints}</p>
                <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                  {ampel.orange_fragen.map((f) => (
                    <li key={f.frage_text} className="text-[12px] text-studio-w2">· {f.frage_text}: <strong className="text-studio-white">{f.antwort}</strong></li>
                  ))}
                </ul>
              </div>
            )}
            {ampel.rote_fragen.length > 0 && (
              <div className="rounded-[12px] border border-studio-red/25 bg-studio-red/5 p-4">
                <p className="text-studio-red text-[12px] font-semibold m-0 mb-2">{w.clarificationNeeded}</p>
                <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                  {ampel.rote_fragen.map((f) => (
                    <li key={f.frage_text} className="text-[12px] text-studio-w2">· {f.frage_text}: <strong className="text-studio-white">{f.antwort}</strong></li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-studio-w3 text-[11px] m-0 leading-relaxed">
              {w.confirmTruth}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-elaya-border">
          <Button
            size="sm"
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            {w.back}
          </Button>
          {step < steps.length - 1 ? (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              {w.next}
            </Button>
          ) : (
            <Button size="sm" loading={loading} onClick={handleSubmit}>
              {w.save}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AnamnesisWizardModal
