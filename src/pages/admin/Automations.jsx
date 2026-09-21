import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import {
  Card,
  PageHeader,
  Spinner,
  Button,
  Input,
  Modal,
} from '../../components/ui'
import { getPlatformConfig, updatePlatformConfig } from '../../api/adminConfig'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'

const emptyRuleForm = () => ({
  label_de: '',
  label_en: '',
  beschreibung_de: '',
  beschreibung_en: '',
  hat_tage_feld: false,
  tage_wert: 7,
  editierbar_studio: true,
})

const emptyKatForm = () => ({ label_de: '', label_en: '' })

/**
 * Automations (Automatisierungen) — platform catalog of automatic customer messages.
 * Prototype parity: full admin CRUD; studios may only toggle aktiv + days when allowed.
 */
const AdminAutomations = () => {
  const { i18n } = useTranslation()
  const isDe = (i18n.language || 'en').startsWith('de')
  const { adminPages } = useContent()
  const copy = adminPages.automations || {}
  const role = useAuthStore((s) => s.user?.role)
  const canEdit = role === ROLES.SUPER_ADMIN

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState({ version: 1, kategorien: [] })

  const [editRule, setEditRule] = useState(null)
  const [ruleForm, setRuleForm] = useState(emptyRuleForm())
  const [addRuleKatId, setAddRuleKatId] = useState(null)
  const [addRuleForm, setAddRuleForm] = useState(emptyRuleForm())
  const [addKatOpen, setAddKatOpen] = useState(false)
  const [katForm, setKatForm] = useState(emptyKatForm())
  const [deleteRuleId, setDeleteRuleId] = useState(null)
  const [deleteKatId, setDeleteKatId] = useState(null)

  const inputCls =
    'rounded-[10px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[13px] px-3 py-2 outline-none disabled:opacity-60'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPlatformConfig()
      const cfg = res.data.data.platform_config || {}
      const auto = cfg.automatisierungen || { version: 1, kategorien: [] }
      setStore({
        version: auto.version || 1,
        kategorien: Array.isArray(auto.kategorien)
          ? auto.kategorien.map((k) => ({
              ...k,
              regeln: Array.isArray(k.regeln) ? k.regeln.map((r) => ({ ...r })) : [],
            }))
          : [],
      })
    } catch {
      toast.error(copy.loadError || 'Could not load automations')
    } finally {
      setLoading(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    void load()
  }, [load])

  const persist = async (next) => {
    if (!canEdit) return
    setSaving(true)
    try {
      await updatePlatformConfig({ automatisierungen: next })
      setStore(next)
      toast.success(copy.saved || 'Automations saved')
    } catch (e) {
      toast.error(e?.response?.data?.message || copy.saveError || 'Could not save')
      await load()
    } finally {
      setSaving(false)
    }
  }

  const findRule = (ruleId) => {
    for (const kat of store.kategorien) {
      const ri = (kat.regeln || []).findIndex((r) => r.id === ruleId)
      if (ri >= 0) return { kat, rule: kat.regeln[ri], ri }
    }
    return null
  }

  const mapRules = (ruleId, mapper) => {
    const next = {
      ...store,
      kategorien: store.kategorien.map((kat) => ({
        ...kat,
        regeln: (kat.regeln || []).map((r) => (r.id === ruleId ? mapper(r) : r)),
      })),
    }
    return next
  }

  const toggleAktiv = (ruleId) => {
    if (!canEdit) return
    void persist(mapRules(ruleId, (r) => ({ ...r, aktiv: r.aktiv === false })))
  }

  const toggleEditierbar = (ruleId) => {
    if (!canEdit) return
    void persist(
      mapRules(ruleId, (r) => ({ ...r, editierbar_studio: !r.editierbar_studio }))
    )
  }

  const setTage = (ruleId, raw) => {
    if (!canEdit) return
    const f = findRule(ruleId)
    if (!f?.rule?.hat_tage_feld) return
    const mn = f.rule.tage_min != null ? f.rule.tage_min : 1
    const mx = f.rule.tage_max != null ? f.rule.tage_max : 365
    let v = parseInt(raw, 10)
    if (Number.isNaN(v)) v = mn
    v = Math.max(mn, Math.min(mx, v))
    if (f.rule.tage_wert === v) return
    void persist(mapRules(ruleId, (r) => ({ ...r, tage_wert: v })))
  }

  const openEdit = (ruleId) => {
    const f = findRule(ruleId)
    if (!f) return
    setEditRule(f.rule)
    setRuleForm({
      label_de: f.rule.label_de || '',
      label_en: f.rule.label_en || '',
      beschreibung_de: f.rule.beschreibung_de || '',
      beschreibung_en: f.rule.beschreibung_en || '',
      hat_tage_feld: !!f.rule.hat_tage_feld,
      tage_wert: f.rule.tage_wert ?? 7,
      editierbar_studio: f.rule.editierbar_studio !== false,
    })
  }

  const saveEdit = async () => {
    if (!editRule) return
    const labelDe = ruleForm.label_de.trim()
    const labelEn = ruleForm.label_en.trim()
    if (!labelDe || !labelEn) {
      toast.error(copy.labelsRequired || 'DE and EN labels are required')
      return
    }
    let tageWert = editRule.tage_wert
    if (editRule.hat_tage_feld) {
      const mn = editRule.tage_min ?? 1
      const mx = editRule.tage_max ?? 365
      let v = parseInt(String(ruleForm.tage_wert), 10)
      if (Number.isNaN(v) || v < mn || v > mx) {
        toast.error(
          (copy.tageRange || 'Days must be between {{min}} and {{max}}')
            .replace('{{min}}', String(mn))
            .replace('{{max}}', String(mx))
        )
        return
      }
      tageWert = v
    }
    const next = mapRules(editRule.id, (r) => ({
      ...r,
      label_de: labelDe,
      label_en: labelEn,
      beschreibung_de: ruleForm.beschreibung_de.trim(),
      beschreibung_en: ruleForm.beschreibung_en.trim(),
      tage_wert: tageWert,
    }))
    setEditRule(null)
    await persist(next)
  }

  const confirmDeleteRule = async () => {
    if (!deleteRuleId) return
    const next = {
      ...store,
      kategorien: store.kategorien.map((kat) => ({
        ...kat,
        regeln: (kat.regeln || []).filter((r) => r.id !== deleteRuleId),
      })),
    }
    setDeleteRuleId(null)
    await persist(next)
  }

  const saveNewRule = async () => {
    if (!addRuleKatId) return
    const labelDe = addRuleForm.label_de.trim()
    const labelEn = addRuleForm.label_en.trim()
    if (!labelDe || !labelEn) {
      toast.error(copy.labelsRequired || 'DE and EN labels are required')
      return
    }
    let tageWert = null
    let tageMin = null
    let tageMax = null
    if (addRuleForm.hat_tage_feld) {
      let v = parseInt(String(addRuleForm.tage_wert), 10)
      if (Number.isNaN(v) || v < 1 || v > 365) {
        toast.error(copy.tageRangeNew || 'Days must be between 1 and 365')
        return
      }
      tageWert = v
      tageMin = 1
      tageMax = 365
    }
    const newRule = {
      id: `${addRuleKatId}_custom_${Date.now()}`,
      kategorie: addRuleKatId,
      label_de: labelDe,
      label_en: labelEn,
      beschreibung_de: addRuleForm.beschreibung_de.trim(),
      beschreibung_en: addRuleForm.beschreibung_en.trim(),
      aktiv: true,
      hat_tage_feld: !!addRuleForm.hat_tage_feld,
      tage_wert: tageWert,
      tage_min: tageMin,
      tage_max: tageMax,
      editierbar_studio: addRuleForm.editierbar_studio !== false,
    }
    const next = {
      ...store,
      kategorien: store.kategorien.map((kat) =>
        kat.id === addRuleKatId
          ? { ...kat, regeln: [...(kat.regeln || []), newRule] }
          : kat
      ),
    }
    setAddRuleKatId(null)
    setAddRuleForm(emptyRuleForm())
    await persist(next)
  }

  const saveNewKat = async () => {
    const labelDe = katForm.label_de.trim()
    const labelEn = katForm.label_en.trim()
    if (!labelDe || !labelEn) {
      toast.error(copy.labelsRequired || 'DE and EN labels are required')
      return
    }
    const next = {
      ...store,
      kategorien: [
        ...store.kategorien,
        { id: `kat_${Date.now()}`, label_de: labelDe, label_en: labelEn, regeln: [] },
      ],
    }
    setAddKatOpen(false)
    setKatForm(emptyKatForm())
    await persist(next)
  }

  const confirmDeleteKat = async () => {
    if (!deleteKatId) return
    const kat = store.kategorien.find((k) => k.id === deleteKatId)
    if (!kat) {
      setDeleteKatId(null)
      return
    }
    if ((kat.regeln || []).length > 0) {
      toast.error(copy.katNotEmpty || 'Delete all rules in this category first')
      setDeleteKatId(null)
      return
    }
    const next = {
      ...store,
      kategorien: store.kategorien.filter((k) => k.id !== deleteKatId),
    }
    setDeleteKatId(null)
    await persist(next)
  }

  const deleteTargetRule = useMemo(
    () => (deleteRuleId ? findRule(deleteRuleId)?.rule : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteRuleId, store]
  )
  const deleteTargetKat = useMemo(
    () => store.kategorien.find((k) => k.id === deleteKatId) || null,
    [deleteKatId, store]
  )

  const labelOf = (item) => (isDe ? item.label_de : item.label_en) || item.label_de
  const descOf = (r) =>
    (isDe ? r.beschreibung_de : r.beschreibung_en) || r.beschreibung_de || ''

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title={copy.title || 'Automations'}
        subtitle={
          copy.subtitle ||
          'Central management of automatic customer messages. Super Admin creates and edits rules; studios may only change rules marked as studio-editable.'
        }
      />

      <p className="m-0 mb-5 text-[13px] text-studio-w2 max-w-[820px] leading-relaxed">
        {copy.intro ||
          'The platform admin creates, edits and deletes rules and decides per rule whether the studio may change them. Studios can turn studio-editable rules on/off and adjust their days value — they cannot create or delete rules. Message send/trigger logic is unchanged.'}
      </p>

      <div className="flex flex-col gap-4">
        {store.kategorien.map((kat) => {
          const regeln = kat.regeln || []
          const onCount = regeln.filter((r) => r.aktiv !== false).length
          return (
            <Card key={kat.id} padding="none">
              <div className="px-5 py-3 border-b border-elaya-border flex items-center justify-between gap-3 flex-wrap">
                <h3 className="m-0 text-[15px] font-semibold text-studio-white">
                  {labelOf(kat)}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-studio-w2">
                    {onCount}/{regeln.length} {copy.activeCount || 'active'}
                  </span>
                  {canEdit ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setDeleteKatId(kat.id)}
                    >
                      {copy.deleteCategory || 'Delete category'}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="divide-y divide-elaya-border">
                {regeln.length === 0 ? (
                  <p className="m-0 px-5 py-4 text-[13px] text-studio-w2">
                    {copy.emptyRules || 'No rules in this category yet.'}
                  </p>
                ) : (
                  regeln.map((r) => {
                    const isOn = r.aktiv !== false
                    return (
                      <div
                        key={r.id}
                        className="px-5 py-3 flex flex-wrap items-start justify-between gap-4"
                      >
                        <div className="flex-1 min-w-[220px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[14px] font-semibold ${
                                isOn ? 'text-studio-white' : 'text-studio-w2'
                              }`}
                            >
                              {labelOf(r)}
                            </span>
                            <span className="text-[11px] font-mono text-studio-w3">
                              {r.id}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                r.editierbar_studio
                                  ? 'border-admin-emerald/40 text-admin-emerald bg-admin-emerald/10'
                                  : 'border-elaya-border text-studio-w2'
                              }`}
                            >
                              {r.editierbar_studio
                                ? copy.studioMayChange || 'Studio may change'
                                : copy.centrallyManaged || 'Centrally managed'}
                            </span>
                          </div>
                          <p className="m-0 mt-1 text-[13px] text-studio-w2 leading-relaxed">
                            {descOf(r)}
                          </p>
                          {r.hat_tage_feld ? (
                            <div className="mt-2 flex items-center gap-2 text-[13px]">
                              <span className="text-studio-w2">{copy.days || 'Days'}:</span>
                              <input
                                type="number"
                                min={r.tage_min ?? 1}
                                max={r.tage_max ?? 365}
                                className={`w-[72px] ${inputCls}`}
                                value={r.tage_wert ?? ''}
                                disabled={!canEdit || saving}
                                onChange={(e) => setTage(r.id, e.target.value)}
                              />
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isOn}
                              disabled={!canEdit || saving}
                              onChange={() => toggleAktiv(r.id)}
                              className="accent-admin-emerald w-4 h-4 cursor-pointer"
                            />
                            <span
                              className={`text-[12px] font-bold ${
                                isOn ? 'text-admin-emerald' : 'text-studio-w2'
                              }`}
                            >
                              {isOn ? copy.on || 'ON' : copy.off || 'OFF'}
                            </span>
                          </label>
                          <label
                            className="inline-flex items-center gap-2 cursor-pointer"
                            title={copy.studioEditableHint || 'May the studio change this rule?'}
                          >
                            <input
                              type="checkbox"
                              checked={!!r.editierbar_studio}
                              disabled={!canEdit || saving}
                              onChange={() => toggleEditierbar(r.id)}
                              className="w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="text-[11px] text-studio-w2">
                              {copy.studioEditable || 'Studio-editable'}
                            </span>
                          </label>
                          {canEdit ? (
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openEdit(r.id)}
                              >
                                {copy.edit || 'Edit'}
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setDeleteRuleId(r.id)}
                              >
                                {copy.delete || 'Delete'}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {canEdit ? (
                <div className="px-5 py-3 border-t border-elaya-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAddRuleKatId(kat.id)
                      setAddRuleForm(emptyRuleForm())
                    }}
                  >
                    {copy.addRule || '+ New rule'}
                  </Button>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>

      {canEdit ? (
        <div className="mt-4">
          <Button
            onClick={() => {
              setAddKatOpen(true)
              setKatForm(emptyKatForm())
            }}
          >
            {copy.addCategory || '+ New category'}
          </Button>
        </div>
      ) : (
        <p className="m-0 mt-4 text-[12px] text-studio-w2">
          {copy.superAdminOnly || 'Only Super Admin can edit automations.'}
        </p>
      )}

      {/* Edit rule */}
      {editRule ? (
        <Modal onClose={() => setEditRule(null)} title={copy.editRule || 'Edit rule'}>
          <div className="flex flex-col gap-3">
            <Input
              label={copy.labelDe || 'Label (DE)'}
              value={ruleForm.label_de}
              onChange={(e) => setRuleForm((f) => ({ ...f, label_de: e.target.value }))}
            />
            <Input
              label={copy.labelEn || 'Label (EN)'}
              value={ruleForm.label_en}
              onChange={(e) => setRuleForm((f) => ({ ...f, label_en: e.target.value }))}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-studio-white text-[12px] font-semibold">
                {copy.descDe || 'Description (DE)'}
              </span>
              <textarea
                className={`${inputCls} min-h-[64px]`}
                value={ruleForm.beschreibung_de}
                onChange={(e) =>
                  setRuleForm((f) => ({ ...f, beschreibung_de: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-studio-white text-[12px] font-semibold">
                {copy.descEn || 'Description (EN)'}
              </span>
              <textarea
                className={`${inputCls} min-h-[64px]`}
                value={ruleForm.beschreibung_en}
                onChange={(e) =>
                  setRuleForm((f) => ({ ...f, beschreibung_en: e.target.value }))
                }
              />
            </label>
            {editRule.hat_tage_feld ? (
              <Input
                label={`${copy.days || 'Days'} (${editRule.tage_min}–${editRule.tage_max})`}
                type="number"
                value={ruleForm.tage_wert}
                onChange={(e) =>
                  setRuleForm((f) => ({ ...f, tage_wert: e.target.value }))
                }
              />
            ) : null}
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" onClick={() => setEditRule(null)}>
                {copy.cancel || 'Cancel'}
              </Button>
              <Button loading={saving} onClick={() => void saveEdit()}>
                {copy.save || 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Add rule */}
      {addRuleKatId ? (
        <Modal
          onClose={() => setAddRuleKatId(null)}
          title={copy.addRuleTitle || 'New rule'}
        >
          <div className="flex flex-col gap-3">
            <Input
              label={copy.labelDe || 'Label (DE)'}
              value={addRuleForm.label_de}
              onChange={(e) => setAddRuleForm((f) => ({ ...f, label_de: e.target.value }))}
            />
            <Input
              label={copy.labelEn || 'Label (EN)'}
              value={addRuleForm.label_en}
              onChange={(e) => setAddRuleForm((f) => ({ ...f, label_en: e.target.value }))}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-studio-white text-[12px] font-semibold">
                {copy.descDe || 'Description (DE)'}
              </span>
              <textarea
                className={`${inputCls} min-h-[64px]`}
                value={addRuleForm.beschreibung_de}
                onChange={(e) =>
                  setAddRuleForm((f) => ({ ...f, beschreibung_de: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-studio-white text-[12px] font-semibold">
                {copy.descEn || 'Description (EN)'}
              </span>
              <textarea
                className={`${inputCls} min-h-[64px]`}
                value={addRuleForm.beschreibung_en}
                onChange={(e) =>
                  setAddRuleForm((f) => ({ ...f, beschreibung_en: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-studio-white text-[12px] font-semibold">
                {copy.hasDaysField || 'Days field?'}
              </span>
              <select
                className={inputCls}
                value={addRuleForm.hat_tage_feld ? 'yes' : 'no'}
                onChange={(e) =>
                  setAddRuleForm((f) => ({
                    ...f,
                    hat_tage_feld: e.target.value === 'yes',
                  }))
                }
              >
                <option value="no">{copy.no || 'No'}</option>
                <option value="yes">{copy.yesDays || 'Yes (days value)'}</option>
              </select>
            </label>
            {addRuleForm.hat_tage_feld ? (
              <Input
                label={copy.defaultDays || 'Default days'}
                type="number"
                min={1}
                max={365}
                value={addRuleForm.tage_wert}
                onChange={(e) =>
                  setAddRuleForm((f) => ({ ...f, tage_wert: e.target.value }))
                }
              />
            ) : null}
            <label className="flex flex-col gap-1.5">
              <span className="text-studio-white text-[12px] font-semibold">
                {copy.studioEditable || 'Studio-editable'}
              </span>
              <select
                className={inputCls}
                value={addRuleForm.editierbar_studio ? 'yes' : 'no'}
                onChange={(e) =>
                  setAddRuleForm((f) => ({
                    ...f,
                    editierbar_studio: e.target.value === 'yes',
                  }))
                }
              >
                <option value="yes">{copy.yes || 'Yes'}</option>
                <option value="no">{copy.noCentral || 'No — centrally managed'}</option>
              </select>
            </label>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" onClick={() => setAddRuleKatId(null)}>
                {copy.cancel || 'Cancel'}
              </Button>
              <Button loading={saving} onClick={() => void saveNewRule()}>
                {copy.createRule || 'Create rule'}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Add category */}
      {addKatOpen ? (
        <Modal
          onClose={() => setAddKatOpen(false)}
          title={copy.addCategoryTitle || 'New category'}
        >
          <div className="flex flex-col gap-3">
            <Input
              label={copy.labelDe || 'Label (DE)'}
              value={katForm.label_de}
              onChange={(e) => setKatForm((f) => ({ ...f, label_de: e.target.value }))}
            />
            <Input
              label={copy.labelEn || 'Label (EN)'}
              value={katForm.label_en}
              onChange={(e) => setKatForm((f) => ({ ...f, label_en: e.target.value }))}
            />
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" onClick={() => setAddKatOpen(false)}>
                {copy.cancel || 'Cancel'}
              </Button>
              <Button loading={saving} onClick={() => void saveNewKat()}>
                {copy.createCategory || 'Create category'}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Delete rule */}
      {deleteRuleId && deleteTargetRule ? (
        <Modal
          onClose={() => setDeleteRuleId(null)}
          title={copy.deleteRuleTitle || 'Delete rule'}
        >
          <p className="text-[13px] text-studio-w2 m-0 mb-4">
            {(copy.deleteRuleConfirm || 'Really delete rule „{{label}}“? This is logged.').replace(
              '{{label}}',
              labelOf(deleteTargetRule)
            )}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeleteRuleId(null)}>
              {copy.cancel || 'Cancel'}
            </Button>
            <Button variant="danger" loading={saving} onClick={() => void confirmDeleteRule()}>
              {copy.delete || 'Delete'}
            </Button>
          </div>
        </Modal>
      ) : null}

      {/* Delete category */}
      {deleteKatId && deleteTargetKat ? (
        <Modal
          onClose={() => setDeleteKatId(null)}
          title={copy.deleteCategoryTitle || 'Delete category'}
        >
          <p className="text-[13px] text-studio-w2 m-0 mb-4">
            {(deleteTargetKat.regeln || []).length > 0
              ? (
                  copy.deleteCategoryBlocked ||
                  'Category „{{label}}“ still has rules. Delete all rules first.'
                ).replace('{{label}}', labelOf(deleteTargetKat))
              : (
                  copy.deleteCategoryConfirm ||
                  'Really delete category „{{label}}“?'
                ).replace('{{label}}', labelOf(deleteTargetKat))}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeleteKatId(null)}>
              {copy.cancel || 'Cancel'}
            </Button>
            {(deleteTargetKat.regeln || []).length === 0 ? (
              <Button
                variant="danger"
                loading={saving}
                onClick={() => void confirmDeleteKat()}
              >
                {copy.delete || 'Delete'}
              </Button>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminAutomations
