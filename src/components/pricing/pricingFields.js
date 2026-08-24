/**
 * Studio-editable pricing keys, grouped for the editor UI.
 * Base prices are CHF values, everything else is a multiplier.
 */
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
  {
    id: 'color',
    title: 'Farb-Multiplikatoren',
    fields: [
      { key: 'color_black',     label: 'Schwarz'      },
      { key: 'color_mixed',     label: 'Gemischt'     },
      { key: 'color_multi',     label: 'Mehrfarbig'   },
      { key: 'color_difficult', label: 'Schwierige Farben (weiss/gelb/hautfarben)' },
    ],
  },
  {
    id: 'depth',
    title: 'Stichtiefe',
    fields: [
      { key: 'depth_shallow',   label: 'Oberflächlich' },
      { key: 'depth_normal',    label: 'Normal'        },
      { key: 'depth_deep',      label: 'Tief'          },
      { key: 'depth_very_deep', label: 'Sehr tief'     },
    ],
  },
  {
    id: 'age',
    title: 'Tattoo-Alter',
    fields: [
      { key: 'age_under1', label: 'unter 1 Jahr'  },
      { key: 'age_1to3',   label: '1–3 Jahre'     },
      { key: 'age_3to5',   label: '3–5 Jahre'     },
      { key: 'age_5to10',  label: '5–10 Jahre'    },
      { key: 'age_over10', label: 'über 10 Jahre' },
    ],
  },
  {
    id: 'skin',
    title: 'Hauttyp (Fitzpatrick)',
    fields: [
      { key: 'skin_1', label: 'Typ I'   },
      { key: 'skin_2', label: 'Typ II'  },
      { key: 'skin_3', label: 'Typ III' },
      { key: 'skin_4', label: 'Typ IV'  },
      { key: 'skin_5', label: 'Typ V'   },
      { key: 'skin_6', label: 'Typ VI'  },
    ],
  },
  {
    id: 'location',
    title: 'Körperstelle',
    fields: [
      { key: 'location_arm',   label: 'Arm'         },
      { key: 'location_leg',   label: 'Bein'        },
      { key: 'location_torso', label: 'Torso'       },
      { key: 'location_neck',  label: 'Hals/Nacken' },
      { key: 'location_face',  label: 'Gesicht'     },
      { key: 'location_hand',  label: 'Hand'        },
      { key: 'location_foot',  label: 'Fuss'        },
    ],
  },
  {
    id: 'layering',
    title: 'Layering / Cover-up',
    fields: [
      { key: 'layering_none',  label: 'Kein'     },
      { key: 'layering_once',  label: 'Einmal'   },
      { key: 'layering_multi', label: 'Mehrfach' },
    ],
  },
  {
    id: 'goal',
    title: 'Behandlungsziel',
    fields: [
      { key: 'goal_full',    label: 'Vollständige Entfernung'  },
      { key: 'goal_partial', label: 'Teilweise Aufhellung'     },
      { key: 'goal_lighten', label: 'Aufhellung für Cover-up'  },
    ],
  },
]

/** key → German label, for compact override summaries. */
export const PRICING_LABELS = Object.fromEntries(
  PRICING_GROUPS.flatMap((group) => group.fields.map(({ key, label }) => [key, label]))
)

/** Form state (all keys as strings, '' = Plattform-Standard) from a studio_pricing override set. */
export const pricingValuesFromConfig = (studioPricing = {}) =>
  Object.fromEntries(
    PRICING_GROUPS.flatMap((group) =>
      group.fields.map(({ key }) => [
        key,
        studioPricing?.[key] != null ? String(studioPricing[key]) : '',
      ])
    )
  )

/** studio_pricing PATCH payload from form values — only filled fields, parsed as numbers. */
export const buildStudioPricing = (values = {}) => {
  const pricing = {}
  Object.entries(values).forEach(([key, value]) => {
    if (value === '' || value == null) return
    const n = parseFloat(value)
    if (!Number.isNaN(n)) pricing[key] = n
  })
  return pricing
}
