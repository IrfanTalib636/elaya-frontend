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
    orange_fragen.push({
      frage_key: 'hauterkrankungen',
      frage_nr: 1,
      frage_text: 'Hauterkrankungen',
      antwort: hautSel.map((x) => HAUT_MAP[x] || x).join(', '),
    })
  }
  if (answers.pigmentstoerungen === 'ja') {
    orange_fragen.push({ frage_key: 'pigmentstoerungen', frage_nr: 2, frage_text: 'Pigmentstörungen', antwort: 'Ja' })
  }
  if (answers.chronische_erkrankungen === 'ja') {
    orange_fragen.push({
      frage_key: 'chronische_erkrankungen',
      frage_nr: 4,
      frage_text: 'Chronische Erkrankungen',
      antwort: `Ja${answers.chronische_erkrankungen_text ? ` (${answers.chronische_erkrankungen_text})` : ''}`,
    })
  }
  if (answers.allergien === 'ja') {
    orange_fragen.push({
      frage_key: 'allergien',
      frage_nr: 13,
      frage_text: 'Allergien',
      antwort: `Ja${answers.allergien_text ? ` (${answers.allergien_text})` : ''}`,
    })
  }
  if (answers.wundheilung === 'ja') {
    orange_fragen.push({ frage_key: 'wundheilung', frage_nr: 14, frage_text: 'Schlechte Wundheilung', antwort: 'Ja' })
  }
  if (answers.herpes_bereich === 'ja') {
    orange_fragen.push({ frage_key: 'herpes_bereich', frage_nr: 15, frage_text: 'Herpes im Bereich', antwort: 'Ja' })
  }

  if (answers.akute_erkrankung === 'ja') {
    rote_fragen.push({ frage_key: 'akute_erkrankung', frage_nr: 3, frage_text: 'Akute Erkrankung', antwort: 'Ja' })
  }
  if (['typ1', 'typ2', 'unbekannt'].includes(answers.diabetes)) {
    rote_fragen.push({
      frage_key: 'diabetes',
      frage_nr: 5,
      frage_text: 'Diabetes',
      antwort: answers.diabetes === 'typ1' ? 'Typ 1' : answers.diabetes === 'typ2' ? 'Typ 2' : 'Unbekannt',
    })
  }
  if (answers.autoimmun === 'ja') {
    rote_fragen.push({ frage_key: 'autoimmun', frage_nr: 6, frage_text: 'Autoimmunerkrankung', antwort: 'Ja' })
  }
  if (answers.immunschwaeche === 'ja') {
    rote_fragen.push({ frage_key: 'immunschwaeche', frage_nr: 7, frage_text: 'Immunschwäche', antwort: 'Ja' })
  }
  if (answers.herz_kreislauf === 'ja') {
    rote_fragen.push({ frage_key: 'herz_kreislauf', frage_nr: 8, frage_text: 'Herz-/Kreislauf', antwort: 'Ja' })
  }
  if (answers.epilepsie === 'ja') {
    rote_fragen.push({ frage_key: 'epilepsie', frage_nr: 9, frage_text: 'Epilepsie', antwort: 'Ja' })
  }
  if (answers.blutgerinnung === 'ja') {
    rote_fragen.push({ frage_key: 'blutgerinnung', frage_nr: 10, frage_text: 'Blutgerinnung', antwort: 'Ja' })
  }
  if (answers.blutverduenner === 'ja') {
    rote_fragen.push({ frage_key: 'blutverduenner', frage_nr: 11, frage_text: 'Blutverdünner', antwort: 'Ja' })
  }
  if (answers.schwanger === 'ja') {
    rote_fragen.push({ frage_key: 'schwanger', frage_nr: 16, frage_text: 'Schwanger / Stillend', antwort: 'Ja' })
  }
  if (answers.schwanger === 'unsicher') {
    rote_fragen.push({ frage_key: 'schwanger', frage_nr: 16, frage_text: 'Schwangerschaft', antwort: 'Unsicher' })
  }
  if (answers.alkohol_drogen === 'ja') {
    rote_fragen.push({ frage_key: 'alkohol_drogen', frage_nr: 17, frage_text: 'Alkohol / Drogen', antwort: 'Ja' })
  }
  if (answers.urteilsfaehig === 'nein') {
    rote_fragen.push({ frage_key: 'urteilsfaehig', frage_nr: 18, frage_text: 'Urteilsfähigkeit', antwort: 'Nein' })
  }

  const infekt = (answers.infektionskrankheiten || []).filter((x) => ['hepatitis', 'hiv'].includes(x))
  if (infekt.length) {
    rote_fragen.push({
      frage_key: 'infektionskrankheiten',
      frage_nr: 12,
      frage_text: 'Infektionskrankheit',
      antwort: infekt.map((x) => (x === 'hepatitis' ? 'Hepatitis' : 'HIV')).join(', '),
    })
  }

  const ampel_status = rote_fragen.length ? 'rot' : orange_fragen.length ? 'orange' : 'gruen'
  return { ampel_status, orange_fragen, rote_fragen }
}

