import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { upsertCaseAnamnesis } from '../../api/anamnesis'
import { getApiErrorMessage } from '../../lib/apiError'
import { Modal, Button } from '../ui'
import {
  EMPTY_ANAMNESIS,
  computeAmpel,
  isAnamnesisComplete,
  pickAnamnesisAnswers,
  AMPEL_LABELS,
} from '../../utils/anamnesisAmpel'

const HAUT_OPTIONS = [
  ['nein', 'Nein'],
  ['neurodermitis', 'Neurodermitis'],
  ['psoriasis', 'Psoriasis'],
  ['ekzem', 'Ekzem'],
  ['vitiligo', 'Vitiligo'],
  ['akne', 'Akne'],
  ['herpes', 'Herpes'],
  ['andere', 'Andere'],
]

const INFEKT_OPTIONS = [
  ['nein', 'Nein'],
  ['hepatitis', 'Hepatitis'],
  ['hiv', 'HIV'],
  ['andere', 'Andere'],
]

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

const Question = ({ num, label, children }) => (
  <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 p-4 flex flex-col gap-3">
    <p className="text-studio-white text-[13px] font-semibold m-0">{num}. {label}</p>
    {children}
  </div>
)

const JaNein = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    <Opt active={value === 'nein'} onClick={() => onChange('nein')}>Nein</Opt>
    <Opt active={value === 'ja'} onClick={() => onChange('ja')}>Ja</Opt>
  </div>
)

const SectionTitle = ({ children }) => (
  <p className="text-studio-teal-2 text-[10px] font-semibold uppercase tracking-widest m-0">{children}</p>
)

