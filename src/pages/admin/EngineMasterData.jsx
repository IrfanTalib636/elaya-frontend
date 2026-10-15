import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowUpRight } from 'lucide-react'
import { PageHeader, Card, Button, Spinner } from '../../components/ui'
import MasterDataTable from '../../components/engineMasterData/MasterDataTable'
import { buildMasterDataSections, setIn } from '../../components/engineMasterData/masterDataSections'
import {
  buildSessionPredictionPayload,
  cloneSessionPrediction,
} from '../../components/sessionPrediction/sessionPredictionFields'
import { getConfigLifecycle, saveConfigDraft } from '../../api/adminConfig'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'

const DOMAIN = 'session_prediction'

/**
 * Prediction master data. Reads and writes the same session_prediction LIVE / DRAFT as the
 * Prediction Engine, so a value has one truth: saving here updates the shared draft,
 * the Engine shows its impact, and publishing there makes it LIVE for both screens.
 */
export default function EngineMasterData() {
  const { adminPages, components, t } = useContent()
  const copy = adminPages.engineMasterData || {}
  const fieldCopy = components.sessionPrediction
  const sectionLabels = adminPages.engine?.sections || {}
  const canEdit = useAuthStore((s) => s.user?.role) === ROLES.SUPER_ADMIN

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lifecycle, setLifecycle] = useState(null)
  const [working, setWorking] = useState(null)
  const [activeId, setActiveId] = useState('base')

  const applyLifecycle = useCallback((life) => {
    setLifecycle(life)
    setWorking(cloneSessionPrediction(life?.draft?.data || life?.published || {}))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getConfigLifecycle(DOMAIN)
      applyLifecycle(res.data.data)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
    } finally {
      setLoading(false)
    }
  }, [applyLifecycle, copy.loadError])

  useEffect(() => {
    void load()
  }, [load])

  const live = lifecycle?.published || {}
  const saved = lifecycle?.draft?.data || live
  const dirty = useMemo(
    () =>
      working != null &&
      JSON.stringify(buildSessionPredictionPayload(working)) !==
        JSON.stringify(buildSessionPredictionPayload(saved)),
    [working, saved]
  )

  const sections = useMemo(() => buildMasterDataSections(fieldCopy || {}, working), [fieldCopy, working])
  const active = sections.find((s) => s.id === activeId) || sections[0]

  const handleChange = useCallback((path, value) => {
    setWorking((prev) => setIn(prev, path, value))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await saveConfigDraft(DOMAIN, buildSessionPredictionPayload(working), copy.draftNote)
      applyLifecycle(res.data.data)
      toast.success(copy.saved)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.saveFailed))
    } finally {
      setSaving(false)
    }
  }

  if (loading || !working) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] flex flex-col gap-5">
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <Card className="flex flex-col gap-3">
        <p className="m-0 text-[12px] text-studio-w2">{copy.explainer}</p>
        <div className="flex flex-wrap items-center gap-2">
          {lifecycle?.has_draft ? (
            <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
              {copy.draftPending}
            </span>
          ) : (
            <span className="rounded-full border border-studio-teal/50 bg-studio-teal/10 px-2.5 py-0.5 text-[11px] font-semibold text-studio-teal">
              {copy.inSync}
            </span>
          )}
          <span className="text-[11px] text-studio-w3">
            {t('adminPages.engineMasterData.liveVersion', {
              version: lifecycle?.current_version ?? 0,
              defaultValue: `LIVE version ${lifecycle?.current_version ?? 0}`,
            })}
          </span>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveId(section.id)}
            className={`rounded-[10px] border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              section.id === active.id
                ? 'border-studio-gold-2 bg-(--nav-active-bg) text-studio-gold-2'
                : 'border-elaya-border text-studio-w1 hover:bg-studio-bg-4'
            }`}
          >
            {sectionLabels[section.engineSection] || section.id}
          </button>
        ))}
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="m-0 text-[14px] font-semibold text-studio-white">
            {sectionLabels[active.engineSection] || active.id}
          </h3>
          <Link
            to={`/admin/engine?view=admin&section=${active.engineSection}`}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-studio-gold-2"
          >
            {copy.openInEngine}
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {active.id === 'colors' ? (
          <p className="m-0 rounded-[10px] border border-elaya-border bg-studio-bg-4 px-3 py-2 text-[11px] text-studio-w2">
            {copy.colorsNote}{' '}
            <Link to="/admin/lasers" className="font-semibold text-studio-gold-2">
              {copy.openLasers}
            </Link>
          </p>
        ) : null}

        {active.groups.map((group) => (
          <MasterDataTable
            key={group.key}
            title={group.title}
            rows={group.rows}
            live={live}
            draft={working}
            disabled={!canEdit}
            onChange={handleChange}
          />
        ))}
      </Card>

      {canEdit ? (
        <div className="sticky bottom-4 mr-18 flex flex-wrap items-center justify-end gap-2 rounded-[12px] border border-elaya-border bg-studio-bg-3 px-4 py-3 shadow-lg">
          <span className="mr-auto text-[11px] text-studio-w3">
            {dirty ? copy.unsaved : copy.publishHint}
          </span>
          <Button size="sm" variant="ghost" disabled={!dirty || saving} onClick={() => applyLifecycle(lifecycle)}>
            {copy.reset}
          </Button>
          <Button size="sm" loading={saving} disabled={!dirty} onClick={() => void handleSave()}>
            {copy.saveDraft}
          </Button>
        </div>
      ) : (
        <p className="m-0 text-[11px] text-studio-w3">{copy.readOnly}</p>
      )}
    </div>
  )
}
