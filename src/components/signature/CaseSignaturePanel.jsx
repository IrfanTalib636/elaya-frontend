import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FileSignature, Pencil } from 'lucide-react'
import { getCaseMerkblatt, submitCaseSignature, fetchCaseSignatureImage } from '../../api/signature'
import { getApiErrorMessage } from '../../lib/apiError'
import { Card, Button, Spinner, Modal } from '../ui'
import SignatureCanvas from './SignatureCanvas'
import useContent from '../../i18n/useContent'

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('de-CH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const SignatureWizardModal = ({ caseId, onClose, onSaved }) => {
  const { t, components, language } = useContent()
  const copy = components.signature
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [merkblatt, setMerkblatt] = useState(null)
  const [merkblattRead, setMerkblattRead] = useState(false)
  const [sigData, setSigData] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const locale = (language || 'de').startsWith('en') ? 'en' : 'de'
        const res = await getCaseMerkblatt(caseId, { locale })
        if (!cancelled) setMerkblatt(res.data.data)
      } catch (err) {
        if (!cancelled) toast.error(getApiErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [caseId, language])

  const handleSubmit = async () => {
    if (!sigData) {
      toast.error(copy.needSignature)
      return
    }
    setSubmitting(true)
    try {
      const res = await submitCaseSignature(caseId, {
        merkblatt_gelesen: true,
        bestaetigung_text: true,
        unterschrift_data: sigData,
      })
      toast.success(copy.saved)
      await onSaved?.(res.data.data)
      onClose()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const labels = merkblatt?.labels ?? {}
  const sections = merkblatt?.sections ?? []
  const caseInfo = merkblatt?.case
  const customer = merkblatt?.customer
  const stepLabels = [copy.stepLeaflet, copy.stepSignature]

  return (
    <Modal title={copy.wizardTitle} onClose={onClose} width="max-w-2xl" scrollResetKey={step}>
      <div className="flex flex-col gap-5">
        <div className="flex gap-1.5">
          {stepLabels.map((label, i) => (
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

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="sm" />
          </div>
        ) : step === 0 ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-studio-teal-2 text-[10px] font-mono tracking-widest m-0 mb-1">TC_08</p>
              <h3 className="text-studio-white text-[18px] font-bold m-0">{copy.leafletHeading}</h3>
              <p className="text-studio-w3 text-[12px] mt-1 mb-0">
                {copy.leafletIntro}
              </p>
            </div>

            <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 p-4 max-h-[320px] overflow-y-auto flex flex-col gap-4">
              {sections.map((section) => (
                <div key={section.id}>
                  {section.title && (
                    <p className="text-studio-gold text-[12px] font-bold m-0 mb-2">{section.title}</p>
                  )}
                  {section.paragraphs.map((p, idx) => (
                    <p key={`${section.id}-${idx}`} className="text-studio-w2 text-[12px] leading-relaxed m-0 mb-2">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
              <p className="text-studio-w4 text-[11px] m-0 leading-relaxed">{labels.footer_contact}</p>
            </div>

            <button
              type="button"
              onClick={() => setMerkblattRead((v) => !v)}
              className={`flex items-start gap-3 rounded-[12px] border p-4 text-left cursor-pointer transition-colors ${
                merkblattRead
                  ? 'border-studio-teal-2/30 bg-studio-teal-2/5'
                  : 'border-elaya-border bg-studio-bg-4'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0 text-[12px] ${
                  merkblattRead
                    ? 'border-studio-teal-2 bg-studio-teal-2/20 text-studio-teal-2'
                    : 'border-elaya-border-strong'
                }`}
              >
                {merkblattRead ? '✓' : ''}
              </span>
              <span className="text-[12px] text-studio-w2 leading-relaxed m-0">
                {labels.checkbox_merkblatt} *
              </span>
            </button>

            <div className="flex justify-between gap-3 pt-2 border-t border-elaya-border">
              <Button size="sm" variant="secondary" onClick={onClose}>
                {copy.cancel}
              </Button>
              <Button size="sm" disabled={!merkblattRead} onClick={() => setStep(1)}>
                {copy.continue}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-studio-teal-2 text-[10px] font-mono tracking-widest m-0 mb-1">TC_09</p>
              <h3 className="text-studio-white text-[18px] font-bold m-0">{copy.confirmHeading}</h3>
            </div>

            <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4 p-4 flex flex-col gap-1">
              {[
                [copy.labelName, customer ? `${customer.vorname} ${customer.nachname}`.trim() : '—'],
                [copy.labelCase, caseInfo?.bodyLabel || caseInfo?.tc_title || '—'],
                [copy.labelDate, new Date().toLocaleDateString('de-CH')],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between text-[12px] py-1 border-b border-elaya-border last:border-0"
                >
                  <span className="text-studio-w3">{k}</span>
                  <span className="text-studio-w1 font-semibold">{v}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[12px] border border-elaya-border bg-studio-bg-4/50 p-4 text-[12px] text-studio-w3 leading-relaxed">
              {labels.confirmation_text}
              {caseInfo?.type === 'tattoo' && labels.confirmation_anamnesis_extra && (
                <>
                  <br />
                  <br />
                  {labels.confirmation_anamnesis_extra}
                </>
              )}
            </div>

            <SignatureCanvas onChange={setSigData} />

            <div className="flex justify-between gap-3 pt-2 border-t border-elaya-border">
              <Button size="sm" variant="secondary" onClick={() => setStep(0)}>
                {t('common.back')}
              </Button>
              <Button size="sm" loading={submitting} disabled={!sigData} onClick={handleSubmit}>
                {copy.confirmBtn}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

const CaseSignaturePanel = ({ caseId, caseData, onUpdated }) => {
  const { t, components } = useContent()
  const copy = components.signature
  const [wizardOpen, setWizardOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  const signed = caseData?.signature_complete || !!caseData?.unterschrift?.zeitstempel
  const canSign = caseData?.anamnesis_complete

  useEffect(() => {
    if (!signed || !caseId) {
      setPreviewUrl('')
      return undefined
    }

    let cancelled = false
    let objectUrl = ''
    const stamp = caseData?.unterschrift?.zeitstempel || Date.now()

    setPreviewUrl('')

    ;(async () => {
      try {
        const res = await fetchCaseSignatureImage(caseId, { t: stamp })
        if (cancelled) {
          return
        }
        objectUrl = URL.createObjectURL(res.data)
        setPreviewUrl(objectUrl)
      } catch {
        if (!cancelled) setPreviewUrl('')
      }
    })()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [signed, caseId, caseData?.unterschrift?.zeitstempel])

  const handleSaved = async () => {
    setPreviewUrl('')
    setLightboxOpen(false)
    setWizardOpen(false)
    await onUpdated?.()
  }

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileSignature size={14} className="text-studio-gold shrink-0" />
            <h2 className="text-[13px] font-semibold text-studio-white m-0">{copy.panelTitle}</h2>
          </div>
          {canSign && (
            <Button size="sm" variant="secondary" onClick={() => setWizardOpen(true)}>
              <Pencil size={12} />
              {signed ? copy.resign : copy.sign}
            </Button>
          )}
        </div>

        {!caseData?.anamnesis_complete ? (
          <div className="rounded-[10px] border border-elaya-warning/30 bg-elaya-warning/5 px-4 py-3">
            <p className="text-elaya-warning text-[12px] font-semibold m-0">{copy.anamnesisFirstTitle}</p>
            <p className="text-studio-w3 text-[11px] mt-1 mb-0 leading-relaxed">
              {copy.anamnesisFirstDesc}
            </p>
          </div>
        ) : signed ? (
          <>
            <div className="rounded-[10px] border border-studio-teal-2/30 bg-studio-teal-2/10 px-3 py-2.5">
              <p className="text-studio-teal-2 text-[13px] font-bold m-0">{copy.present}</p>
            </div>
            <p className="text-studio-w3 text-[11px] m-0">
              {t('components.signature.signedAt', { date: fmtDateTime(caseData.unterschrift?.zeitstempel) })}
            </p>
            {caseData.unterschrift?.merkblatt_gelesen && (
              <p className="text-studio-w3 text-[11px] m-0">{copy.leafletRead}</p>
            )}
            {previewUrl && (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="self-start p-0 m-0 bg-transparent border-0 cursor-zoom-in group"
                title={copy.clickToEnlarge}
              >
                <img
                  src={previewUrl}
                  alt={copy.alt}
                  className="block max-w-[240px] rounded-[8px] border border-elaya-border bg-white group-hover:border-studio-teal-2/50 transition-colors"
                />
                <span className="block text-studio-w4 text-[10px] mt-1.5 text-left">
                  {copy.clickToEnlarge}
                </span>
              </button>
            )}
          </>
        ) : (
          <div className="rounded-[10px] border border-elaya-warning/30 bg-elaya-warning/5 px-4 py-3">
            <p className="text-elaya-warning text-[12px] font-semibold m-0">{copy.pendingTitle}</p>
            <p className="text-studio-w3 text-[11px] mt-1 mb-0 leading-relaxed">
              {copy.pendingDesc}
            </p>
          </div>
        )}
      </Card>

      {wizardOpen && (
        <SignatureWizardModal caseId={caseId} onClose={() => setWizardOpen(false)} onSaved={handleSaved} />
      )}

      {lightboxOpen && previewUrl && (
        <Modal title={copy.lightboxTitle} onClose={() => setLightboxOpen(false)} width="max-w-xl">
          <div className="flex flex-col gap-3">
            <div className="rounded-[12px] border border-elaya-border bg-white p-4 flex items-center justify-center min-h-[160px]">
              <img
                src={previewUrl}
                alt={copy.previewAlt}
                className="max-w-full max-h-[50vh] object-contain"
              />
            </div>
            <p className="text-studio-w3 text-[12px] m-0">
              {t('components.signature.signedAt', { date: fmtDateTime(caseData.unterschrift?.zeitstempel) })}
            </p>
            <div className="flex justify-end pt-1">
              <Button size="sm" variant="secondary" onClick={() => setLightboxOpen(false)}>
                {copy.close}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default CaseSignaturePanel
export { SignatureWizardModal }
