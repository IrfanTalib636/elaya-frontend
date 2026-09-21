import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Card,
  PageHeader,
  Spinner,
  Button,
  Input,
  Modal,
  EmptyState,
  Pagination,
  Badge,
} from '../../components/ui'
import {
  getAdminElaycoinOverview,
  adminAdjustElaycoins,
} from '../../api/adminElaycoins'
import {
  getPlatformConfig,
  updatePlatformConfig,
} from '../../api/adminConfig'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { ROLES } from '../../constants/roles'

/**
 * Elaycoins Admin — balances + platform rules (prototype Elaycoin-Regeln structure).
 */
const AdminElaycoins = () => {
  const { t, adminPages } = useContent()
  const copy = adminPages.elaycoins
  const role = useAuthStore((s) => s.user?.role)
  const canEditRules = role === ROLES.SUPER_ADMIN

  const [tab, setTab] = useState('balances')
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [adjustFor, setAdjustFor] = useState(null)
  const [coins, setCoins] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const [rulesLoading, setRulesLoading] = useState(false)
  const [rulesSaving, setRulesSaving] = useState(false)
  const [rules, setRules] = useState({
    geldwert_coins: '100',
    geldwert_chf: '5',
    tageslimit_pro_kunde: '800',
    grenze_pro_aktion_min: '0',
    grenze_pro_aktion_max: '1000',
    verfallMonate: '12',
    verfall_reset_trigger: 'Sitzung, Nachsorge-Check, Termin, Einkauf',
    deckelProzent: '20',
    minWert: '0.05',
    maxWert: '0.2',
    situations: [],
  })

  const load = useCallback(
    async (pageNum = 1) => {
      setLoading(true)
      try {
        const res = await getAdminElaycoinOverview({
          page: pageNum,
          limit: 20,
          q: q || undefined,
        })
        setCustomers(res.data.data.customers ?? [])
        setSummary(res.data.data.summary)
        setPagination(res.data.data.pagination)
      } catch {
        toast.error(copy.loadError)
      } finally {
        setLoading(false)
      }
    },
    [q, copy.loadError]
  )

  const loadRules = useCallback(async () => {
    setRulesLoading(true)
    try {
      const res = await getPlatformConfig()
      const cfg = res.data.data.platform_config || {}
      const er = cfg.elaycoin_regeln || {}
      const triggers = Array.isArray(er.verfall_reset_trigger)
        ? er.verfall_reset_trigger.join(', ')
        : 'Sitzung, Nachsorge-Check, Termin, Einkauf'
      setRules({
        geldwert_coins: String(er.geldwert_coins ?? 100),
        geldwert_chf: String(er.geldwert_chf ?? 5),
        tageslimit_pro_kunde: String(er.tageslimit_pro_kunde ?? 800),
        grenze_pro_aktion_min: String(er.grenze_pro_aktion_min ?? 0),
        grenze_pro_aktion_max: String(er.grenze_pro_aktion_max ?? 1000),
        verfallMonate: String(cfg.verfallMonate ?? 12),
        verfall_reset_trigger: triggers,
        deckelProzent: String(cfg.deckelProzent ?? 20),
        minWert: String(cfg.minWert ?? 0.05),
        maxWert: String(cfg.maxWert ?? 0.2),
        situations: Array.isArray(er.situations)
          ? er.situations.map((s) => ({ ...s }))
          : [],
      })
    } catch {
      toast.error(copy.rulesLoadError || 'Could not load Elaycoin rules')
    } finally {
      setRulesLoading(false)
    }
  }, [copy.rulesLoadError])

  useEffect(() => {
    if (tab === 'balances') load(page)
  }, [tab, page, load])

  useEffect(() => {
    if (tab === 'rules') void loadRules()
  }, [tab, loadRules])

  const submitAdjust = async () => {
    setSaving(true)
    try {
      await adminAdjustElaycoins({
        customer_id: adjustFor.id,
        coins: Number(coins),
        reason,
      })
      toast.success(copy.adjustSaved)
      setAdjustFor(null)
      setCoins('')
      setReason('')
      load(page)
    } catch (e) {
      toast.error(e?.response?.data?.message || copy.adjustError)
    } finally {
      setSaving(false)
    }
  }

  const updateSituation = (idx, patch) => {
    setRules((r) => ({
      ...r,
      situations: r.situations.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }))
  }

  const addCategory = () => {
    if (!canEditRules) return
    const name = window.prompt(copy.promptNewCategory || 'New category name')
    if (!name?.trim()) return
    const kat = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_ÄÖÜ]+/gi, '_')
      .slice(0, 40)
    setRules((r) => {
      if (r.situations.some((s) => (s.kat || '').toUpperCase() === kat)) return r
      return {
        ...r,
        situations: [
          ...r.situations,
          {
            key: `aktion_${Date.now()}`,
            label: copy.newAction || 'New action',
            kat,
            coins: 0,
            aktiv: true,
            einmalig: false,
            istMalus: false,
          },
        ],
      }
    })
  }

  const deleteCategory = (kat) => {
    if (!canEditRules) return
    if (
      !window.confirm(
        (copy.confirmDeleteCategory || 'Delete category „{{kat}}“ and all actions?').replace(
          '{{kat}}',
          kat
        )
      )
    ) {
      return
    }
    setRules((r) => ({
      ...r,
      situations: r.situations.filter((s) => (s.kat || 'OTHER') !== kat),
    }))
  }

  const addAction = (kat) => {
    if (!canEditRules) return
    setRules((r) => ({
      ...r,
      situations: [
        ...r.situations,
        {
          key: `aktion_${Date.now()}`,
          label: copy.newAction || 'New action',
          kat,
          coins: 0,
          aktiv: true,
          einmalig: false,
          istMalus: false,
        },
      ],
    }))
  }

  const deleteAction = (idx) => {
    if (!canEditRules) return
    const sit = rules.situations[idx]
    if (
      !window.confirm(
        (copy.confirmDeleteAction || 'Delete action „{{label}}“?').replace(
          '{{label}}',
          sit?.label || sit?.key || ''
        )
      )
    ) {
      return
    }
    setRules((r) => ({
      ...r,
      situations: r.situations.filter((_, i) => i !== idx),
    }))
  }

  const renameCategory = (oldKat, newLabel) => {
    const next = String(newLabel || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_ÄÖÜ]+/gi, '_')
      .slice(0, 40)
    if (!next || next === oldKat) return
    setRules((r) => ({
      ...r,
      situations: r.situations.map((s) =>
        (s.kat || 'OTHER') === oldKat ? { ...s, kat: next } : s
      ),
    }))
  }

  const saveRules = async () => {
    if (!canEditRules) return
    setRulesSaving(true)
    try {
      const triggers = String(rules.verfall_reset_trigger || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await updatePlatformConfig({
        verfallMonate: Number(rules.verfallMonate),
        deckelProzent: Number(rules.deckelProzent),
        minWert: Number(rules.minWert),
        maxWert: Number(rules.maxWert),
        elaycoin_regeln: {
          geldwert_coins: Number(rules.geldwert_coins),
          geldwert_chf: Number(rules.geldwert_chf),
          tageslimit_pro_kunde: Number(rules.tageslimit_pro_kunde),
          grenze_pro_aktion_min: Number(rules.grenze_pro_aktion_min),
          grenze_pro_aktion_max: Number(rules.grenze_pro_aktion_max),
          verfall_reset_trigger: triggers,
          situations: rules.situations.map((s) => ({
            key: s.key,
            label: s.label,
            kat: s.kat,
            coins: Number(s.coins) || 0,
            aktiv: s.aktiv !== false,
            einmalig: !!s.einmalig,
            istMalus: !!s.istMalus,
            ...(s.limitTage != null && s.limitTage !== ''
              ? { limitTage: Number(s.limitTage) }
              : {}),
            ...(s.limitProSitzung != null && s.limitProSitzung !== ''
              ? { limitProSitzung: Number(s.limitProSitzung) }
              : {}),
          })),
        },
      })
      toast.success(copy.rulesSaved || 'Elaycoin rules saved')
      await loadRules()
    } catch (e) {
      toast.error(e?.response?.data?.message || copy.rulesSaveError || 'Could not save rules')
    } finally {
      setRulesSaving(false)
    }
  }

  const situationsByKat = rules.situations.reduce((acc, s, idx) => {
    const kat = s.kat || 'OTHER'
    if (!acc[kat]) acc[kat] = []
    acc[kat].push({ ...s, _idx: idx })
    return acc
  }, {})

  const inputCls =
    'rounded-[10px] border border-elaya-border bg-studio-bg-4 text-studio-white text-[13px] px-3 py-2 outline-none disabled:opacity-60'

  return (
    <div className="p-6 max-w-[1100px]">
      <PageHeader
        title={copy.title}
        subtitle={
          tab === 'rules'
            ? copy.subtitleRules || copy.subtitle
            : copy.subtitle
        }
      />

      <div className="flex gap-2 mb-5">
        {[
          { id: 'balances', label: copy.tabBalances || 'Balances' },
          { id: 'rules', label: copy.tabRules || 'Rules' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border cursor-pointer ${
              tab === item.id
                ? 'border-admin-emerald text-admin-emerald bg-admin-emerald/10'
                : 'border-admin-line text-studio-w2'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'rules' ? (
        rulesLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="m-0 text-[13px] text-studio-w2 max-w-[760px] leading-relaxed">
              {copy.rulesIntro ||
                'These rules apply platform-wide for all studios. Coins stay with the customer across studio switches, so values must be consistent. Only Super Admin can edit; studios view them read-only.'}
            </p>

            <Card>
              <h3 className="m-0 mb-4 text-[15px] font-semibold text-studio-white">
                {copy.globalTitle || 'Global settings'}
              </h3>
              <div className="flex flex-col gap-4 max-w-[720px]">
                <div>
                  <p className="m-0 mb-1.5 text-[12px] text-studio-w2">
                    {copy.geldwert || 'Coin monetary value'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[13px]">
                    <input
                      type="number"
                      className={`w-[88px] ${inputCls}`}
                      value={rules.geldwert_coins}
                      disabled={!canEditRules}
                      onChange={(e) =>
                        setRules((r) => ({ ...r, geldwert_coins: e.target.value }))
                      }
                    />
                    <span className="text-studio-w2">{copy.coinsEquals || 'Coins = CHF'}</span>
                    <input
                      type="number"
                      step="0.01"
                      className={`w-[88px] ${inputCls}`}
                      value={rules.geldwert_chf}
                      disabled={!canEditRules}
                      onChange={(e) =>
                        setRules((r) => ({ ...r, geldwert_chf: e.target.value }))
                      }
                    />
                  </div>
                  <p className="m-0 mt-1 text-[11px] text-studio-w2">
                    {copy.geldwertHint ||
                      'Redemption unit — identical for every studio on the platform.'}
                  </p>
                </div>

                <div>
                  <p className="m-0 mb-1.5 text-[12px] text-studio-w2">
                    {copy.tageslimit || 'Daily limit per customer'}
                  </p>
                  <div className="flex items-center gap-2 text-[13px]">
                    <input
                      type="number"
                      className={`w-[100px] ${inputCls}`}
                      value={rules.tageslimit_pro_kunde}
                      disabled={!canEditRules}
                      onChange={(e) =>
                        setRules((r) => ({ ...r, tageslimit_pro_kunde: e.target.value }))
                      }
                    />
                    <span className="text-studio-w2">{copy.coinsPerDay || 'Coins / day'}</span>
                  </div>
                </div>

                <div>
                  <p className="m-0 mb-1.5 text-[12px] text-studio-w2">
                    {copy.grenzeAktion || 'Limit per action'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[13px]">
                    <span className="text-studio-w2">{copy.min || 'Min'}</span>
                    <input
                      type="number"
                      className={`w-[88px] ${inputCls}`}
                      value={rules.grenze_pro_aktion_min}
                      disabled={!canEditRules}
                      onChange={(e) =>
                        setRules((r) => ({ ...r, grenze_pro_aktion_min: e.target.value }))
                      }
                    />
                    <span className="text-studio-w2">– {copy.max || 'Max'}</span>
                    <input
                      type="number"
                      className={`w-[88px] ${inputCls}`}
                      value={rules.grenze_pro_aktion_max}
                      disabled={!canEditRules}
                      onChange={(e) =>
                        setRules((r) => ({ ...r, grenze_pro_aktion_max: e.target.value }))
                      }
                    />
                    <span className="text-studio-w2">{copy.coins || 'Coins'}</span>
                  </div>
                </div>

                <div>
                  <p className="m-0 mb-1.5 text-[12px] text-studio-w2">
                    {copy.verfallMonate || 'Expiry after inactivity'}
                  </p>
                  <div className="flex items-center gap-2 text-[13px]">
                    <input
                      type="number"
                      className={`w-[88px] ${inputCls}`}
                      value={rules.verfallMonate}
                      disabled={!canEditRules}
                      onChange={(e) =>
                        setRules((r) => ({ ...r, verfallMonate: e.target.value }))
                      }
                    />
                    <span className="text-studio-w2">{copy.months || 'Months'}</span>
                  </div>
                </div>

                <div>
                  <p className="m-0 mb-1.5 text-[12px] text-studio-w2">
                    {copy.verfallReset || 'Expiry period reset by'}
                  </p>
                  <input
                    type="text"
                    className={`w-full max-w-[420px] ${inputCls}`}
                    value={rules.verfall_reset_trigger}
                    disabled={!canEditRules}
                    onChange={(e) =>
                      setRules((r) => ({ ...r, verfall_reset_trigger: e.target.value }))
                    }
                  />
                  <p className="m-0 mt-1 text-[11px] text-studio-w2">
                    {copy.verfallResetHint ||
                      'Comma-separated — each of these customer actions resets the expiry deadline.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-admin-line">
                  <Input
                    label={copy.deckelProzent || 'Cap % of price (shop redeem)'}
                    type="number"
                    value={rules.deckelProzent}
                    disabled={!canEditRules}
                    onChange={(e) => setRules((r) => ({ ...r, deckelProzent: e.target.value }))}
                  />
                  <Input
                    label={copy.minWert || 'Min CHF / coin (studio bound)'}
                    type="number"
                    step="0.01"
                    value={rules.minWert}
                    disabled={!canEditRules}
                    onChange={(e) => setRules((r) => ({ ...r, minWert: e.target.value }))}
                  />
                  <Input
                    label={copy.maxWert || 'Max CHF / coin (studio bound)'}
                    type="number"
                    step="0.01"
                    value={rules.maxWert}
                    disabled={!canEditRules}
                    onChange={(e) => setRules((r) => ({ ...r, maxWert: e.target.value }))}
                  />
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="m-0 text-[15px] font-semibold text-studio-white">
                  {copy.catalogTitle || 'Categories & actions'}
                </h3>
                <p className="m-0 mt-1 text-[12px] text-studio-w2">
                  {copy.catalogHint ||
                    'Coin amounts granted or deducted per action. Add categories/actions, toggle active, save to apply platform-wide.'}
                </p>
              </div>
              {canEditRules ? (
                <Button variant="secondary" onClick={addCategory}>
                  {copy.addCategory || '+ New category'}
                </Button>
              ) : null}
            </div>

            {Object.keys(situationsByKat).length === 0 ? (
              <Card>
                <p className="m-0 text-[13px] text-studio-w2 text-center py-6">
                  {copy.catalogEmpty || 'No actions in catalog.'}
                </p>
              </Card>
            ) : (
              Object.entries(situationsByKat).map(([kat, rows]) => (
                <Card key={kat} padding="none">
                  <div className="px-5 py-3 border-b border-admin-line flex items-center justify-between gap-3 flex-wrap">
                    <input
                      type="text"
                      className={`${inputCls} font-semibold uppercase tracking-wide text-[12px] min-w-[160px]`}
                      defaultValue={kat}
                      disabled={!canEditRules}
                      onBlur={(e) => renameCategory(kat, e.target.value)}
                      title={copy.categoryName || 'Category name'}
                    />
                    {canEditRules ? (
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => addAction(kat)}>
                          {copy.addAction || '+ Action'}
                        </Button>
                        <Button variant="secondary" onClick={() => deleteCategory(kat)}>
                          {copy.deleteCategory || 'Delete category'}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <div className="divide-y divide-admin-line">
                    {rows.map((s) => (
                      <div key={s.key} className="px-5 py-3 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            className={`${inputCls} flex-1 min-w-[160px]`}
                            value={s.label}
                            disabled={!canEditRules}
                            onChange={(e) => updateSituation(s._idx, { label: e.target.value })}
                          />
                          <span
                            className={`font-bold font-mono text-[13px] ${
                              s.istMalus ? 'text-red-700' : 'text-admin-emerald'
                            }`}
                          >
                            {s.istMalus ? '−' : '+'}
                          </span>
                          <input
                            type="number"
                            className={`w-[80px] text-right ${inputCls}`}
                            value={s.coins}
                            disabled={!canEditRules}
                            onChange={(e) =>
                              updateSituation(s._idx, { coins: Number(e.target.value) })
                            }
                          />
                          <span className="text-[12px] text-studio-w2">{copy.coins || 'Coins'}</span>
                          <select
                            className={`w-[110px] ${inputCls}`}
                            value={s.istMalus ? 'malus' : 'bonus'}
                            disabled={!canEditRules}
                            onChange={(e) =>
                              updateSituation(s._idx, { istMalus: e.target.value === 'malus' })
                            }
                          >
                            <option value="bonus">{copy.bonus || 'Bonus'}</option>
                            <option value="malus">{copy.malus || 'Malus'}</option>
                          </select>
                          <select
                            className={`w-[130px] ${inputCls}`}
                            value={s.einmalig ? 'once' : 'repeat'}
                            disabled={!canEditRules}
                            onChange={(e) =>
                              updateSituation(s._idx, { einmalig: e.target.value === 'once' })
                            }
                          >
                            <option value="repeat">{copy.repeatable || 'Repeatable'}</option>
                            <option value="once">{copy.once || 'Once'}</option>
                          </select>
                          <input
                            type="number"
                            className={`w-[72px] ${inputCls}`}
                            placeholder={copy.limitDays || 'Days'}
                            title={copy.limitDaysHint || 'limitTage (optional)'}
                            value={s.limitTage ?? ''}
                            disabled={!canEditRules}
                            onChange={(e) =>
                              updateSituation(s._idx, {
                                limitTage:
                                  e.target.value === '' ? undefined : Number(e.target.value),
                              })
                            }
                          />
                          <button
                            type="button"
                            disabled={!canEditRules}
                            onClick={() =>
                              updateSituation(s._idx, { aktiv: s.aktiv === false })
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer min-w-[48px] ${
                              s.aktiv !== false
                                ? 'border-admin-emerald text-admin-emerald'
                                : 'border-admin-line text-studio-w2'
                            }`}
                          >
                            {s.aktiv !== false ? copy.on || 'ON' : copy.off || 'OFF'}
                          </button>
                          {canEditRules ? (
                            <button
                              type="button"
                              onClick={() => deleteAction(s._idx)}
                              className="px-2 py-1.5 rounded-lg text-[12px] border border-red-800/40 text-red-800 cursor-pointer"
                              title={copy.deleteAction || 'Delete action'}
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                        <p className="m-0 text-[11px] text-studio-w2 font-mono">{s.key}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}

            {canEditRules ? (
              <Button className="self-start" loading={rulesSaving} onClick={() => void saveRules()}>
                {copy.saveRules || 'Save rules'}
              </Button>
            ) : (
              <p className="m-0 text-[12px] text-studio-w2">
                {copy.superAdminOnly || 'Only Super Admin can edit rules.'}
              </p>
            )}
          </div>
        )
      ) : (
        <>
          <div className="flex gap-3 mb-4 items-end">
            <Input
              label={copy.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={copy.searchPh}
            />
            <Button
              onClick={() => {
                setPage(1)
                load(1)
              }}
            >
              {copy.searchBtn}
            </Button>
          </div>

          {summary ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <p className="text-[12px] text-studio-w2 m-0">{copy.kpiTotal}</p>
                <p className="text-[20px] font-bold m-0">{summary.total_balance}</p>
              </Card>
              <Card>
                <p className="text-[12px] text-studio-w2 m-0">{copy.kpiWithBalance}</p>
                <p className="text-[20px] font-bold m-0">{summary.customers_with_balance}</p>
              </Card>
              <Card>
                <p className="text-[12px] text-studio-w2 m-0">{copy.kpiCustomers}</p>
                <p className="text-[20px] font-bold m-0">{summary.total_customers}</p>
              </Card>
            </div>
          ) : null}

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : customers.length === 0 ? (
            <EmptyState title={copy.empty} />
          ) : (
            <div className="space-y-3">
              {customers.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold m-0">
                        {c.vorname} {c.nachname}
                      </p>
                      <p className="text-[12px] text-studio-w2 m-0">{c.email}</p>
                      <p className="text-[12px] m-0 mt-1">
                        {t('adminPages.elaycoins.studioBalance', {
                          studio: c.studio?.firma || '—',
                        })}
                        <strong>{c.balance}</strong>
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => setAdjustFor(c)}>
                      {copy.adjust}
                    </Button>
                  </div>
                  {(c.recent_transactions || []).length > 0 ? (
                    <div className="mt-3 space-y-1">
                      {c.recent_transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex justify-between text-[12px] text-studio-w2"
                        >
                          <span>
                            {tx.label || tx.situationKey}
                            {tx.herkunft_studio_name
                              ? ` · ${tx.herkunft_studio_name}`
                              : ''}
                          </span>
                          <Badge variant="default">
                            {(tx.coins || 0) > 0 ? '+' : ''}
                            {tx.coins}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          )}

          <Pagination pagination={pagination} onPageChange={setPage} className="mt-4" />
        </>
      )}

      {adjustFor ? (
        <Modal onClose={() => setAdjustFor(null)} title={copy.modalTitle}>
          <p className="text-[13px] mb-3">
            {t('adminPages.elaycoins.modalIntro', {
              name: `${adjustFor?.vorname} ${adjustFor?.nachname}`,
              balance: adjustFor?.balance,
            })}
          </p>
          <Input
            label={copy.coinsLabel}
            type="number"
            value={coins}
            onChange={(e) => setCoins(e.target.value)}
          />
          <Input
            label={copy.reason}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-3"
          />
          <Button className="w-full mt-4" loading={saving} onClick={submitAdjust}>
            {copy.save}
          </Button>
        </Modal>
      ) : null}
    </div>
  )
}

export default AdminElaycoins
