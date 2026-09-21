import { useCallback, useEffect, useState, Fragment } from 'react'
import toast from 'react-hot-toast'
import { Card, PageHeader, Spinner, EmptyState, Button, Select } from '../../components/ui'
import { listAdminAuditLogs } from '../../api/adminAudit'
import { getApiErrorMessage } from '../../lib/apiError'
import useContent from '../../i18n/useContent'

const ACTION_LABELS = {
  platform_config_patch: { en: 'Platform config changed', de: 'Plattform-Config geändert' },
  studio_config_patch: { en: 'Studio config changed', de: 'Studio-Config geändert' },
  sperrfristen_patch: { en: 'Blocking periods changed', de: 'Sperrfristen geändert' },
  studio_workspace_open: { en: 'Studio dashboard opened', de: 'Studio-Dashboard geöffnet' },
  config_draft_save: { en: 'Config draft saved', de: 'Config-Entwurf gespeichert' },
  config_draft_discard: { en: 'Config draft discarded', de: 'Config-Entwurf verworfen' },
  config_publish: { en: 'Config published', de: 'Config veröffentlicht' },
  config_rollback: { en: 'Config rolled back', de: 'Config zurückgesetzt' },
  laser_catalog_create: { en: 'Laser catalog created', de: 'Laser-Katalog angelegt' },
  laser_catalog_update: { en: 'Laser catalog updated', de: 'Laser-Katalog aktualisiert' },
  laser_request_resolve: { en: 'Laser request resolved', de: 'Laser-Anfrage bearbeitet' },
  ai_config_update: { en: 'AI config updated', de: 'KI-Config aktualisiert' },
  admin_invite: { en: 'Admin invited', de: 'Admin eingeladen' },
  admin_update: { en: 'Admin updated', de: 'Admin aktualisiert' },
}

const fmtTs = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
  )
}

/**
 * Admin Audit-Log — append-only, read-only (prototype parity).
 * Theme: Elaya admin tokens.
 */
const AdminAuditLog = () => {
  const { adminPages, language } = useContent()
  const copy = adminPages.audit || {}
  const locale = language?.startsWith('de') ? 'de' : 'en'

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [actionTypes, setActionTypes] = useState([])
  const [total, setTotal] = useState(0)
  const [actionFilter, setActionFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [openId, setOpenId] = useState(null)

  const actionLabel = (action) => {
    const map = ACTION_LABELS[action]
    if (map) return map[locale] || map.en
    return action || '—'
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listAdminAuditLogs({
        action: actionFilter || undefined,
        date: dateFilter || undefined,
        limit: 100,
      })
      const data = res.data.data || {}
      setItems(data.items || [])
      setActionTypes(data.action_types || [])
      setTotal(data.total || 0)
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError || 'Could not load audit log'))
    } finally {
      setLoading(false)
    }
  }, [actionFilter, dateFilter, copy.loadError])

  useEffect(() => {
    load()
  }, [load])

  const resetFilters = () => {
    setActionFilter('')
    setDateFilter('')
    setOpenId(null)
  }

  const hasFilters = Boolean(actionFilter || dateFilter)

  return (
    <div className="p-6 max-w-[1200px]">
      <PageHeader
        title={copy.title || 'Audit log'}
        subtitle={
          copy.subtitle ||
          'Append-only log of all admin actions. Read-only — never editable.'
        }
      />

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="min-w-[200px]">
          <Select
            label={copy.actionType || 'Action type'}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">{copy.allActions || 'All actions'}</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>
                {actionLabel(a)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-studio-white text-[12px] font-semibold">
            {copy.date || 'Date'}
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold"
          />
        </div>
        {hasFilters ? (
          <Button type="button" variant="secondary" onClick={resetFilters}>
            {copy.resetFilters || 'Reset filters'}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : !items.length ? (
        <EmptyState
          title={
            hasFilters
              ? copy.emptyFiltered || 'No admin actions with these filters'
              : copy.empty || 'No admin actions logged yet'
          }
        />
      ) : (
        <Card>
          <p className="m-0 mb-3 text-[12px] text-studio-w3">
            {copy.showing || 'Showing'} {items.length}
            {total > items.length ? ` / ${total}` : ''} {copy.entries || 'entries'}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[860px] border-collapse">
              <thead>
                <tr className="text-left text-studio-w3 border-b border-admin-line">
                  <th className="py-2 pr-3 font-medium">{copy.colTimestamp || 'Timestamp'}</th>
                  <th className="py-2 pr-3 font-medium">{copy.colAction || 'Action'}</th>
                  <th className="py-2 pr-3 font-medium">{copy.colTarget || 'Target'}</th>
                  <th className="py-2 pr-3 font-medium">{copy.colStudio || 'Studio'}</th>
                  <th className="py-2 pr-3 font-medium">{copy.colReason || 'Reason'}</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((e) => {
                  const open = openId === e.id
                  return (
                    <Fragment key={e.id}>
                      <tr className="border-b border-admin-line/60 align-top">
                        <td className="py-2.5 pr-3 whitespace-nowrap text-studio-w2">
                          {fmtTs(e.timestamp)}
                        </td>
                        <td className="py-2.5 pr-3 text-studio-white">{actionLabel(e.action)}</td>
                        <td className="py-2.5 pr-3 text-studio-w2">{e.target || '—'}</td>
                        <td className="py-2.5 pr-3 text-studio-w2">
                          {e.studio || '—'}
                          {e.studio_code ? (
                            <span className="text-studio-w3"> ({e.studio_code})</span>
                          ) : null}
                        </td>
                        <td className="py-2.5 pr-3 text-studio-w2">{e.reason || '—'}</td>
                        <td className="py-2.5">
                          <button
                            type="button"
                            onClick={() => setOpenId(open ? null : e.id)}
                            className="px-2.5 py-1 rounded-md text-[12px] font-semibold border border-admin-emerald text-admin-emerald bg-transparent cursor-pointer hover:bg-admin-emerald/10"
                          >
                            {copy.details || 'Details'}
                          </button>
                        </td>
                      </tr>
                      {open ? (
                        <tr className="border-b border-admin-line/60">
                          <td colSpan={6} className="pb-3 pt-0">
                            <pre className="m-0 mt-1 p-3 rounded-[8px] border border-admin-line bg-studio-bg-3 text-[12px] text-studio-w2 whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(
                                {
                                  actor: e.actor_email || null,
                                  actor_role: e.actor_role || null,
                                  target_type: e.target_type,
                                  target_id: e.target_id,
                                  ip: e.ip || null,
                                  vorher: e.before,
                                  nachher: e.after,
                                  meta: e.meta,
                                },
                                null,
                                2
                              )}
                            </pre>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdminAuditLog
