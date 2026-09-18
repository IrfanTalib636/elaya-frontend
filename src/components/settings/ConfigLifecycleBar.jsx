import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { History, RotateCcw, Upload } from 'lucide-react'
import { Button, Input } from '../ui'
import {
  discardConfigDraft,
  listConfigVersions,
  publishConfigDomain,
  rollbackConfigVersion,
} from '../../api/adminConfig'
import { getApiErrorMessage } from '../../lib/apiError'

/**
 * Draft → Publish → Version history / Rollback controls for one config domain.
 */
export default function ConfigLifecycleBar({
  domain,
  canEdit = false,
  hasDraft = false,
  currentVersion = 0,
  onPublished,
  onDraftDiscarded,
}) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [versions, setVersions] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [rollbackTarget, setRollbackTarget] = useState(null)
  const [rollbackReason, setRollbackReason] = useState('')
  const [rollingBack, setRollingBack] = useState(false)
  const [discarding, setDiscarding] = useState(false)

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await listConfigVersions(domain)
      setVersions(res.data.data.versions || [])
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load version history'))
    } finally {
      setLoadingHistory(false)
    }
  }, [domain])

  useEffect(() => {
    if (showHistory) void loadHistory()
  }, [showHistory, loadHistory])

  const handlePublish = async () => {
    if (!canEdit || !hasDraft) return
    const trimmed = reason.trim()
    if (!trimmed) {
      toast.error(
        t('adminPages.settings.publishReasonRequired', {
          defaultValue: 'Publish reason is required',
        })
      )
      return
    }
    setPublishing(true)
    try {
      const res = await publishConfigDomain(domain, { reason: trimmed })
      setReason('')
      toast.success(
        t('adminPages.settings.published', {
          defaultValue: `Published as version ${res.data.data.version}`,
          version: res.data.data.version,
        })
      )
      onPublished?.(res.data.data)
      if (showHistory) void loadHistory()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Publish failed'))
    } finally {
      setPublishing(false)
    }
  }

  const handleDiscard = async () => {
    if (!canEdit || !hasDraft) return
    setDiscarding(true)
    try {
      const res = await discardConfigDraft(domain)
      toast.success(
        t('adminPages.settings.draftDiscarded', { defaultValue: 'Draft discarded' })
      )
      onDraftDiscarded?.(res.data.data)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Discard failed'))
    } finally {
      setDiscarding(false)
    }
  }

  const handleRollback = async () => {
    if (!canEdit || !rollbackTarget) return
    const trimmed = rollbackReason.trim()
    if (!trimmed) {
      toast.error(
        t('adminPages.settings.rollbackReasonRequired', {
          defaultValue: 'Rollback reason is required',
        })
      )
      return
    }
    setRollingBack(true)
    try {
      const res = await rollbackConfigVersion(domain, rollbackTarget.version, {
        reason: trimmed,
      })
      setRollbackTarget(null)
      setRollbackReason('')
      toast.success(
        t('adminPages.settings.rolledBack', {
          defaultValue: `Rolled back to v${rollbackTarget.version} (now v${res.data.data.version})`,
          from: rollbackTarget.version,
          version: res.data.data.version,
        })
      )
      onPublished?.(res.data.data)
      void loadHistory()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Rollback failed'))
    } finally {
      setRollingBack(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 border border-elaya-border rounded-[10px] px-3 py-3 bg-studio-bg-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[12px] text-studio-w2">
          <span className="text-studio-white font-medium">
            {t('adminPages.settings.lifecycle', { defaultValue: 'Lifecycle' })}
          </span>
          {' · '}
          {t('adminPages.settings.currentVersion', {
            defaultValue: 'Published v{{version}}',
            version: currentVersion || 0,
          })}
          {hasDraft ? (
            <span className="ml-2 text-studio-gold-2">
              {t('adminPages.settings.draftPending', { defaultValue: 'Draft pending' })}
            </span>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowHistory((v) => !v)}
        >
          <History size={14} className="mr-1.5" />
          {t('adminPages.settings.versionHistory', { defaultValue: 'Version history' })}
        </Button>
      </div>

      {canEdit && hasDraft ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 min-w-0">
            <Input
              label={t('adminPages.settings.publishReason', {
                defaultValue: 'Publish reason',
              })}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('adminPages.settings.publishReasonPlaceholder', {
                defaultValue: 'Why are these rules going live?',
              })}
              disabled={publishing}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              disabled={publishing || discarding}
              loading={discarding}
              onClick={() => void handleDiscard()}
            >
              {t('adminPages.settings.discardDraft', { defaultValue: 'Discard draft' })}
            </Button>
            <Button
              size="sm"
              disabled={!reason.trim() || publishing || discarding}
              loading={publishing}
              onClick={() => void handlePublish()}
            >
              <Upload size={14} className="mr-1.5" />
              {t('adminPages.settings.publish', { defaultValue: 'Publish' })}
            </Button>
          </div>
        </div>
      ) : null}

      {showHistory ? (
        <div className="border-t border-elaya-border pt-3">
          {loadingHistory ? (
            <p className="m-0 text-[12px] text-studio-w3">
              {t('common.loading', { defaultValue: 'Loading…' })}
            </p>
          ) : versions.length === 0 ? (
            <p className="m-0 text-[12px] text-studio-w3">
              {t('adminPages.settings.noVersions', {
                defaultValue: 'No published versions yet.',
              })}
            </p>
          ) : (
            <ul className="m-0 p-0 list-none flex flex-col gap-2">
              {versions.map((row) => (
                <li
                  key={`${row.domain}-${row.version}`}
                  className="flex flex-wrap items-start justify-between gap-2 text-[12px]"
                >
                  <div className="min-w-0">
                    <span className="text-studio-white font-medium">v{row.version}</span>
                    {row.version === currentVersion ? (
                      <span className="ml-1.5 text-studio-gold-2">
                        ({t('adminPages.settings.live', { defaultValue: 'live' })})
                      </span>
                    ) : null}
                    {row.rolled_back_from != null ? (
                      <span className="ml-1.5 text-studio-w3">
                        ← v{row.rolled_back_from}
                      </span>
                    ) : null}
                    <p className="m-0 mt-0.5 text-studio-w2 truncate max-w-[420px]">
                      {row.note || '—'}
                    </p>
                    <p className="m-0 text-studio-w3">
                      {row.published_at
                        ? new Date(row.published_at).toLocaleString()
                        : ''}
                      {row.published_by?.email ? ` · ${row.published_by.email}` : ''}
                    </p>
                  </div>
                  {canEdit && row.version !== currentVersion ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setRollbackTarget(row)
                        setRollbackReason('')
                      }}
                    >
                      <RotateCcw size={13} className="mr-1" />
                      {t('adminPages.settings.rollback', { defaultValue: 'Rollback' })}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {rollbackTarget ? (
            <div className="mt-3 flex flex-col gap-2 border border-elaya-border rounded-[8px] p-3">
              <p className="m-0 text-[12px] text-studio-white">
                {t('adminPages.settings.rollbackConfirm', {
                  defaultValue: `Rollback to v${rollbackTarget.version}? This publishes a new version.`,
                  version: rollbackTarget.version,
                })}
              </p>
              <Input
                label={t('adminPages.settings.rollbackReason', {
                  defaultValue: 'Rollback reason',
                })}
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                disabled={rollingBack}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={rollingBack}
                  onClick={() => setRollbackTarget(null)}
                >
                  {t('settings.cancel')}
                </Button>
                <Button
                  size="sm"
                  disabled={!rollbackReason.trim() || rollingBack}
                  loading={rollingBack}
                  onClick={() => void handleRollback()}
                >
                  {t('adminPages.settings.confirmRollback', {
                    defaultValue: 'Confirm rollback',
                  })}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