const AnamnesisWizardModal = ({ caseId, initialAnswers, onClose, onSaved }) => {
  const [form, setForm] = useState(() => ({
    ...EMPTY_ANAMNESIS,
    ...pickAnamnesisAnswers(initialAnswers),
  }))
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

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

  const ampel = computeAmpel(form)
  const ampelMeta = AMPEL_LABELS[ampel.ampel_status]

  const steps = ['Haut', 'Gesundheit I', 'Gesundheit II', 'Abschluss', 'Zusammenfassung']

  const handleSubmit = async () => {
    if (!isAnamnesisComplete(form)) {
      toast.error('Bitte alle Fragen beantworten.')
      return
    }

    setLoading(true)
    try {
      const answers = pickAnamnesisAnswers(form)
      const res = await upsertCaseAnamnesis(caseId, {
        antworten: { ...answers, ausgefuellt_im_studio: true },
      })
      toast.success('Anamnese gespeichert.')
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

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <Modal title="Medizinische Anamnese" onClose={onClose} width="max-w-2xl">
      <div className="flex flex-col gap-5">
        <div className="flex gap-1.5 flex-wrap">
          {steps.map((label, i) => (
            <span
              key={label}
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
            <SectionTitle>Abschnitt 1 — Hauterkrankungen</SectionTitle>
            <Question num={1} label="Haben Sie Hauterkrankungen? (Mehrfachauswahl)">
              <div className="flex flex-wrap gap-2">
                {HAUT_OPTIONS.map(([v, l]) => (
                  <Opt key={v} active={(form.hauterkrankungen || []).includes(v)} onClick={() => toggleMulti('hauterkrankungen', v)}>
                    {l}
                  </Opt>
                ))}
              </div>
              {(form.hauterkrankungen || []).includes('andere') && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder="Bitte angeben…"
                  value={form.hauterkrankungen_andere}
                  onChange={(e) => set('hauterkrankungen_andere', e.target.value)}
                />
              )}
            </Question>
            <Question num={2} label="Pigmentstörungen oder helle/dunkle Flecken nach Verletzungen?">
              <JaNein value={form.pigmentstoerungen} onChange={(v) => set('pigmentstoerungen', v)} />
            </Question>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <SectionTitle>Abschnitt 2 — Allgemeine Gesundheit</SectionTitle>
            <Question num={3} label="Akute Erkrankung, Fieber oder Infektion?">
              <JaNein value={form.akute_erkrankung} onChange={(v) => set('akute_erkrankung', v)} />
            </Question>
            <Question num={4} label="Chronische Erkrankungen?">
              <JaNein value={form.chronische_erkrankungen} onChange={(v) => set('chronische_erkrankungen', v)} />
              {form.chronische_erkrankungen === 'ja' && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder="Welche? (optional)"
                  value={form.chronische_erkrankungen_text}
                  onChange={(e) => set('chronische_erkrankungen_text', e.target.value)}
                />
              )}
            </Question>
            <Question num={5} label="Diabetes?">
              <div className="flex flex-wrap gap-2">
                {[['nein', 'Nein'], ['typ1', 'Typ 1'], ['typ2', 'Typ 2'], ['unbekannt', 'Weiss nicht']].map(([v, l]) => (
                  <Opt key={v} active={form.diabetes === v} onClick={() => set('diabetes', v)}>{l}</Opt>
                ))}
              </div>
            </Question>
            <Question num={6} label="Autoimmunerkrankung?">
              <JaNein value={form.autoimmun} onChange={(v) => set('autoimmun', v)} />
              {form.autoimmun === 'ja' && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder="Welche? (optional)"
                  value={form.autoimmun_text}
                  onChange={(e) => set('autoimmun_text', e.target.value)}
                />
              )}
            </Question>
            <Question num={7} label="Immunschwäche oder immunsuppressive Medikamente?">
              <JaNein value={form.immunschwaeche} onChange={(v) => set('immunschwaeche', v)} />
            </Question>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <SectionTitle>Abschnitt 3 — Weitere Angaben</SectionTitle>
            <Question num={8} label="Herz- oder Kreislauferkrankung?">
              <JaNein value={form.herz_kreislauf} onChange={(v) => set('herz_kreislauf', v)} />
            </Question>
            <Question num={9} label="Epilepsie oder Krampfanfälle?">
              <JaNein value={form.epilepsie} onChange={(v) => set('epilepsie', v)} />
            </Question>
            <Question num={10} label="Blutgerinnungsstörung?">
              <JaNein value={form.blutgerinnung} onChange={(v) => set('blutgerinnung', v)} />
            </Question>
            <Question num={11} label="Blutverdünnende Medikamente?">
              <JaNein value={form.blutverduenner} onChange={(v) => set('blutverduenner', v)} />
              {form.blutverduenner === 'ja' && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder="Welche? (optional)"
                  value={form.blutverduenner_text}
                  onChange={(e) => set('blutverduenner_text', e.target.value)}
                />
              )}
            </Question>
            <Question num={12} label="Infektionskrankheiten? (Mehrfachauswahl)">
              <div className="flex flex-wrap gap-2">
                {INFEKT_OPTIONS.map(([v, l]) => (
                  <Opt key={v} active={(form.infektionskrankheiten || []).includes(v)} onClick={() => toggleMulti('infektionskrankheiten', v)}>
                    {l}
                  </Opt>
                ))}
              </div>
            </Question>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <SectionTitle>Abschnitt 4 — Abschlussfragen</SectionTitle>
            <Question num={13} label="Allergien?">
              <JaNein value={form.allergien} onChange={(v) => set('allergien', v)} />
              {form.allergien === 'ja' && (
                <input
                  className="w-full px-3 py-2 rounded-[8px] border border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[12px] outline-none focus:border-studio-gold"
                  placeholder="Welche? (optional)"
                  value={form.allergien_text}
                  onChange={(e) => set('allergien_text', e.target.value)}
                />
              )}
            </Question>
            <Question num={14} label="Schlechte Wundheilung oder frühere Laserbehandlungen?">
              <JaNein value={form.wundheilung} onChange={(v) => set('wundheilung', v)} />
            </Question>
            <Question num={15} label="Herpes im Behandlungsbereich?">
              <JaNein value={form.herpes_bereich} onChange={(v) => set('herpes_bereich', v)} />
            </Question>
            <Question num={16} label="Schwanger, stillend oder unsicher?">
              <div className="flex flex-wrap gap-2">
                {[['nein', 'Nein'], ['ja', 'Ja'], ['unsicher', 'Unsicher']].map(([v, l]) => (
                  <Opt key={v} active={form.schwanger === v} onClick={() => set('schwanger', v)}>{l}</Opt>
                ))}
              </div>
            </Question>
            <Question num={17} label="Unter Alkohol- oder Drogeneinfluss?">
              <JaNein value={form.alkohol_drogen} onChange={(v) => set('alkohol_drogen', v)} />
            </Question>
            <Question num={18} label="Sind Sie urteilsfähig?">
              <JaNein value={form.urteilsfaehig} onChange={(v) => set('urteilsfaehig', v)} />
            </Question>
            <Question num={19} label="Mindestens 18 Jahre alt?">
              <JaNein value={form.mindestalter_18} onChange={(v) => set('mindestalter_18', v)} />
            </Question>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className={`rounded-[12px] border px-4 py-3 ${ampelMeta.className}`}>
              <p className="text-[14px] font-bold m-0">{ampelMeta.emoji} {ampelMeta.label}</p>
            </div>
            {ampel.orange_fragen.length > 0 && (
              <div className="rounded-[12px] border border-studio-gold/25 bg-studio-gold/5 p-4">
                <p className="text-studio-gold text-[12px] font-semibold m-0 mb-2">Hinweise für das Studio</p>
                <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                  {ampel.orange_fragen.map((f) => (
                    <li key={f.frage_text} className="text-[12px] text-studio-w2">· {f.frage_text}: <strong className="text-studio-white">{f.antwort}</strong></li>
                  ))}
                </ul>
              </div>
            )}
            {ampel.rote_fragen.length > 0 && (
              <div className="rounded-[12px] border border-studio-red/25 bg-studio-red/5 p-4">
                <p className="text-studio-red text-[12px] font-semibold m-0 mb-2">Abklärung nötig</p>
                <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                  {ampel.rote_fragen.map((f) => (
                    <li key={f.frage_text} className="text-[12px] text-studio-w2">· {f.frage_text}: <strong className="text-studio-white">{f.antwort}</strong></li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-studio-w3 text-[11px] m-0 leading-relaxed">
              Mit dem Speichern bestätigen Sie, dass alle Angaben wahrheitsgemäss erfasst wurden.
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
            Zurück
          </Button>
          {step < steps.length - 1 ? (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              Weiter
            </Button>
          ) : (
            <Button size="sm" loading={loading} onClick={handleSubmit}>
              Anamnese speichern
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AnamnesisWizardModal
