export const EMPTY_ANAMNESIS = {
  hauterkrankungen: [],
  hauterkrankungen_andere: '',
  pigmentstoerungen: null,
  akute_erkrankung: null,
  chronische_erkrankungen: null,
  chronische_erkrankungen_text: '',
  diabetes: null,
  autoimmun: null,
  autoimmun_text: '',
  immunschwaeche: null,
  herz_kreislauf: null,
  epilepsie: null,
  blutgerinnung: null,
  blutverduenner: null,
  blutverduenner_text: '',
  infektionskrankheiten: [],
  infektionskrankheiten_andere: '',
  allergien: null,
  allergien_text: '',
  wundheilung: null,
  herpes_bereich: null,
  schwanger: null,
  alkohol_drogen: null,
  urteilsfaehig: null,
  mindestalter_18: null,
}

/** Strip server metadata — only the 19 questionnaire fields for submit/display. */
export const pickAnamnesisAnswers = (source = {}) => {
  const picked = {}
  for (const key of Object.keys(EMPTY_ANAMNESIS)) {
    if (source[key] !== undefined && source[key] !== null) {
      picked[key] = source[key]
    }
  }
  return picked
}

const HAUT_MAP = {
  neurodermitis: 'Neurodermitis',
  psoriasis: 'Psoriasis',
  ekzem: 'Ekzem',
  vitiligo: 'Vitiligo',
  akne: 'Akne',
  herpes: 'Herpes',
  andere: 'Andere',
}

export const computeAmpel = (answers = {}) => {
  const orange_fragen = []
  const rote_fragen = []

  const hautSel = (answers.hauterkrankungen || []).filter((x) => x !== 'nein')
  if (hautSel.length > 0) {
    orange_fragen.push({ frage_text: 'Hauterkrankungen', antwort: hautSel.map((x) => HAUT_MAP[x] || x).join(', ') })
  }
  if (answers.pigmentstoerungen === 'ja') orange_fragen.push({ frage_text: 'Pigmentstörungen', antwort: 'Ja' })
  if (answers.chronische_erkrankungen === 'ja') {
    orange_fragen.push({
      frage_text: 'Chronische Erkrankungen',
      antwort: `Ja${answers.chronische_erkrankungen_text ? ` (${answers.chronische_erkrankungen_text})` : ''}`,
    })
  }
  if (answers.allergien === 'ja') {
    orange_fragen.push({
      frage_text: 'Allergien',
      antwort: `Ja${answers.allergien_text ? ` (${answers.allergien_text})` : ''}`,
    })
  }
  if (answers.wundheilung === 'ja') orange_fragen.push({ frage_text: 'Schlechte Wundheilung', antwort: 'Ja' })
  if (answers.herpes_bereich === 'ja') orange_fragen.push({ frage_text: 'Herpes im Bereich', antwort: 'Ja' })

  if (answers.akute_erkrankung === 'ja') rote_fragen.push({ frage_text: 'Akute Erkrankung', antwort: 'Ja' })
  if (['typ1', 'typ2', 'unbekannt'].includes(answers.diabetes)) {
    rote_fragen.push({
      frage_text: 'Diabetes',
      antwort: answers.diabetes === 'typ1' ? 'Typ 1' : answers.diabetes === 'typ2' ? 'Typ 2' : 'Unbekannt',
    })
  }
  if (answers.autoimmun === 'ja') rote_fragen.push({ frage_text: 'Autoimmunerkrankung', antwort: 'Ja' })
  if (answers.immunschwaeche === 'ja') rote_fragen.push({ frage_text: 'Immunschwäche', antwort: 'Ja' })
  if (answers.herz_kreislauf === 'ja') rote_fragen.push({ frage_text: 'Herz-/Kreislauf', antwort: 'Ja' })
  if (answers.epilepsie === 'ja') rote_fragen.push({ frage_text: 'Epilepsie', antwort: 'Ja' })
  if (answers.blutgerinnung === 'ja') rote_fragen.push({ frage_text: 'Blutgerinnung', antwort: 'Ja' })
  if (answers.blutverduenner === 'ja') rote_fragen.push({ frage_text: 'Blutverdünner', antwort: 'Ja' })
  if (answers.schwanger === 'ja') rote_fragen.push({ frage_text: 'Schwanger / Stillend', antwort: 'Ja' })
  if (answers.schwanger === 'unsicher') rote_fragen.push({ frage_text: 'Schwangerschaft', antwort: 'Unsicher' })
  if (answers.alkohol_drogen === 'ja') rote_fragen.push({ frage_text: 'Alkohol / Drogen', antwort: 'Ja' })
  if (answers.urteilsfaehig === 'nein') rote_fragen.push({ frage_text: 'Urteilsfähigkeit', antwort: 'Nein' })

  const infekt = (answers.infektionskrankheiten || []).filter((x) => ['hepatitis', 'hiv'].includes(x))
  if (infekt.length) {
    rote_fragen.push({
      frage_text: 'Infektionskrankheit',
      antwort: infekt.map((x) => (x === 'hepatitis' ? 'Hepatitis' : 'HIV')).join(', '),
    })
  }

  const ampel_status = rote_fragen.length ? 'rot' : orange_fragen.length ? 'orange' : 'gruen'
  return { ampel_status, orange_fragen, rote_fragen }
}

export const isAnamnesisComplete = (a = {}) =>
  !!(
    (a.hauterkrankungen || []).length &&
    a.pigmentstoerungen &&
    a.akute_erkrankung &&
    a.chronische_erkrankungen &&
    a.diabetes &&
    a.autoimmun &&
    a.immunschwaeche &&
    a.herz_kreislauf &&
    a.epilepsie &&
    a.blutgerinnung &&
    a.blutverduenner &&
    (a.infektionskrankheiten || []).length &&
    a.allergien &&
    a.wundheilung &&
    a.herpes_bereich &&
    a.schwanger &&
    a.alkohol_drogen &&
    a.urteilsfaehig &&
    a.mindestalter_18
  )

export const AMPEL_LABELS = {
  gruen: { emoji: '🟢', label: 'Alles geklärt', className: 'text-studio-teal-2 border-studio-teal-2/30 bg-studio-teal-2/10' },
  orange: { emoji: '🟡', label: 'Hinweise offen', className: 'text-studio-gold border-studio-gold/30 bg-studio-gold/10' },
  rot: { emoji: '🔴', label: 'Abklärung nötig', className: 'text-studio-red border-studio-red/30 bg-studio-red/10' },
}
