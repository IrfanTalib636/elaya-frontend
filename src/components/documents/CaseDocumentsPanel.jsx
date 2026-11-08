import { useCallback, useEffect, useState } from 'react'
import { Download, Eye, FileText, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { listCaseDocuments, openCaseDocument } from '../../api/caseDocuments'
import { Card, Button, Spinner } from '../ui'
import useContent from '../../i18n/useContent'

const TYPE_LABELS = {
  medical_anamnesis: {
    de: 'Medizinische Anamnese',
    en: 'Medical anamnesis',
  },
  consent_merkblatt: {
    de: 'Einwilligung & Merkblatt',
    en: 'Consent & information sheet',
  },
}

const fmtDateTime = (value, lang) => {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'de-CH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return String(value)
  }
}

export default function CaseDocumentsPanel({ caseId }) {
  const { language } = useContent()
  const lang = language?.startsWith('en') ? 'en' : 'de'
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState([])
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    if (!caseId) return
    setLoading(true)
    try {
      const res = await listCaseDocuments(caseId, { locale: lang })
      setDocs(res.data?.data?.documents ?? [])
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Documents could not be loaded')
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [caseId, lang])

  useEffect(() => {
    void load()
  }, [load])

  const onOpen = async (doc, download) => {
    setBusyId(`${doc.id}:${download ? 'dl' : 'view'}`)
    try {
      const filename = `${doc.case?.caseId || 'case'}-${doc.type}-v${doc.version}.pdf`
      await openCaseDocument(caseId, doc.id, { download, filename })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'PDF could not be opened')
    } finally {
      setBusyId(null)
    }
  }

  const title = lang === 'en' ? 'Document center' : 'Dokumentencenter'
  const empty =
    lang === 'en'
      ? 'No signed documents yet. They appear after the customer completes the signature.'
      : 'Noch keine unterschriebenen Dokumente. Sie erscheinen nach der Unterschrift.'

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-studio-gold shrink-0" />
          <h2 className="text-[13px] font-semibold text-studio-white m-0 uppercase tracking-wide">
            {title}
          </h2>
        </div>
        <Button size="sm" variant="ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={12} />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
        </div>
      ) : docs.length === 0 ? (
        <p className="text-studio-w3 text-[12px] m-0">{empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {docs.map((doc) => {
            const typeLabel =
              TYPE_LABELS[doc.type]?.[lang] || doc.title || doc.type
            return (
              <div
                key={doc.id}
                className="rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-studio-white text-[13px] font-semibold m-0">
                      {typeLabel}
                      <span className="text-studio-w3 font-normal">
                        {' '}
                        · Version {doc.version}
                      </span>
                    </p>
                    <p className="text-studio-w3 text-[11px] m-0 mt-1">
                      {doc.case?.caseId || '—'}
                      {doc.studio?.name ? ` · ${doc.studio.name}` : ''}
                    </p>
                    <p className="text-studio-w3 text-[11px] m-0 mt-0.5">
                      {fmtDateTime(doc.signed_at, lang)}
                      {' · '}
                      <span className="text-elaya-success font-semibold">
                        {lang === 'en' ? 'Signed' : 'Unterschrieben'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyId === `${doc.id}:view`}
                    onClick={() => void onOpen(doc, false)}
                  >
                    <Eye size={12} />
                    {lang === 'en' ? 'View PDF' : 'PDF ansehen'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyId === `${doc.id}:dl`}
                    onClick={() => void onOpen(doc, true)}
                  >
                    <Download size={12} />
                    {lang === 'en' ? 'Download PDF' : 'PDF herunterladen'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
