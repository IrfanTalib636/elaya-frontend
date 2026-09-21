import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Power } from 'lucide-react'
import { PageHeader, Card, Button, Input, Spinner, Modal } from '../../components/ui'
import {
  listAdminDocuments,
  createAdminDocument,
  updateAdminDocument,
  toggleAdminDocumentActive,
  deleteAdminDocument,
} from '../../api/adminDocuments'
import { listAdminStudios } from '../../api/adminStudios'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'

const CATEGORIES = [
  'merkblatt',
  'anamnese_frage',
  'einwilligung',
  'faq',
  'sonstiges',
]
const VISIBILITY = ['customer_app', 'studio_dashboard']

const emptyForm = () => ({
  kategorie: 'merkblatt',
  titel_de: '',
  titel_en: '',
  inhalt_de: '',
  inhalt_en: '',
  geltungsbereich: 'global',
  zugewiesene_studios: [],
  sichtbar_in: ['customer_app', 'studio_dashboard'],
  aktiv: true,
})

const fieldClass =
  'w-full rounded-[10px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[13px] px-3 py-2 outline-none focus:border-studio-gold/50'
const labelClass = 'block text-studio-w2 text-[12px] mb-1.5'

const fmtDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

const AdminDocuments = () => {
  const { adminPages, t } = useContent()
  const copy = adminPages.documentsPage || {}
  const pageCopy = adminPages.documents || {}

  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [studios, setStudios] = useState([])
  const [filterKat, setFilterKat] = useState('alle')
  const [filterScope, setFilterScope] = useState('alle')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterKat !== 'alle') params.kategorie = filterKat
      if (filterScope !== 'alle') params.geltungsbereich = filterScope
      const [docRes, studioRes] = await Promise.all([
        listAdminDocuments({ ...params, limit: 100 }),
        listAdminStudios({ limit: 100 }).catch(() => null),
      ])
      setDocuments(docRes.data?.data?.documents || [])
      const list =
        studioRes?.data?.data?.studios ||
        studioRes?.data?.data?.items ||
        []
      setStudios(Array.isArray(list) ? list : [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError || 'Could not load documents'))
    } finally {
      setLoading(false)
    }
  }, [filterKat, filterScope, copy.loadError])

  useEffect(() => {
    void load()
  }, [load])

  const catLabel = (k) => copy.categories?.[k] || k
  const scopeLabel = (k) => copy.scopes?.[k] || k
  const visLabel = (arr) =>
    (arr || []).map((v) => copy.visibility?.[v] || v).join(', ') || '—'

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (doc) => {
    setEditing(doc)
    setForm({
      kategorie: doc.kategorie,
      titel_de: doc.titel_de || '',
      titel_en: doc.titel_en || '',
      inhalt_de: doc.inhalt_de || '',
      inhalt_en: doc.inhalt_en || '',
      geltungsbereich: doc.geltungsbereich || 'global',
      zugewiesene_studios: (doc.zugewiesene_studios || []).map((s) => s.id || s),
      sichtbar_in: [...(doc.sichtbar_in || [])],
      aktiv: doc.aktiv !== false,
    })
    setModalOpen(true)
  }

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }))

  const toggleVis = (key) => {
    setForm((p) => {
      const setVis = new Set(p.sichtbar_in || [])
      if (setVis.has(key)) setVis.delete(key)
      else setVis.add(key)
      return { ...p, sichtbar_in: [...setVis] }
    })
  }

  const toggleStudio = (id) => {
    setForm((p) => {
      const setIds = new Set(p.zugewiesene_studios || [])
      if (setIds.has(id)) setIds.delete(id)
      else setIds.add(id)
      return { ...p, zugewiesene_studios: [...setIds] }
    })
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    if (!form.titel_de.trim()) {
      toast.error(copy.titelRequired || 'German title is required')
      return
    }
    if (
      form.geltungsbereich === 'studio_spezifisch' &&
      !(form.zugewiesene_studios || []).length
    ) {
      toast.error(copy.studioRequired || 'Assign at least one studio')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        titel_de: form.titel_de.trim(),
        titel_en: form.titel_en.trim(),
        zugewiesene_studios:
          form.geltungsbereich === 'global' ? [] : form.zugewiesene_studios,
      }
      if (editing) {
        await updateAdminDocument(editing.id, payload)
        toast.success(copy.updated || 'Document updated')
      } else {
        await createAdminDocument(payload)
        toast.success(copy.created || 'Document created')
      }
      setModalOpen(false)
      setEditing(null)
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.saveError || 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (doc) => {
    try {
      await toggleAdminDocumentActive(doc.id)
      toast.success(copy.toggled || 'Status updated')
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.saveError || 'Update failed'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteAdminDocument(deleteTarget.id)
      toast.success(copy.deleted || 'Document deleted')
      setDeleteTarget(null)
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.deleteError || 'Delete failed'))
    } finally {
      setSaving(false)
    }
  }

  const scopeDisplay = (doc) => {
    if (doc.geltungsbereich !== 'studio_spezifisch') {
      return scopeLabel('global')
    }
    const names = (doc.zugewiesene_studios || [])
      .map((s) => s.firma || s.studio_code || s.id)
      .filter(Boolean)
    return names.length
      ? `${scopeLabel('studio_spezifisch')} (${names.join(', ')})`
      : scopeLabel('studio_spezifisch')
  }

  const filteredHint = useMemo(() => {
    if (filterKat === 'alle' && filterScope === 'alle') return null
    return t('adminPages.documentsPage.filterActive', {
      defaultValue: 'Filters active',
    })
  }, [filterKat, filterScope, t])

  return (
    <div className="p-6 max-w-[1200px]">
      <PageHeader
        title={pageCopy.title || 'Digital documents'}
        subtitle={
          copy.subtitle ||
          pageCopy.subtitle ||
          'Central management for leaflets, anamnesis questions, consents and FAQs. Documents can be global or studio-specific.'
        }
      />

      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className={labelClass}>{copy.filterCategory || 'Category'}</label>
            <select
              className={`${fieldClass} min-w-[180px]`}
              value={filterKat}
              onChange={(e) => setFilterKat(e.target.value)}
            >
              <option value="alle">{copy.allCategories || 'All categories'}</option>
              {CATEGORIES.map((k) => (
                <option key={k} value={k}>
                  {catLabel(k)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{copy.filterScope || 'Scope'}</label>
            <select
              className={`${fieldClass} min-w-[180px]`}
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
            >
              <option value="alle">{copy.allScopes || 'All'}</option>
              <option value="global">{scopeLabel('global')}</option>
              <option value="studio_spezifisch">{scopeLabel('studio_spezifisch')}</option>
            </select>
          </div>
        </div>
        <Button onClick={openCreate} className="inline-flex items-center gap-1.5">
          <Plus size={15} />
          {copy.newDocument || 'New document'}
        </Button>
      </div>

      {filteredHint ? (
        <p className="text-[12px] text-studio-w3 m-0 mb-3">{filteredHint}</p>
      ) : null}

      <Card padding="none">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-studio-w2 text-[13px] m-0 py-14 text-center">
            {copy.empty || 'No documents yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-elaya-border">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                    {copy.colTitle || 'Title'}
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                    {copy.colCategory || 'Category'}
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                    {copy.colScope || 'Scope'}
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                    {copy.colVisible || 'Visible in'}
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                    {copy.colStatus || 'Status'}
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3">
                    {copy.colChanged || 'Last changed'}
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-studio-w3" />
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-elaya-border last:border-0">
                    <td className="px-5 py-3.5 align-top">
                      <p className="m-0 text-[13px] font-medium text-studio-white">
                        {doc.titel_de}
                      </p>
                      <p className="m-0 mt-0.5 text-[11px] text-studio-w3">
                        {doc.code} · v{doc.version}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-studio-w1 align-top">
                      {catLabel(doc.kategorie)}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-studio-w2 align-top max-w-[200px]">
                      {scopeDisplay(doc)}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-studio-w2 align-top">
                      {visLabel(doc.sichtbar_in)}
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <span
                        className={`text-[12px] font-semibold ${
                          doc.aktiv ? 'text-studio-teal' : 'text-studio-amber'
                        }`}
                      >
                        {doc.aktiv
                          ? copy.statusActive || 'Active'
                          : copy.statusInactive || 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-studio-w3 align-top whitespace-nowrap">
                      {fmtDate(doc.geaendert_am)}
                    </td>
                    <td className="px-5 py-3.5 align-top whitespace-nowrap">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          title={copy.edit || 'Edit'}
                          onClick={() => openEdit(doc)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-elaya-border bg-transparent text-studio-w1 cursor-pointer hover:border-studio-gold/40"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          title={copy.toggle || 'Toggle active'}
                          onClick={() => void handleToggle(doc)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-elaya-border bg-transparent text-studio-w1 cursor-pointer hover:border-studio-gold/40"
                        >
                          <Power size={14} />
                        </button>
                        <button
                          type="button"
                          title={copy.delete || 'Delete'}
                          onClick={() => setDeleteTarget(doc)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-studio-amber/40 bg-transparent text-studio-amber cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen ? (
        <Modal
          title={
            editing
              ? copy.editTitle || 'Edit document'
              : copy.createTitle || 'New document'
          }
          onClose={() => !saving && setModalOpen(false)}
          width="max-w-2xl"
        >
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className={labelClass}>{copy.fieldCategory || 'Category'}</label>
              <select
                className={fieldClass}
                value={form.kategorie}
                onChange={(e) => set('kategorie', e.target.value)}
              >
                {CATEGORIES.map((k) => (
                  <option key={k} value={k}>
                    {catLabel(k)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label={`${copy.fieldTitleDe || 'Title (DE)'} *`}
              value={form.titel_de}
              onChange={(e) => set('titel_de', e.target.value)}
              required
            />
            <Input
              label={copy.fieldTitleEn || 'Title (EN)'}
              value={form.titel_en}
              onChange={(e) => set('titel_en', e.target.value)}
            />
            <div>
              <label className={labelClass}>{copy.fieldContentDe || 'Content (DE)'}</label>
              <textarea
                className={`${fieldClass} min-h-[100px] resize-y`}
                value={form.inhalt_de}
                onChange={(e) => set('inhalt_de', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{copy.fieldContentEn || 'Content (EN)'}</label>
              <textarea
                className={`${fieldClass} min-h-[100px] resize-y`}
                value={form.inhalt_en}
                onChange={(e) => set('inhalt_en', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{copy.fieldScope || 'Scope'}</label>
              <select
                className={fieldClass}
                value={form.geltungsbereich}
                onChange={(e) => set('geltungsbereich', e.target.value)}
              >
                <option value="global">{scopeLabel('global')}</option>
                <option value="studio_spezifisch">{scopeLabel('studio_spezifisch')}</option>
              </select>
            </div>
            {form.geltungsbereich === 'studio_spezifisch' ? (
              <div>
                <label className={labelClass}>
                  {copy.fieldStudios || 'Assigned studios'}
                </label>
                <div className="max-h-[140px] overflow-y-auto rounded-[10px] border border-elaya-border p-3 flex flex-col gap-2">
                  {studios.length === 0 ? (
                    <p className="m-0 text-[12px] text-studio-w3">
                      {copy.noStudios || 'No studios available'}
                    </p>
                  ) : (
                    studios.map((s) => {
                      const id = String(s.id || s._id)
                      const checked = (form.zugewiesene_studios || []).includes(id)
                      return (
                        <label
                          key={id}
                          className="flex items-center gap-2 text-[13px] text-studio-w1 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStudio(id)}
                          />
                          {s.firma || s.studio_code || id}
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            ) : null}
            <div>
              <label className={labelClass}>{copy.fieldVisible || 'Visible in'}</label>
              <div className="flex flex-wrap gap-3">
                {VISIBILITY.map((v) => (
                  <label
                    key={v}
                    className="flex items-center gap-2 text-[13px] text-studio-w1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(form.sichtbar_in || []).includes(v)}
                      onChange={() => toggleVis(v)}
                    />
                    {copy.visibility?.[v] || v}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-[13px] text-studio-w1 cursor-pointer">
              <input
                type="checkbox"
                checked={form.aktiv}
                onChange={(e) => set('aktiv', e.target.checked)}
              />
              {copy.fieldActive || 'Active'}
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => setModalOpen(false)}
              >
                {copy.cancel || 'Cancel'}
              </Button>
              <Button type="submit" loading={saving}>
                {copy.save || 'Save'}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal
          title={copy.deleteTitle || 'Delete document'}
          onClose={() => !saving && setDeleteTarget(null)}
        >
          <p className="text-[13px] text-studio-w1 m-0 mb-4">
            {copy.deleteConfirm ||
              `Delete “${deleteTarget.titel_de}” (${deleteTarget.code})? This cannot be undone.`}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => setDeleteTarget(null)}
            >
              {copy.cancel || 'Cancel'}
            </Button>
            <Button type="button" variant="danger" loading={saving} onClick={handleDelete}>
              {copy.delete || 'Delete'}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminDocuments
