/**
 * German labels for the 8-step case intake wizard (TC_01–TC_06 + KI + review).
 * API field values stay English; only UI labels are localized.
 */

export const caseForm = {
  caseTypes: [
    { value: 'tattoo', label: 'Tattoo-Entfernung' },
    { value: 'pmu', label: 'PMU-Entfernung' },
  ],

  wizardSteps: [
    { id: 'basics', code: 'TC_01', title: 'Basics', subtitle: 'Grundangaben' },
    { id: 'properties', code: 'TC_02', title: 'Eigenschaften', subtitle: 'Farben & Grösse' },
    { id: 'skin', code: 'TC_03', title: 'Haut & Risiko', subtitle: 'Sicherheit' },
    { id: 'lifestyle', code: 'TC_04', title: 'Lifestyle', subtitle: 'Regeneration' },
    { id: 'goal', code: 'TC_05', title: 'Ziel', subtitle: 'Erwartung' },
    { id: 'photos', code: 'TC_06', title: 'Fotos', subtitle: 'Optional' },
    { id: 'pricing', code: 'KI', title: 'Analyse', subtitle: 'Preisschätzung' },
    { id: 'review', code: '✓', title: 'Übersicht', subtitle: 'Prüfen & speichern' },
  ],

  bodyLocations: [
    ['arm', 'Arm'], ['leg', 'Bein'], ['chest', 'Brust'], ['back', 'Rücken'],
    ['shoulder', 'Schulter'], ['neck', 'Hals'], ['face', 'Gesicht'], ['abdomen', 'Bauch'],
    ['hip', 'Hüfte'], ['hand', 'Hand'], ['foot', 'Fuss'], ['other', 'Andere'],
  ],

  tcSides: [['left', 'Links'], ['right', 'Rechts'], ['center', 'Mitte']],

  tcAgeBuckets: [
    ['under_1', '< 1 Jahr'], ['age_1_3', '1–3 Jahre'], ['age_4_7', '4–7 Jahre'],
    ['age_8_15', '8–15 Jahre'], ['over_15', '> 15 Jahre'], ['unknown', 'Unbekannt'],
  ],

  tcTypes: [
    ['professional', 'Professionell'], ['amateur', 'Amateur'], ['cosmetic', 'Kosmetisch'],
    ['coverup', 'Cover-up'], ['mixed', 'Gemischt'],
  ],

  tcCoverup: [
    ['none', 'Kein Cover-up'], ['once', '1× überdeckt'],
    ['multiple', 'Mehrfach überdeckt'], ['unknown', 'Unbekannt'],
  ],

  qualityLevel: [
    ['low', 'Niedrig'], ['medium', 'Mittel'], ['high', 'Hoch'], ['very_high', 'Sehr hoch'],
  ],

  shadingLevel: [['none', 'Kein'], ['low', 'Wenig'], ['medium', 'Mittel'], ['high', 'Viel']],

  lineworkLevel: [
    ['fine', 'Fein'], ['medium', 'Mittel'], ['bold', 'Kräftig'], ['mixed', 'Gemischt'],
  ],

  inkColors: [
    { id: 'black', color: '#1a1a1a', label: 'Schwarz' },
    { id: 'grey', color: '#888888', label: 'Grau' },
    { id: 'red', color: '#cc2233', label: 'Rot' },
    { id: 'orange', color: '#e67300', label: 'Orange' },
    { id: 'yellow', color: '#e6cc00', label: 'Gelb' },
    { id: 'green', color: '#1a8833', label: 'Grün' },
    { id: 'blue', color: '#1a3366', label: 'Blau' },
    { id: 'purple', color: '#7733aa', label: 'Lila' },
    { id: 'white', color: '#f0f0f0', label: 'Weiss' },
    { id: 'skin_tone', color: '#d4a574', label: 'Hautton' },
  ],

  fitzpatrick: [
    { id: 'I', color: '#f5dcc3', desc: 'Sehr hell' },
    { id: 'II', color: '#e8c8a0', desc: 'Hell' },
    { id: 'III', color: '#c8a878', desc: 'Mittel' },
    { id: 'IV', color: '#a08060', desc: 'Olive' },
    { id: 'V', color: '#6a4a30', desc: 'Braun' },
    { id: 'VI', color: '#3a2a1a', desc: 'Dunkel' },
    { id: 'unsicher', color: 'linear-gradient(135deg,#f5dcc3,#3a2a1a)', desc: 'Unsicher' },
  ],

  riskLevel: [['low', 'Gering'], ['medium', 'Mittel'], ['high', 'Hoch'], ['unsure', 'Unsicher']],

  sunExposure: [['low', 'Gering'], ['medium', 'Mittel'], ['high', 'Hoch']],

  lifeSmoker: [
    ['no', 'Nein'], ['occasionally', 'Gelegentlich'],
    ['daily_light', 'Täglich leicht'], ['daily_heavy', 'Täglich stark'],
  ],

  lifeAlcohol: [
    ['never', 'Nie'], ['rarely', 'Selten'], ['1-2x_week', '1–2×/Wo'],
    ['3-4x_week', '3–4×/Wo'], ['5+x_week', '5+×/Wo'],
  ],

  lifeActivity: [
    ['low', 'Wenig'], ['light', 'Leicht'], ['regular', 'Regelmässig'], ['high', 'Intensiv'],
  ],

  lifeSleepHours: [
    ['under_5', '< 5h'], ['5-6', '5–6h'], ['6-7', '6–7h'], ['7-8', '7–8h'], ['8+', '8+h'],
  ],

  lifeSleepQuality: [
    ['poor', 'Schlecht'], ['fair', 'Mässig'], ['good', 'Gut'], ['excellent', 'Sehr gut'],
  ],

  lifeStress: [
    ['low', 'Niedrig'], ['medium', 'Mittel'], ['high', 'Hoch'], ['very_high', 'Sehr hoch'],
  ],

  lifeHydration: [['low', 'Wenig'], ['normal', 'Normal'], ['good', 'Gut']],

  lifeNutrition: [['poor', 'Unausgewogen'], ['fair', 'Mässig'], ['good', 'Gut']],

  goalTargets: [
    ['full_removal', 'Komplette Entfernung', 'Das Tattoo soll vollständig verschwinden.'],
    ['lightening_for_coverup', 'Aufhellen für Cover-Up', 'Aufhellung für ein neues Tattoo darüber.'],
    ['partial_fade', 'Teilweise verblassen', 'Nur ein Teil soll entfernt oder aufgehellt werden.'],
  ],

  zoneDichte: [
    ['low', 'Niedrig'], ['medium', 'Mittel'], ['high', 'Hoch'], ['very_high', 'Sehr hoch'],
  ],

  zoneFlaechen: [
    { value: 'xs', label: 'Sehr klein', cm2: 3 },
    { value: 'sm', label: 'Klein', cm2: 8 },
    { value: 'md', label: 'Mittel', cm2: 13.5 },
    { value: 'lg', label: 'Gross', cm2: 21 },
    { value: 'xl', label: 'Sehr gross', cm2: 33 },
    { value: 'xxl', label: 'Extra gross', cm2: 45 },
  ],

  photoChecklist: [
    { key: 'photo_full_visible', label: 'Ganzes Tattoo sichtbar' },
    { key: 'photo_good_light', label: 'Gutes natürliches Licht' },
    { key: 'photo_focus', label: 'Scharf und nicht verschwommen' },
    { key: 'photo_distance', label: 'Ca. 30 cm Abstand' },
    { key: 'photo_no_filter', label: 'Kein Filter / keine Bearbeitung' },
  ],

  ui: {
    optional: '(optional)',
    yes: 'Ja',
    no: 'Nein',
    choose: '— wählen —',
    back: 'Zurück',
    cancel: 'Abbrechen',
    next: 'Weiter',
    save: 'Fall speichern',
    createCase: 'Fall anlegen',
    perSession: '/ Sitzung',

    validation: {
      titleRequired: 'Bitte Bezeichnung angeben.',
      bodyRequired: 'Bitte Körperregion wählen.',
      ageRequired: 'Bitte Tattoo-Alter wählen.',
      typeRequired: 'Bitte Tattoo-Typ wählen.',
      priorRequired: 'Bitte Vorbehandlungen angeben.',
      zonesMin: 'Mindestens 2 Zonen erforderlich.',
      zonesIncomplete: 'Bitte alle Zonen vollständig ausfüllen.',
      colorsRequired: 'Bitte mindestens eine Farbe wählen.',
      propertiesRequired: 'Bitte alle Eigenschaften ausfüllen.',
      sizeRequired: 'Bitte Masse in cm angeben.',
      fitzRequired: 'Bitte Fitzpatrick-Typ wählen.',
      sunRequired: 'Bitte Sonnenexposition wählen.',
      lifestyleRequired: 'Bitte alle Pflichtfelder ausfüllen.',
      sleepRequired: 'Bitte Schlaf & Stress angeben.',
      bodyMassRequired: 'Bitte Körpermasse angeben.',
      hydrationRequired: 'Bitte Hydration & Ernährung angeben.',
      goalRequired: 'Bitte Behandlungsziel wählen.',
      pricingFailed: 'Schätzung konnte nicht berechnet werden.',
    },

    basics: {
      caseType: 'Fall-Typ',
      pmuNotice: 'PMU-Fälle nutzen derzeit eine vereinfachte Erfassung. Vollständiger PMU-Wizard folgt — Sie können Basics speichern und Details später ergänzen.',
      title: 'Bezeichnung *',
      titlePlaceholder: 'z. B. Unterarm links Schriftzug',
      bodyRegion: 'Körperregion *',
      bodyHint: 'Wo befindet sich das Tattoo?',
      zoneMode: 'Zonen-Modus',
      zoneHint: 'Grosses Motiv über mehrere Bereiche?',
      singleTattoo: 'Einzelnes Tattoo',
      splitZones: 'In Zonen aufteilen',
      side: 'Seite',
      tattooAge: 'Tattoo-Alter *',
      tattooType: 'Tattoo-Typ *',
      coverup: 'Cover-Up *',
      coverupHint: 'Wurde über ein älteres Tattoo tätowiert?',
      priorTreatment: 'Vorbehandlungen *',
      priorHint: 'Bereits laser-behandelt?',
      priorCount: 'Anzahl Vorbehandlungen',
      priorCountPlaceholder: 'z. B. 3',
    },

    properties: {
      zonesTitle: 'Zonen aufteilen *',
      zonesHint: 'Mind. 2, max. 8 Zonen. Jede Zone wird separat geschätzt.',
      zone: 'Zone',
      zoneLabel: 'Bezeichnung *',
      zoneLabelPlaceholder: 'z. B. Unterarm aussen',
      bodyPart: 'Körperstelle *',
      colors: 'Farben *',
      density: 'Dichte *',
      area: 'Fläche *',
      customArea: 'Eigene Angabe (cm²)',
      areaCm2: 'Fläche (cm²)',
      addZone: 'Weitere Zone',
      colorDensity: 'Farbdichte',
      saturation: 'Farbsättigung',
      shading: 'Schattierung',
      linework: 'Linienarbeit',
      dimensions: 'Masse in cm *',
      dimensionsHint: 'Mit Lineal messen — Studio misst exakt nach.',
      length: 'Länge',
      width: 'Breite',
    },

    skin: {
      fitzpatrick: 'Fitzpatrick-Hauttyp *',
      fitzHint: 'Natürliche Hautfarbe ohne Bräune.',
      hyperpig: 'Hyperpigmentierungsrisiko',
      keloid: 'Keloid-/Narbenrisiko',
      sunZone: 'Sonnenexpositionszone *',
      sunHint: 'Wie stark ist die Stelle der Sonne ausgesetzt?',
    },

    lifestyle: {
      smoking: 'Rauchverhalten *',
      smokingHint: 'Rauchen verlangsamt die Entfernung erheblich.',
      cigarettesPerDay: 'Zigaretten pro Tag',
      bodyMass: 'Körpermasse *',
      height: 'Grösse (cm)',
      weight: 'Gewicht (kg)',
      alcohol: 'Alkohol *',
      activity: 'Aktivitätslevel *',
      sleepHours: 'Schlafstunden *',
      sleepQuality: 'Schlafqualität *',
      stress: 'Stressniveau *',
      hydration: 'Hydration *',
      nutrition: 'Ernährungsqualität *',
    },

    goal: {
      title: 'Behandlungsziel *',
      notes: 'Anmerkungen',
      notesPlaceholder: 'Weitere Angaben oder Wünsche…',
    },

    photos: {
      title: 'Erstfotos (optional)',
      intro: 'Fotos werden sicher auf unserem Server gespeichert — kein öffentlicher Link. Sie können diesen Schritt überspringen; der Kunde kann Fotos später in der App hochladen.',
      main: 'Hauptfoto',
      mainHint: 'Ganzes Tattoo',
      detail: 'Detailfoto',
      detailHint: 'Nahaufnahme',
      marker: 'Referenzmarker',
      markerHint: 'Optional',
      checklist: 'Qualitäts-Checkliste',
      selectPhoto: 'Foto auswählen',
      uploading: 'Wird hochgeladen…',
      uploadFailed: 'Upload fehlgeschlagen',
      removeFailed: 'Entfernen fehlgeschlagen',
      removeAria: 'Foto entfernen',
    },

    pricing: {
      title: 'KI-Tattooanalyse',
      confidence: 'Konfidenz',
      estimatedSessions: 'Geschätzte Sitzungen',
      timeframe: 'Zeitrahmen ca.',
      months: 'Monate',
      priceEstimate: 'Preisschätzung',
      area: 'Fläche',
      pricePerSession: 'Preis pro Sitzung',
      totalCost: 'Gesamtkosten',
      disclaimer: 'KI-Schätzung (AB-Preis{confidence}). Endgültiger Preis wird im Studio nach exakter Messung bestätigt.',
      nextStep: 'Im nächsten Schritt prüfen Sie die Zusammenfassung. Nach dem Speichern können Sie die Anamnese im Fall-Detail erfassen.',
    },

    review: {
      title: 'Zusammenfassung',
      type: 'Typ',
      tattoo: 'Tattoo',
      pmu: 'PMU',
      label: 'Bezeichnung',
      bodyRegion: 'Körperregion',
      zones: 'Zonen',
      zonesCount: 'Zonen',
      singleTattoo: 'Einzelnes Tattoo',
      area: 'Fläche',
      age: 'Alter',
      tattooStyle: 'Tätowierungsart',
      fitzpatrick: 'Fitzpatrick',
      goal: 'Ziel',
      pricePerSession: 'Preis / Sitzung',
      sessionsEstimated: 'Sitzungen (geschätzt)',
      afterSave: 'Nach dem Speichern können Sie die Anamnese im Fall-Detail erfassen und Behandlungen planen.',
    },
  },
}