const HINT_TEXT = {
  orange: '⚠️ Das Studio sieht diese Angabe und wird sich bei Bedarf vor deinem Termin bei dir melden.',
  red: '🔴 Das Studio sieht diese Angabe und wird sich vor deinem Termin bei dir melden um alles abzuklären.',
  red_ko: {
    akute_erkrankung: '🔴 Bei akuter Erkrankung können wir aktuell nicht lasern. Schliesse deinen Case trotzdem ab — beim Terminbuchen wirst du nochmals gefragt ob du genesen bist.',
    schwanger_ja: '🔴 Während Schwangerschaft und Stillzeit können wir nicht lasern. Schliesse deinen Case trotzdem ab — beim Terminbuchen wirst du nochmals gefragt.',
    schwanger_unsicher: '🔴 Das Studio wird sich bei dir melden um dies vor dem Termin abzuklären.',
    alkohol_drogen: '🔴 Unter diesem Einfluss ist eine Behandlung nicht möglich. Schliesse deinen Case trotzdem ab — beim Terminbuchen wirst du nochmals gefragt.',
    urteilsfaehig: '🔴 Schliesse deinen Case trotzdem ab — das Studio wird sich bei dir melden.',
    mindestalter_18: '🔴 Die Behandlung ist erst ab 18 Jahren möglich. Das Studio wird sich bei dir melden.',
  },
}

export const computeInlineHints = (answers = {}) => {
  const hints = []
  const ampel = computeAmpel(answers)

  for (const flag of ampel.orange_fragen) {
    hints.push({ frage_key: flag.frage_key, level: 'orange', text: HINT_TEXT.orange })
  }

  for (const flag of ampel.rote_fragen) {
    let level = 'red'
    let text = HINT_TEXT.red
    if (flag.frage_key === 'akute_erkrankung') {
      level = 'red_ko'
      text = HINT_TEXT.red_ko.akute_erkrankung
    } else if (flag.frage_key === 'schwanger' && flag.antwort === 'Ja') {
      level = 'red_ko'
      text = HINT_TEXT.red_ko.schwanger_ja
    } else if (flag.frage_key === 'schwanger' && flag.antwort === 'Unsicher') {
      level = 'red_ko'
      text = HINT_TEXT.red_ko.schwanger_unsicher
    } else if (flag.frage_key === 'alkohol_drogen') {
      level = 'red_ko'
      text = HINT_TEXT.red_ko.alkohol_drogen
    } else if (flag.frage_key === 'urteilsfaehig') {
      level = 'red_ko'
      text = HINT_TEXT.red_ko.urteilsfaehig
    }
    hints.push({ frage_key: flag.frage_key, level, text })
  }

  if (answers.mindestalter_18 === 'nein') {
    hints.push({ frage_key: 'mindestalter_18', level: 'red_ko', text: HINT_TEXT.red_ko.mindestalter_18 })
  }

  const byKey = Object.fromEntries(hints.map((h) => [h.frage_key, h]))
  const has_ko_flags =
    answers.akute_erkrankung === 'ja' ||
    answers.schwanger === 'ja' ||
    answers.alkohol_drogen === 'ja' ||
    answers.urteilsfaehig === 'nein' ||
    answers.mindestalter_18 === 'nein'

  return { hints, hintsByKey: byKey, has_ko_flags }
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
