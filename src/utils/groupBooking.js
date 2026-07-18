/** Group booking size points + 15% discount — matches inkderm prototype § gruppenTermin */

export const DEFAULT_GRUPPEN_CONFIG = {
  klein_max_cm2: 50,
  mittelgross_max_cm2: 150,
  max_punkte: 4,
  gruppen_rabatt: 0.15,
}

export const caseFlaecheCm2 = (c) => {
  if (c?.zonen_aktiv && Array.isArray(c.zonen) && c.zonen.length) {
    return c.zonen.reduce((s, z) => s + (Number.parseFloat(z.flaeche_cm2) || 0), 0)
  }
  const f = Number.parseFloat(c?.flaeche_cm2)
  if (f > 0) return f
  const l = Number.parseFloat(c?.tc_size_length) || 0
  const w = Number.parseFloat(c?.tc_size_width) || 0
  if (l > 0 && w > 0) return l * w
  return 0
}

export const caseGroesse = (c, config = DEFAULT_GRUPPEN_CONFIG) => {
  const cfg = { ...DEFAULT_GRUPPEN_CONFIG, ...config }
  const cm2 = caseFlaecheCm2(c)
  if (cm2 <= cfg.klein_max_cm2) return { kategorie: 'klein', label: 'Klein', punkte: 1, cm2 }
  if (cm2 <= cfg.mittelgross_max_cm2) {
    return { kategorie: 'mittelgross', label: 'Mittelgross', punkte: 2, cm2 }
  }
  return { kategorie: 'gross', label: 'Gross', punkte: 4, cm2 }
}

export const casePreis = (c) => {
  const p = Number.parseFloat(c?.pricePerSession)
  return p > 0 ? p : 0
}

export const round5 = (n) => Math.round(n / 5) * 5

export const isGroupEligibleCase = (c) => {
  if (!c) return false
  if (c.type === 'pmu') return false
  const st = c.status
  return st !== 'draft' && st !== 'completed' && st !== 'abgeschlossen' && st !== 'done'
}

export const calcGroupPricing = (selectedCases, config = DEFAULT_GRUPPEN_CONFIG) => {
  const cfg = { ...DEFAULT_GRUPPEN_CONFIG, ...config }
  const einzel = selectedCases.map((c) => ({
    id: c.id ?? c._id,
    label: c.bodyLabel || c.tc_title || c.caseId || 'Tattoo',
    preis: casePreis(c),
  }))
  const zwischensumme = einzel.reduce((s, e) => s + e.preis, 0)
  const rabattPct = cfg.gruppen_rabatt ?? 0.15
  const gesamt = round5(zwischensumme * (1 - rabattPct))
  const rabatt = zwischensumme - gesamt
  return { einzel, zwischensumme, gesamt, rabatt, rabattPct }
}

export const totalPunkte = (selectedCases, config) =>
  selectedCases.reduce((s, c) => s + caseGroesse(c, config).punkte, 0)

export const hasGross = (selectedCases, config) =>
  selectedCases.some((c) => caseGroesse(c, config).kategorie === 'gross')

/**
 * Toggle rules from prototype:
 * - Gross alone only
 * - Cannot add more if a gross is already selected
 * - Cannot exceed max_punkte
 */
export const canToggleCase = (caseDoc, selectedIds, allCases, config = DEFAULT_GRUPPEN_CONFIG) => {
  const cfg = { ...DEFAULT_GRUPPEN_CONFIG, ...config }
  const id = String(caseDoc.id ?? caseDoc._id)
  const selected = selectedIds.map(String)
  const isSel = selected.includes(id)

  if (isSel) return { ok: true, next: selected.filter((x) => x !== id) }

  const g = caseGroesse(caseDoc, cfg)
  if (g.kategorie === 'gross') {
    return { ok: true, next: [id] }
  }

  const selectedCases = allCases.filter((c) => selected.includes(String(c.id ?? c._id)))
  if (hasGross(selectedCases, cfg)) {
    return { ok: false, reason: 'Grosser Tattoo muss allein gebucht werden.' }
  }

  const pts = totalPunkte(selectedCases, cfg)
  if (pts + g.punkte > cfg.max_punkte) {
    return { ok: false, reason: `Max. ${cfg.max_punkte} Punkte überschritten.` }
  }

  return { ok: true, next: [...selected, id] }
}

export const fmtCHF = (n) =>
  n != null
    ? `CHF ${Number(n).toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '—'
