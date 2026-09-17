import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Card, Button, Spinner } from '../ui'
import PricingConfigForm from '../pricing/PricingConfigForm'
import {
  pricingValuesFromConfig,
  buildStudioPricing,
} from '../pricing/pricingFields'

/**
 * Shared price-calculation rules + live calculator.
 * Studio: canEdit=false (view only). Super admin: canEdit=true (platform defaults).
 */
export default function PricingRulesPanel({
  canEdit = false,
  loadPricing,
  savePricing,
  saveLabel,
  coinWertLabel = null,
}) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [pricing, setPricing] = useState(() => pricingValuesFromConfig())
  const [savedPricing, setSavedPricing] = useState(() => pricingValuesFromConfig())
  const [defaults, setDefaults] = useState({})
  const [coinWert, setCoinWert] = useState(null)

  const applyPayload = useCallback((data) => {
    const merged = {
      ...(data.pricing_defaults || {}),
      ...(data.pricing || {}),
    }
    const filled = pricingValuesFromConfig(merged)
    setPricing(filled)
    setSavedPricing(filled)
    setDefaults(data.pricing_defaults || merged)
    setCoinWert(data.coin_wert ?? null)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await loadPricing()
      applyPayload(data)
    } catch {
      toast.error(t('settingsPage.pricing.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [loadPricing, applyPayload, t])

  useEffect(() => {
    void load()
  }, [load])

  const handleCancel = () => {
    setPricing(savedPricing)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!canEdit || !savePricing) return
    setSaving(true)
    try {
      const data = await savePricing({
        pricing: buildStudioPricing(pricing),
        coin_wert: coinWert,
      })
      if (data) applyPayload(data)
      else {
        setSavedPricing(pricing)
      }
      setIsEditing(false)
      toast.success(
        t('adminPages.settings.draftSaved', {
          defaultValue: t('settingsPage.pricing.toasts.saved'),
        })
      )
    } catch (err) {
      toast.error(err?.response?.data?.message ?? t('settingsPage.shared.saveFailedFallback'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  const editing = canEdit && isEditing

  return (
    <Card className="flex flex-col gap-5">
      <div className="border-b border-elaya-border pb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-studio-white m-0">
            {t('settingsPage.pricing.title')}
          </h2>
          <p className="text-studio-w3 text-[12px] m-0 mt-1">{t('settingsPage.pricing.desc')}</p>
        </div>
        {canEdit && !editing ? (
          <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
            {t('settings.edit')}
          </Button>
        ) : null}
      </div>

      {!canEdit ? (
        <p className="text-studio-w3 text-[11px] m-0 border border-elaya-border rounded-[10px] px-3 py-2 bg-studio-bg-4">
          {t('settingsPage.pricing.readOnlyHint', {
            defaultValue:
              'View only — only Elaya super admin can change price calculation rules.',
          })}
        </p>
      ) : null}

      {coinWertLabel != null && coinWert != null ? (
        <p className="text-studio-w2 text-[12px] m-0">
          {coinWertLabel}:{' '}
          <span className="text-studio-white font-medium">
            {t('settingsPage.pricing.priceWithCurrency', { value: coinWert })}
          </span>
        </p>
      ) : null}

      <PricingConfigForm
        values={pricing}
        defaults={defaults}
        savedPricing={savedPricing}
        disabled={!editing}
        onChange={(key, value) => setPricing((prev) => ({ ...prev, [key]: value }))}
      />

      {editing ? (
        <div className="flex justify-end gap-2 pt-2 border-t border-elaya-border">
          <Button variant="ghost" onClick={handleCancel} disabled={saving}>
            {t('settings.cancel')}
          </Button>
          <Button loading={saving} onClick={handleSave}>
            {saveLabel || t('settings.save')}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
