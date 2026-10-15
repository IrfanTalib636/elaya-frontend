export const PRICING_GROUPS = [
  {
    id: 'base',
    title: 'Grundpreise',
    fields: [
      { key: 'basePricePerCm2', label: 'Basispreis / cm² (CHF)',       step: '0.01' },
      { key: 'minPrice',        label: 'Mindestpreis / Sitzung (CHF)', step: '1'    },
      { key: 'pmuPrice',        label: 'PMU-Preis (CHF)',              step: '1'    },
    ],
  },
]

export const ENGINE_PRICING_GROUPS = [
  {
    id: 'rounding',
    title: 'Rounding',
    fields: [
      { key: 'price_round_to', label: 'Round session price up to (CHF)', step: '1' },
    ],
  },
]

export const PRICING_LABELS = Object.fromEntries(
  PRICING_GROUPS.flatMap((group) => group.fields.map(({ key, label }) => [key, label]))
)

const allPricingGroups = (includeEngineRules) =>
  includeEngineRules ? [...PRICING_GROUPS, ...ENGINE_PRICING_GROUPS] : PRICING_GROUPS

export const pricingValuesFromConfig = (studioPricing = {}, { includeEngineRules = false } = {}) =>
  Object.fromEntries(
    allPricingGroups(includeEngineRules).flatMap((group) =>
      group.fields.map(({ key }) => [
        key,
        studioPricing?.[key] != null ? String(studioPricing[key]) : '',
      ])
    )
  )

export const buildStudioPricing = (values = {}) => {
  const pricing = {}
  Object.entries(values).forEach(([key, value]) => {
    if (value === '' || value == null) return
    const n = parseFloat(value)
    if (!Number.isNaN(n)) pricing[key] = n
  })
  return pricing
}
