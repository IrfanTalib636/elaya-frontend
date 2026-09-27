/**
 * Client-side mirror of elaya-backend/utils/shopPricingService.js —
 * used for instant live price previews in the admin Shop UI (no round-trip).
 * Keep the rules in sync with the backend implementation.
 */

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

const isWithinRange = (now, von, bis) => {
  if (von && now < new Date(von)) return false
  if (bis && now > new Date(bis)) return false
  return true
}

const isProductDiscountActive = (rabatt, now) =>
  Boolean(rabatt?.aktiv) && Number(rabatt?.wert) > 0 && isWithinRange(now, rabatt?.von, rabatt?.bis)

const isGeneralPromoActive = (promo, now) =>
  Boolean(promo?.aktiv) && Number(promo?.wert) > 0 && isWithinRange(now, promo?.von, promo?.bis)

const isProductExcludedFromGeneral = (product, promo) => {
  if (!promo) return true
  if (product?.rabatt?.exclude_from_general) return true
  const excludeIds = (promo.exclude_product_ids || []).map(String)
  return excludeIds.includes(String(product?.id))
}

const applyStep = (price, typ, wert) => {
  if (typ === 'fixed') return Math.max(0, round2(price - wert))
  return Math.max(0, round2(price * (1 - wert / 100)))
}

/**
 * @param {object} product - { id, preis_chf, waehrung, rabatt }
 * @param {object} [opts] - { now, generalPromo }
 */
export const resolveProductPrice = (product, opts = {}) => {
  const now = opts.now || new Date()
  const generalPromo = opts.generalPromo || null
  const currency = product?.waehrung === 'EUR' ? 'EUR' : 'CHF'
  const original = round2(product?.preis_chf)

  const productActive = isProductDiscountActive(product?.rabatt, now)
  const excludedFromGeneral = isProductExcludedFromGeneral(product, generalPromo)
  const generalCurrencyOk =
    !generalPromo || generalPromo.typ !== 'fixed' || generalPromo.waehrung === currency
  const generalActive = !excludedFromGeneral && generalCurrencyOk && isGeneralPromoActive(generalPromo, now)

  let price = original
  const applied = []

  if (excludedFromGeneral) {
    if (productActive) {
      price = applyStep(price, product.rabatt.typ, Number(product.rabatt.wert))
      applied.push('product')
    }
  } else if (product?.rabatt?.stackable_with_general) {
    if (generalActive) {
      price = applyStep(price, generalPromo.typ, Number(generalPromo.wert))
      applied.push('general')
    }
    if (productActive) {
      price = applyStep(price, product.rabatt.typ, Number(product.rabatt.wert))
      applied.push('product')
    }
  } else if (productActive) {
    price = applyStep(price, product.rabatt.typ, Number(product.rabatt.wert))
    applied.push('product')
  } else if (generalActive) {
    price = applyStep(price, generalPromo.typ, Number(generalPromo.wert))
    applied.push('general')
  }

  const final = round2(price)
  const savings = round2(Math.max(0, original - final))

  let discount_label = ''
  if (savings > 0 && original > 0) {
    const singleTyp =
      applied.length === 1 ? (applied[0] === 'product' ? product.rabatt.typ : generalPromo.typ) : null
    const singleWert =
      applied.length === 1
        ? Number(applied[0] === 'product' ? product.rabatt.wert : generalPromo.wert)
        : null

    if (singleTyp === 'fixed') {
      discount_label = `-${singleWert} ${currency}`
    } else {
      const pct = singleTyp === 'percent' ? Math.round(singleWert) : Math.round((savings / original) * 100)
      discount_label = `-${pct}%`
    }
  }

  return { original, final, currency, savings, discount_label, applied }
}

/** Returns the "live" promotion among a list — aktiv + currently in date range, most recent first. */
export const pickActivePromotion = (promotions = [], now = new Date()) => {
  const sorted = [...promotions].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )
  return sorted.find((p) => isGeneralPromoActive(p, now)) || null
}

export const formatMoney = (amount, currency = 'CHF') =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(amount || 0)
