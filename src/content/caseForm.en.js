/**
 * English labels for the 8-step case intake wizard (TC_01–TC_06 + AI + review).
 */

export const caseForm = {
  caseTypes: [
    { value: 'tattoo', label: 'Tattoo removal' },
    { value: 'pmu', label: 'PMU removal' },
  ],

  wizardSteps: [
    { id: 'basics', code: 'TC_01', title: 'Basics', subtitle: 'General info' },
    { id: 'properties', code: 'TC_02', title: 'Properties', subtitle: 'Colors & size' },
    { id: 'skin', code: 'TC_03', title: 'Skin & risk', subtitle: 'Safety' },
    { id: 'lifestyle', code: 'TC_04', title: 'Lifestyle', subtitle: 'Recovery' },
    { id: 'goal', code: 'TC_05', title: 'Goal', subtitle: 'Expectations' },
    { id: 'photos', code: 'TC_06', title: 'Photos', subtitle: 'Optional' },
    { id: 'pricing', code: 'AI', title: 'Analysis', subtitle: 'Price estimate' },
    { id: 'review', code: '✓', title: 'Review', subtitle: 'Check & save' },
  ],

  pmuWizardSteps: [
    { id: 'pmu-basics', code: 'PMU_01', title: 'Basics', subtitle: 'PMU details' },
    { id: 'pmu-pretreatment', code: 'PMU_02', title: 'Pretreatment', subtitle: 'Laser history' },
    { id: 'pmu-colors', code: 'PMU_03', title: 'Colors', subtitle: 'Details' },
    { id: 'pmu-lifestyle', code: 'PMU_04', title: 'Lifestyle', subtitle: 'Recovery' },
    { id: 'pmu-prognosis', code: 'PMU_05', title: 'Prognosis', subtitle: 'Consent' },
    { id: 'pmu-photos', code: 'PMU_06', title: 'Photos', subtitle: 'Optional' },
    { id: 'pmu-review', code: '✓', title: 'Review', subtitle: 'Check & save' },
  ],

  pmuTypes: [
    ['eyebrows', 'Eyebrows'], ['eyeliner', 'Eyeliner'], ['lips', 'Lips'],
    ['microblading', 'Microblading'], ['other', 'Other'],
  ],
  pmuSides: [['left', 'Left'], ['right', 'Right'], ['both', 'Both']],
  pmuAgeRanges: [
    ['<1', '< 1 year'], ['1-3', '1-3 years'], ['4-7', '4-7 years'],
    ['8-15', '8-15 years'], ['>15', '> 15 years'], ['unknown', 'Unknown'],
  ],
  pmuTechniques: [
    ['professional', 'Professional'], ['amateur', 'Amateur'], ['cosmetic', 'Cosmetic tattoo'],
  ],
  pmuPigments: [
    ['organic', 'Organic (plant-based)'], ['inorganic', 'Inorganic (iron oxide)'], ['unknown', 'Unknown'],
  ],
  pmuStitchDepths: [
    ['surface', 'Surface (microblading)'], ['medium', 'Medium (standard PMU)'], ['deep', 'Deep (classic)'],
  ],
  pmuColors: ['Schwarz', 'Braun', 'Grau', 'Beige', 'Rotbraun', 'Andere'],
  pmuColorDensity: [['light', 'Light'], ['medium', 'Medium'], ['intense', 'Intense']],
  pmuColorSaturation: [['faded', 'Faded'], ['normal', 'Normal'], ['saturated', 'Saturated']],
  pmuLifeSmoker: [
    ['never', 'Never'], ['occasional', 'Occasional'],
    ['daily_light', 'Daily (light)'], ['daily_heavy', 'Daily (heavy)'],
  ],
  pmuLifeAlcohol: [['rarely', 'Rarely'], ['moderate', 'Moderate'], ['frequent', 'Frequent']],
  pmuLifeActivity: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']],
  pmuLifeHydration: [['low', 'Low'], ['medium', 'Normal'], ['high', 'High']],
  pmuLifeAftercare: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']],

  bodyLocations: [
    ['arm', 'Arm'], ['leg', 'Leg'], ['chest', 'Chest'], ['back', 'Back'],
    ['shoulder', 'Shoulder'], ['neck', 'Neck'], ['face', 'Face'], ['abdomen', 'Abdomen'],
    ['hip', 'Hip'], ['hand', 'Hand'], ['foot', 'Foot'], ['other', 'Other'],
  ],

  tcSides: [['left', 'Left'], ['right', 'Right'], ['center', 'Center']],

  tcAgeBuckets: [
    ['under_1', '< 1 year'], ['age_1_3', '1–3 years'], ['age_4_7', '4–7 years'],
    ['age_8_15', '8–15 years'], ['over_15', '> 15 years'], ['unknown', 'Unknown'],
  ],

  tcTypes: [
    ['professional', 'Professional'], ['amateur', 'Amateur'], ['cosmetic', 'Cosmetic'],
    ['coverup', 'Cover-up'], ['mixed', 'Mixed'],
  ],

  tcCoverup: [
    ['none', 'No cover-up'], ['once', 'Covered once'],
    ['multiple', 'Covered multiple times'], ['unknown', 'Unknown'],
  ],

  qualityLevel: [
    ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['very_high', 'Very high'],
  ],

  shadingLevel: [['none', 'None'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High']],

  lineworkLevel: [
    ['fine', 'Fine'], ['medium', 'Medium'], ['bold', 'Bold'], ['mixed', 'Mixed'],
  ],

  inkColors: [
    { id: 'black', color: '#1a1a1a', label: 'Black' },
    { id: 'grey', color: '#888888', label: 'Grey' },
    { id: 'red', color: '#cc2233', label: 'Red' },
    { id: 'orange', color: '#e67300', label: 'Orange' },
    { id: 'yellow', color: '#e6cc00', label: 'Yellow' },
    { id: 'green', color: '#1a8833', label: 'Green' },
    { id: 'blue', color: '#1a3366', label: 'Blue' },
    { id: 'purple', color: '#7733aa', label: 'Purple' },
    { id: 'white', color: '#f0f0f0', label: 'White' },
    { id: 'skin_tone', color: '#d4a574', label: 'Skin tone' },
  ],

  fitzpatrick: [
    { id: 'I', color: '#f5dcc3', desc: 'Very fair' },
    { id: 'II', color: '#e8c8a0', desc: 'Fair' },
    { id: 'III', color: '#c8a878', desc: 'Medium' },
    { id: 'IV', color: '#a08060', desc: 'Olive' },
    { id: 'V', color: '#6a4a30', desc: 'Brown' },
    { id: 'VI', color: '#3a2a1a', desc: 'Dark' },
    { id: 'unsicher', color: 'linear-gradient(135deg,#f5dcc3,#3a2a1a)', desc: 'Unsure' },
  ],

  riskLevel: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['unsure', 'Unsure']],

  sunExposure: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']],

  lifeSmoker: [
    ['no', 'No'], ['occasionally', 'Occasionally'],
    ['daily_light', 'Daily (light)'], ['daily_heavy', 'Daily (heavy)'],
  ],

  lifeAlcohol: [
    ['never', 'Never'], ['rarely', 'Rarely'], ['1-2x_week', '1–2×/week'],
    ['3-4x_week', '3–4×/week'], ['5+x_week', '5+×/week'],
  ],

  lifeActivity: [
    ['low', 'Low'], ['light', 'Light'], ['regular', 'Regular'], ['high', 'High'],
  ],

  lifeSleepHours: [
    ['under_5', '< 5h'], ['5-6', '5–6h'], ['6-7', '6–7h'], ['7-8', '7–8h'], ['8+', '8+h'],
  ],

  lifeSleepQuality: [
    ['poor', 'Poor'], ['fair', 'Fair'], ['good', 'Good'], ['excellent', 'Excellent'],
  ],

  lifeStress: [
    ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['very_high', 'Very high'],
  ],

  lifeHydration: [['low', 'Low'], ['normal', 'Normal'], ['good', 'Good']],

  lifeNutrition: [['poor', 'Poor'], ['fair', 'Fair'], ['good', 'Good']],

  goalTargets: [
    ['full_removal', 'Full removal', 'The tattoo should disappear completely.'],
    ['lightening_for_coverup', 'Lighten for cover-up', 'Lighten for a new tattoo on top.'],
    ['partial_fade', 'Partial fade', 'Only part should be removed or lightened.'],
  ],

  zoneDichte: [
    ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['very_high', 'Very high'],
  ],

  zoneFlaechen: [
    { value: 'xs', label: 'Very small', cm2: 3 },
    { value: 'sm', label: 'Small', cm2: 8 },
    { value: 'md', label: 'Medium', cm2: 13.5 },
    { value: 'lg', label: 'Large', cm2: 21 },
    { value: 'xl', label: 'Very large', cm2: 33 },
    { value: 'xxl', label: 'Extra large', cm2: 45 },
  ],

  photoChecklist: [
    { key: 'photo_full_visible', label: 'Full tattoo visible' },
    { key: 'photo_good_light', label: 'Good natural light' },
    { key: 'photo_focus', label: 'Sharp, not blurry' },
    { key: 'photo_distance', label: 'About 30 cm distance' },
    { key: 'photo_no_filter', label: 'No filter / no editing' },
  ],

  ui: {
    optional: '(optional)',
    yes: 'Yes',
    no: 'No',
    choose: '— select —',
    back: 'Back',
    cancel: 'Cancel',
    next: 'Next',
    save: 'Save case',
    createCase: 'Create case',
    perSession: '/ session',

    validation: {
      titleRequired: 'Please enter a title.',
      bodyRequired: 'Please select a body region.',
      ageRequired: 'Please select tattoo age.',
      typeRequired: 'Please select tattoo type.',
      priorRequired: 'Please indicate prior treatments.',
      zonesMin: 'At least 2 zones required.',
      zonesIncomplete: 'Please complete all zones.',
      colorsRequired: 'Please select at least one color.',
      propertiesRequired: 'Please complete all properties.',
      sizeRequired: 'Please enter dimensions in cm.',
      fitzRequired: 'Please select Fitzpatrick type.',
      sunRequired: 'Please select sun exposure.',
      lifestyleRequired: 'Please complete all required fields.',
      sleepRequired: 'Please enter sleep & stress info.',
      bodyMassRequired: 'Please enter body measurements.',
      hydrationRequired: 'Please enter hydration & nutrition.',
      goalRequired: 'Please select a treatment goal.',
      pricingFailed: 'Could not calculate estimate.',
      pmuTypeRequired: 'Please select a PMU type.',
      pmuAgeRequired: 'Please select PMU age.',
      pmuTechniqueRequired: 'Please select PMU technique.',
      pmuDepthRequired: 'Please select stitch depth.',
      pmuLaserRequired: 'Please indicate prior laser treatment.',
      pmuColorsRequired: 'Please select at least one color.',
      pmuColorPropsRequired: 'Please fill density, saturation, shading and linework.',
      pmuLifestyleRequired: 'Please fill all lifestyle fields.',
      pmuParadoxRequired: 'Please acknowledge the paradoxical darkening notice.',
    },

    basics: {
      caseType: 'Case type',
      pmuNotice: 'PMU wizard matches the prototype (7 steps). After save: anamnesis, leaflet and signature on the case.',
      title: 'Title *',
      titlePlaceholder: 'e.g. Left forearm script',
      pmuTitlePlaceholder: 'e.g. Left eyebrow',
      bodyRegion: 'Body region *',
      bodyHint: 'Where is the tattoo located?',
      pmuType: 'PMU type *',
      pmuSide: 'Side',
      pmuAge: 'PMU age *',
      pmuTechnique: 'PMU technique *',
      pmuPigment: 'Pigment type',
      pmuDepth: 'Stitch depth *',
      eyeAreaHint: 'Eye protection: treatments near the eyes use special lenses. Tell us if you wear contact lenses.',
      zoneMode: 'Zone mode',
      zoneHint: 'Large design across multiple areas?',
      singleTattoo: 'Single tattoo',
      splitZones: 'Split into zones',
      side: 'Side',
      tattooAge: 'Tattoo age *',
      tattooType: 'Tattoo type *',
      coverup: 'Cover-up *',
      coverupHint: 'Tattooed over an older tattoo?',
      priorTreatment: 'Prior treatments *',
      priorHint: 'Already treated with laser?',
      priorCount: 'Number of prior treatments',
      priorCountPlaceholder: 'e.g. 3',
    },

    pmu: {
      pretreatmentTitle: 'Has this PMU already been laser-treated? *',
      pretreatmentNotes: 'Notes about prior treatment',
      pretreatmentNotesPlaceholder: 'e.g. sessions, studio, timeframe…',
      colorsMulti: 'Colors *',
      colorsHint: 'Multi-select',
      colorDensity: 'Color density *',
      colorSaturation: 'Color saturation *',
      hasShading: 'Shading present? *',
      hasLinework: 'Linework present? *',
      smoking: 'Smoking *',
      smokingHint: 'Smoking slows PMU removal.',
      alcohol: 'Alcohol *',
      activity: 'Physical activity *',
      hydration: 'Hydration *',
      aftercare: 'Aftercare commitment *',
      paradoxTitle: 'Important: paradoxical darkening',
      paradoxBody: 'With certain PMU pigments (especially iron oxide), color may temporarily become DARKER after the first laser session before fading. This is a known effect, not a treatment error.',
      paradoxConfirm: 'I have read and understood this notice *',
      prognosisTitle: 'Prognosis',
      sessionsEstimated: 'Estimated sessions',
      pricePerSession: 'Price per session',
      totalCost: 'Estimated total cost',
      confirmToContinue: 'Please confirm the notice to continue',
    },

    properties: {
      zonesTitle: 'Split into zones *',
      zonesHint: 'Min. 2, max. 8 zones. Each zone is estimated separately.',
      zone: 'Zone',
      zoneLabel: 'Label *',
      zoneLabelPlaceholder: 'e.g. Outer forearm',
      bodyPart: 'Body part *',
      colors: 'Colors *',
      density: 'Density *',
      area: 'Area *',
      customArea: 'Custom (cm²)',
      areaCm2: 'Area (cm²)',
      addZone: 'Add zone',
      colorDensity: 'Color density',
      saturation: 'Saturation',
      shading: 'Shading',
      linework: 'Linework',
      dimensions: 'Dimensions in cm *',
      dimensionsHint: 'Measure with ruler — studio confirms exactly.',
      length: 'Length',
      width: 'Width',
    },

    skin: {
      fitzpatrick: 'Fitzpatrick skin type *',
      fitzHint: 'Natural skin tone without tan.',
      hyperpig: 'Hyperpigmentation risk',
      keloid: 'Keloid / scarring risk',
      sunZone: 'Sun exposure zone *',
      sunHint: 'How exposed is this area to the sun?',
    },

    lifestyle: {
      smoking: 'Smoking *',
      smokingHint: 'Smoking significantly slows removal.',
      cigarettesPerDay: 'Cigarettes per day',
      bodyMass: 'Body measurements *',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      alcohol: 'Alcohol *',
      activity: 'Activity level *',
      sleepHours: 'Sleep hours *',
      sleepQuality: 'Sleep quality *',
      stress: 'Stress level *',
      hydration: 'Hydration *',
      nutrition: 'Nutrition quality *',
    },

    goal: {
      title: 'Treatment goal *',
      notes: 'Notes',
      notesPlaceholder: 'Additional details or wishes…',
    },

    photos: {
      title: 'Initial photos (optional)',
      intro: 'Photos are stored securely on our server — no public link. You can skip this step; the customer can upload photos later in the app.',
      main: 'Main photo',
      mainHint: 'Full tattoo',
      detail: 'Detail photo',
      detailHint: 'Close-up',
      marker: 'Reference marker',
      markerHint: 'Optional',
      checklist: 'Quality checklist',
      selectPhoto: 'Select photo',
      uploading: 'Uploading…',
      uploadFailed: 'Upload failed',
      removeFailed: 'Could not remove',
      removeAria: 'Remove photo',
    },

    pricing: {
      title: 'AI tattoo analysis',
      confidence: 'Confidence',
      estimatedSessions: 'Estimated sessions',
      timeframe: 'Timeframe approx.',
      months: 'months',
      priceEstimate: 'Price estimate',
      area: 'Area',
      pricePerSession: 'Price per session',
      totalCost: 'Total cost',
      disclaimer: 'AI estimate (indicative price{confidence}). Final price confirmed in studio after exact measurement.',
      nextStep: 'Next, review the summary. After saving, you can complete anamnesis in the case detail view.',
    },

    review: {
      title: 'Summary',
      type: 'Type',
      tattoo: 'Tattoo',
      pmu: 'PMU',
      label: 'Title',
      bodyRegion: 'Body region',
      zones: 'Zones',
      zonesCount: 'zones',
      singleTattoo: 'Single tattoo',
      area: 'Area',
      age: 'Age',
      tattooStyle: 'Tattoo style',
      fitzpatrick: 'Fitzpatrick',
      goal: 'Goal',
      pricePerSession: 'Price / session',
      sessionsEstimated: 'Sessions (estimated)',
      afterSave: 'After saving, you can complete anamnesis in the case detail view and schedule treatments.',
    },
  },
}
