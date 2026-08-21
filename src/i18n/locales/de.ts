/** Elaya frontend locale (de). */
import type { TranslationSchema } from './en'

const de: TranslationSchema = {
  "common": {
    "appName": "Elaya",
    "back": "Zurück",
    "save": "Speichern",
    "cancel": "Abbrechen",
    "loading": "Laden…",
    "error": "Fehler",
    "success": "Erfolgreich",
    "email": "E-Mail",
    "password": "Passwort",
    "confirmPassword": "Passwort Bestätigen",
    "forgotPassword": "Passwort Vergessen?",
    "noAccount": "Noch kein Konto?",
    "hasAccount": "Bereits ein Konto?",
    "register": "Registrieren",
    "login": "Anmelden",
    "logout": "Abmelden",
    "required": "Dieses Feld ist erforderlich",
    "invalidEmail": "Ungültige E-Mail-Adresse",
    "passwordMismatch": "Passwörter stimmen nicht überein",
    "passwordMinLength": "Passwort muss mindestens 8 Zeichen haben",
    "serverError": "Serverfehler. Bitte versuche es später erneut.",
    "sendResetLink": "Link senden",
    "newPassword": "Neues Passwort",
    "resetPassword": "Passwort zurücksetzen",
    "backToLogin": "Zurück zur Anmeldung"
  },
  "toast": {
    "loginSuccess": "Erfolgreich angemeldet",
    "registerSuccess": "Registrierung eingereicht — warte auf Admin-Freigabe",
    "logoutSuccess": "Erfolgreich abgemeldet",
    "wrongPortal": "Dieses Konto hat keinen Zugang zu diesem Portal.",
    "serverError": "Serverfehler. Bitte versuche es später erneut.",
    "forgotPasswordSent": "Falls ein Konto existiert, erhalten Sie in Kürze eine E-Mail.",
    "resetPasswordSuccess": "Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.",
    "invalidResetToken": "Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an."
  },
  "landing": {
    "badge": "Tattoo Removal Platform",
    "tagline": "Tattooentfernung — intelligent verwaltet",
    "subtitle": "Die professionelle Plattform für Studios, Kunden und Klinik-Management.",
    "portalHeading": "Wähle deinen Bereich",
    "customerLabel": "Kunden-App",
    "customerSub": "Termine buchen, Verlauf verfolgen, Elaycoins verwalten.",
    "customerCta": "App öffnen",
    "customerBadge": "Nur mobil",
    "studioLabel": "Studio-Dashboard",
    "studioSub": "Terminverwaltung, Kundenpflege und Studio-Analytics.",
    "studioCta": "Anmelden",
    "adminLabel": "Admin",
    "adminSub": "Plattform-Verwaltung",
    "adminCta": "Admin-Zugang",
    "footer": "© {{year}} Elaya · Moro Concept Group GmbH"
  },
  "studioAuth": {
    "loginTitle": "Studio-Anmeldung",
    "loginSubtitle": "Melde dich im Studio-Dashboard an",
    "registerTitle": "Studio Registrieren",
    "registerSubtitle": "Erstelle dein Studio-Konto auf Elaya",
    "studioName": "Firmenname",
    "studioCode": "Studio-Code",
    "phone": "Telefonnummer",
    "city": "Stadt",
    "registerButton": "Studio Registrieren",
    "registerPrompt": "Noch kein Studio-Konto?",
    "loginPrompt": "Bereits ein Konto?",
    "forgotTitle": "Passwort Vergessen",
    "forgotSubtitle": "Geben Sie Ihre E-Mail ein — wir senden Ihnen einen Link zum Zurücksetzen.",
    "resetTitle": "Neues Passwort",
    "resetSubtitle": "Wählen Sie ein neues Passwort für Ihr Studio-Konto."
  },
  "adminAuth": {
    "loginTitle": "Admin-Anmeldung",
    "loginSubtitle": "Plattform-Verwaltung",
    "forgotTitle": "Passwort Vergessen",
    "forgotSubtitle": "Geben Sie Ihre Admin-E-Mail ein — wir senden Ihnen einen Link zum Zurücksetzen.",
    "resetTitle": "Neues Passwort",
    "resetSubtitle": "Wählen Sie ein neues Passwort für Ihr Admin-Konto."
  },
  "notFound": {
    "title": "404",
    "heading": "Seite nicht gefunden",
    "message": "Die angeforderte Seite existiert nicht oder wurde verschoben.",
    "homeButton": "Zur Startseite"
  },
  "studioNav": {
    "dashboard": "Dashboard",
    "appointments": "Kalender",
    "today": "Heute",
    "customers": "Kunden",
    "cases": "Alle Fälle",
    "sessions": "Sitzungen",
    "analytics": "Analytik",
    "aftercare": "Nachsorge",
    "crm": "CRM",
    "chat": "Kunden-Chat",
    "elayaChat": "Elaya Chat",
    "activity": "Verlauf",
    "shop": "Avora Shop",
    "transfers": "Studio-Wechsel",
    "elaycoins": "Elaycoins",
    "settings": "Einstellungen"
  },
  "studioActivity": {
    "title": "Terminverlauf",
    "subtitle": "Chronologisches Protokoll aller relevanten Aktionen im Studio.",
    "customerTitle": "Verlauf",
    "empty": "Keine Einträge für die gewählten Filter.",
    "emptyHint": "Buchungen, Stornierungen, medizinische Änderungen und Studio-Aktionen erscheinen hier.",
    "loadError": "Verlauf konnte nicht geladen werden.",
    "categories": {
      "all": "Alle",
      "bookings": "Termine",
      "cancellations": "Stornierungen",
      "reschedules": "Neu angesetzt",
      "no_shows": "Nicht erschienen",
      "lockouts": "Sperrfristen",
      "medical": "Medizin",
      "profile": "Profil",
      "studio": "Studio",
      "prices": "Preise",
      "sessions": "Sitzungen"
    },
    "ranges": {
      "all": "Alles",
      "h24": "24 Std",
      "h48": "48 Std",
      "d7": "7 Tage",
      "d30": "30 Tage",
      "m3": "3 Monate",
      "m6": "6 Monate",
      "custom": "Zeitraum"
    },
    "from": "Von",
    "to": "Bis"
  },
  "studioElayaChat": {
    "title": "Elaya Chat",
    "subtitle": "Deine KI-Assistentin für Medizin, Behandlung und Fälle — direkt im Studio.",
    "welcome": "Hallo! Ich bin Elaya. Frag mich zu Tattooentfernung, Haut, Sperrfristen, Quick Check oder zu einem konkreten Kundenfall.",
    "placeholder": "Frage an Elaya…",
    "send": "Senden",
    "thinking": "Elaya denkt nach…",
    "emptyHint": "Tippe eine Frage oder wähle einen Vorschlag.",
    "contextLabel": "Kontext",
    "contextNone": "Ganzes Studio",
    "contextCustomer": "Kunde",
    "contextSearch": "Kunde suchen…",
    "newChat": "Neues Gespräch",
    "openCustomer": "Zum Kunden",
    "openCase": "Zum Fall",
    "unavailable": "Elaya ist gerade nicht erreichbar. Bitte später erneut versuchen.",
    "loadError": "Antwort konnte nicht geladen werden.",
    "prompts": [
      "Welche Kontraindikationen gelten vor einer Lasersitzung?",
      "Kunde hatte Grippe — wann darf behandelt werden?",
      "Erkläre die aktuelle Sperrfrist-Logik.",
      "Worauf achten bei Fitzpatrick IV?",
      "Wie dokumentiere ich eine Sitzung in Elaya?"
    ]
  },
  "adminNav": {
    "sidebarTitle": "Plattform-Verwaltung",
    "sidebarTag": "Skin · Laser · Care",
    "contentPlaceholder": "Inhalt folgt",
    "items": [
      {
        "id": "overview",
        "icon": "📊",
        "label": "Übersicht"
      },
      {
        "id": "studios",
        "icon": "🏪",
        "label": "Studios"
      },
      {
        "id": "customers",
        "icon": "👥",
        "label": "Kunden"
      },
      {
        "id": "transfer",
        "icon": "🔄",
        "label": "Studio-Wechsel"
      },
      {
        "id": "elaycoins",
        "icon": "🪙",
        "label": "Elaycoins"
      },
      {
        "id": "finance",
        "icon": "💶",
        "label": "Finanzen"
      },
      {
        "id": "features",
        "icon": "🎛️",
        "label": "Features"
      },
      {
        "id": "ai",
        "icon": "🤖",
        "label": "Elaya KI"
      },
      {
        "id": "shop",
        "icon": "🛍️",
        "label": "ElayShop"
      },
      {
        "id": "settings",
        "icon": "⚙️",
        "label": "Einstellungen"
      }
    ]
  },
  "caseForm": {
    "caseTypes": [
      {
        "value": "tattoo",
        "label": "Tattoo-Entfernung"
      },
      {
        "value": "pmu",
        "label": "PMU-Entfernung"
      }
    ],
    "wizardSteps": [
      {
        "id": "basics",
        "code": "TC_01",
        "title": "Basics",
        "subtitle": "Grundangaben"
      },
      {
        "id": "properties",
        "code": "TC_02",
        "title": "Eigenschaften",
        "subtitle": "Farben & Grösse"
      },
      {
        "id": "skin",
        "code": "TC_03",
        "title": "Haut & Risiko",
        "subtitle": "Sicherheit"
      },
      {
        "id": "lifestyle",
        "code": "TC_04",
        "title": "Lifestyle",
        "subtitle": "Regeneration"
      },
      {
        "id": "goal",
        "code": "TC_05",
        "title": "Ziel",
        "subtitle": "Erwartung"
      },
      {
        "id": "photos",
        "code": "TC_06",
        "title": "Fotos",
        "subtitle": "Optional"
      },
      {
        "id": "pricing",
        "code": "KI",
        "title": "Analyse",
        "subtitle": "Preisschätzung"
      },
      {
        "id": "review",
        "code": "✓",
        "title": "Übersicht",
        "subtitle": "Prüfen & speichern"
      }
    ],
    "pmuWizardSteps": [
      {
        "id": "pmu-basics",
        "code": "PMU_01",
        "title": "Basics",
        "subtitle": "PMU-Angaben"
      },
      {
        "id": "pmu-pretreatment",
        "code": "PMU_02",
        "title": "Vorbehandlung",
        "subtitle": "Laser-Historie"
      },
      {
        "id": "pmu-colors",
        "code": "PMU_03",
        "title": "Farben",
        "subtitle": "Details"
      },
      {
        "id": "pmu-lifestyle",
        "code": "PMU_04",
        "title": "Lifestyle",
        "subtitle": "Regeneration"
      },
      {
        "id": "pmu-prognosis",
        "code": "PMU_05",
        "title": "Prognose",
        "subtitle": "Einwilligung"
      },
      {
        "id": "pmu-photos",
        "code": "PMU_06",
        "title": "Fotos",
        "subtitle": "Optional"
      },
      {
        "id": "pmu-review",
        "code": "✓",
        "title": "Übersicht",
        "subtitle": "Prüfen & speichern"
      }
    ],
    "pmuTypes": [
      [
        "eyebrows",
        "Augenbrauen"
      ],
      [
        "eyeliner",
        "Eyeliner"
      ],
      [
        "lips",
        "Lippen"
      ],
      [
        "microblading",
        "Microblading"
      ],
      [
        "other",
        "Andere"
      ]
    ],
    "pmuSides": [
      [
        "left",
        "Links"
      ],
      [
        "right",
        "Rechts"
      ],
      [
        "both",
        "Beide"
      ]
    ],
    "pmuAgeRanges": [
      [
        "<1",
        "< 1 Jahr"
      ],
      [
        "1-3",
        "1-3 Jahre"
      ],
      [
        "4-7",
        "4-7 Jahre"
      ],
      [
        "8-15",
        "8-15 Jahre"
      ],
      [
        ">15",
        "> 15 Jahre"
      ],
      [
        "unknown",
        "Unbekannt"
      ]
    ],
    "pmuTechniques": [
      [
        "professional",
        "Professionell"
      ],
      [
        "amateur",
        "Amateur"
      ],
      [
        "cosmetic",
        "Cosmetic Tattoo"
      ]
    ],
    "pmuPigments": [
      [
        "organic",
        "Organisch (pflanzlich)"
      ],
      [
        "inorganic",
        "Anorganisch (Eisenoxid)"
      ],
      [
        "unknown",
        "Unbekannt"
      ]
    ],
    "pmuStitchDepths": [
      [
        "surface",
        "Oberflächlich (Microblading)"
      ],
      [
        "medium",
        "Mittel (Standard PMU)"
      ],
      [
        "deep",
        "Tief (klassisches Verfahren)"
      ]
    ],
    "pmuColors": [
      "Schwarz",
      "Braun",
      "Grau",
      "Beige",
      "Rotbraun",
      "Andere"
    ],
    "pmuColorDensity": [
      [
        "light",
        "Leicht"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "intense",
        "Intensiv"
      ]
    ],
    "pmuColorSaturation": [
      [
        "faded",
        "Verblasst"
      ],
      [
        "normal",
        "Normal"
      ],
      [
        "saturated",
        "Gesättigt"
      ]
    ],
    "pmuLifeSmoker": [
      [
        "never",
        "Nie"
      ],
      [
        "occasional",
        "Gelegentlich"
      ],
      [
        "daily_light",
        "Täglich (wenig)"
      ],
      [
        "daily_heavy",
        "Täglich (stark)"
      ]
    ],
    "pmuLifeAlcohol": [
      [
        "rarely",
        "Selten"
      ],
      [
        "moderate",
        "Mässig"
      ],
      [
        "frequent",
        "Häufig"
      ]
    ],
    "pmuLifeActivity": [
      [
        "low",
        "Gering"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "high",
        "Hoch"
      ]
    ],
    "pmuLifeHydration": [
      [
        "low",
        "Wenig"
      ],
      [
        "medium",
        "Normal"
      ],
      [
        "high",
        "Viel"
      ]
    ],
    "pmuLifeAftercare": [
      [
        "low",
        "Gering"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "high",
        "Hoch"
      ]
    ],
    "bodyLocations": [
      [
        "arm",
        "Arm"
      ],
      [
        "leg",
        "Bein"
      ],
      [
        "chest",
        "Brust"
      ],
      [
        "back",
        "Rücken"
      ],
      [
        "shoulder",
        "Schulter"
      ],
      [
        "neck",
        "Hals"
      ],
      [
        "face",
        "Gesicht"
      ],
      [
        "abdomen",
        "Bauch"
      ],
      [
        "hip",
        "Hüfte"
      ],
      [
        "hand",
        "Hand"
      ],
      [
        "foot",
        "Fuss"
      ],
      [
        "other",
        "Andere"
      ]
    ],
    "tcSides": [
      [
        "left",
        "Links"
      ],
      [
        "right",
        "Rechts"
      ],
      [
        "center",
        "Mitte"
      ]
    ],
    "tcAgeBuckets": [
      [
        "under_1",
        "< 1 Jahr"
      ],
      [
        "age_1_3",
        "1–3 Jahre"
      ],
      [
        "age_4_7",
        "4–7 Jahre"
      ],
      [
        "age_8_15",
        "8–15 Jahre"
      ],
      [
        "over_15",
        "> 15 Jahre"
      ],
      [
        "unknown",
        "Unbekannt"
      ]
    ],
    "tcTypes": [
      [
        "professional",
        "Professionell"
      ],
      [
        "amateur",
        "Amateur"
      ],
      [
        "cosmetic",
        "Kosmetisch"
      ],
      [
        "coverup",
        "Cover-up"
      ],
      [
        "mixed",
        "Gemischt"
      ]
    ],
    "tcCoverup": [
      [
        "none",
        "Kein Cover-up"
      ],
      [
        "once",
        "1× überdeckt"
      ],
      [
        "multiple",
        "Mehrfach überdeckt"
      ],
      [
        "unknown",
        "Unbekannt"
      ]
    ],
    "qualityLevel": [
      [
        "low",
        "Niedrig"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "high",
        "Hoch"
      ],
      [
        "very_high",
        "Sehr hoch"
      ]
    ],
    "shadingLevel": [
      [
        "none",
        "Kein"
      ],
      [
        "low",
        "Wenig"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "high",
        "Viel"
      ]
    ],
    "lineworkLevel": [
      [
        "fine",
        "Fein"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "bold",
        "Kräftig"
      ],
      [
        "mixed",
        "Gemischt"
      ]
    ],
    "inkColors": [
      {
        "id": "black",
        "color": "#1a1a1a",
        "label": "Schwarz"
      },
      {
        "id": "grey",
        "color": "#888888",
        "label": "Grau"
      },
      {
        "id": "red",
        "color": "#cc2233",
        "label": "Rot"
      },
      {
        "id": "orange",
        "color": "#e67300",
        "label": "Orange"
      },
      {
        "id": "yellow",
        "color": "#e6cc00",
        "label": "Gelb"
      },
      {
        "id": "green",
        "color": "#1a8833",
        "label": "Grün"
      },
      {
        "id": "blue",
        "color": "#1a3366",
        "label": "Blau"
      },
      {
        "id": "purple",
        "color": "#7733aa",
        "label": "Lila"
      },
      {
        "id": "white",
        "color": "#f0f0f0",
        "label": "Weiss"
      },
      {
        "id": "skin_tone",
        "color": "#d4a574",
        "label": "Hautton"
      }
    ],
    "fitzpatrick": [
      {
        "id": "I",
        "color": "#f5dcc3",
        "desc": "Sehr hell"
      },
      {
        "id": "II",
        "color": "#e8c8a0",
        "desc": "Hell"
      },
      {
        "id": "III",
        "color": "#c8a878",
        "desc": "Mittel"
      },
      {
        "id": "IV",
        "color": "#a08060",
        "desc": "Olive"
      },
      {
        "id": "V",
        "color": "#6a4a30",
        "desc": "Braun"
      },
      {
        "id": "VI",
        "color": "#3a2a1a",
        "desc": "Dunkel"
      },
      {
        "id": "unsicher",
        "color": "linear-gradient(135deg,#f5dcc3,#3a2a1a)",
        "desc": "Unsicher"
      }
    ],
    "riskLevel": [
      [
        "low",
        "Gering"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "high",
        "Hoch"
      ],
      [
        "unsure",
        "Unsicher"
      ]
    ],
    "sunExposure": [
      [
        "low",
        "Gering"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "high",
        "Hoch"
      ]
    ],
    "lifeSmoker": [
      [
        "no",
        "Nein"
      ],
      [
        "occasionally",
        "Gelegentlich"
      ],
      [
        "daily_light",
        "Täglich leicht"
      ],
      [
        "daily_heavy",
        "Täglich stark"
      ]
    ],
    "lifeAlcohol": [
      [
        "never",
        "Nie"
      ],
      [
        "rarely",
        "Selten"
      ],
      [
        "1-2x_week",
        "1–2×/Wo"
      ],
      [
        "3-4x_week",
        "3–4×/Wo"
      ],
      [
        "5+x_week",
        "5+×/Wo"
      ]
    ],
    "lifeActivity": [
      [
        "low",
        "Wenig"
      ],
      [
        "light",
        "Leicht"
      ],
      [
        "regular",
        "Regelmässig"
      ],
      [
        "high",
        "Intensiv"
      ]
    ],
    "lifeSleepHours": [
      [
        "under_5",
        "< 5h"
      ],
      [
        "5-6",
        "5–6h"
      ],
      [
        "6-7",
        "6–7h"
      ],
      [
        "7-8",
        "7–8h"
      ],
      [
        "8+",
        "8+h"
      ]
    ],
    "lifeSleepQuality": [
      [
        "poor",
        "Schlecht"
      ],
      [
        "fair",
        "Mässig"
      ],
      [
        "good",
        "Gut"
      ],
      [
        "excellent",
        "Sehr gut"
      ]
    ],
    "lifeStress": [
      [
        "low",
        "Niedrig"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "high",
        "Hoch"
      ],
      [
        "very_high",
        "Sehr hoch"
      ]
    ],
    "lifeHydration": [
      [
        "low",
        "Wenig"
      ],
      [
        "normal",
        "Normal"
      ],
      [
        "good",
        "Gut"
      ]
    ],
    "lifeNutrition": [
      [
        "poor",
        "Unausgewogen"
      ],
      [
        "fair",
        "Mässig"
      ],
      [
        "good",
        "Gut"
      ]
    ],
    "lifeSportFreq": [
      [
        "0",
        "Kein Sport"
      ],
      [
        "1-2",
        "1–2×/Wo"
      ],
      [
        "3-4",
        "3–4×/Wo"
      ],
      [
        "5+",
        "5+×/Wo"
      ]
    ],
    "goalTargets": [
      [
        "full_removal",
        "Komplette Entfernung",
        "Das Tattoo soll vollständig verschwinden."
      ],
      [
        "lightening_for_coverup",
        "Aufhellen für Cover-Up",
        "Aufhellung für ein neues Tattoo darüber."
      ],
      [
        "partial_fade",
        "Teilweise verblassen",
        "Nur ein Teil soll entfernt oder aufgehellt werden."
      ]
    ],
    "zoneDichte": [
      [
        "low",
        "Niedrig"
      ],
      [
        "medium",
        "Mittel"
      ],
      [
        "high",
        "Hoch"
      ],
      [
        "very_high",
        "Sehr hoch"
      ]
    ],
    "zoneFlaechen": [
      {
        "value": "xs",
        "label": "Sehr klein",
        "cm2": 3
      },
      {
        "value": "sm",
        "label": "Klein",
        "cm2": 8
      },
      {
        "value": "md",
        "label": "Mittel",
        "cm2": 13.5
      },
      {
        "value": "lg",
        "label": "Gross",
        "cm2": 21
      },
      {
        "value": "xl",
        "label": "Sehr gross",
        "cm2": 33
      },
      {
        "value": "xxl",
        "label": "Extra gross",
        "cm2": 45
      }
    ],
    "photoChecklist": [
      {
        "key": "photo_full_visible",
        "label": "Ganzes Tattoo sichtbar"
      },
      {
        "key": "photo_good_light",
        "label": "Gutes natürliches Licht"
      },
      {
        "key": "photo_focus",
        "label": "Scharf und nicht verschwommen"
      },
      {
        "key": "photo_distance",
        "label": "Ca. 30 cm Abstand"
      },
      {
        "key": "photo_no_filter",
        "label": "Kein Filter / keine Bearbeitung"
      }
    ],
    "ui": {
      "optional": "(optional)",
      "yes": "Ja",
      "no": "Nein",
      "choose": "— wählen —",
      "back": "Zurück",
      "cancel": "Abbrechen",
      "next": "Weiter",
      "save": "Fall speichern",
      "createCase": "Fall anlegen",
      "perSession": "/ Sitzung",
      "validation": {
        "titleRequired": "Bitte Bezeichnung angeben.",
        "bodyRequired": "Bitte Körperregion wählen.",
        "ageRequired": "Bitte Tattoo-Alter wählen.",
        "typeRequired": "Bitte Tattoo-Typ wählen.",
        "priorRequired": "Bitte Vorbehandlungen angeben.",
        "zonesMin": "Mindestens 2 Zonen erforderlich.",
        "zonesIncomplete": "Bitte alle Zonen vollständig ausfüllen.",
        "colorsRequired": "Bitte mindestens eine Farbe wählen.",
        "propertiesRequired": "Bitte alle Eigenschaften ausfüllen.",
        "sizeRequired": "Bitte Masse in cm angeben.",
        "fitzRequired": "Bitte Fitzpatrick-Typ wählen.",
        "sunRequired": "Bitte Sonnenexposition wählen.",
        "lifestyleRequired": "Bitte alle Pflichtfelder ausfüllen.",
        "sleepRequired": "Bitte Schlaf & Stress angeben.",
        "bodyMassRequired": "Bitte Körpermasse angeben.",
        "hydrationRequired": "Bitte Hydration & Ernährung angeben.",
        "goalRequired": "Bitte Behandlungsziel wählen.",
        "pricingFailed": "Schätzung konnte nicht berechnet werden.",
        "pmuTypeRequired": "Bitte PMU-Typ wählen.",
        "pmuAgeRequired": "Bitte PMU-Alter wählen.",
        "pmuTechniqueRequired": "Bitte PMU-Technik wählen.",
        "pmuDepthRequired": "Bitte Stichtiefe wählen.",
        "pmuLaserRequired": "Bitte Vorbehandlung angeben.",
        "pmuColorsRequired": "Bitte mindestens eine Farbe wählen.",
        "pmuColorPropsRequired": "Bitte Farbdichte, Sättigung, Schattierung und Linienarbeit angeben.",
        "pmuLifestyleRequired": "Bitte alle Lifestyle-Felder ausfüllen.",
        "pmuParadoxRequired": "Bitte den Hinweis zur paradoxen Verdunkelung bestätigen."
      },
      "basics": {
        "caseType": "Fall-Typ",
        "pmuNotice": "PMU-Wizard folgt dem Prototyp (7 Schritte). Nach dem Speichern: Anamnese, Merkblatt und Unterschrift im Case.",
        "title": "Bezeichnung *",
        "titlePlaceholder": "z. B. Unterarm links Schriftzug",
        "pmuTitlePlaceholder": "z. B. Augenbrauen links",
        "bodyRegion": "Körperregion *",
        "bodyHint": "Wo befindet sich das Tattoo?",
        "pmuType": "PMU-Typ *",
        "pmuSide": "Seite",
        "pmuAge": "PMU-Alter *",
        "pmuTechnique": "PMU-Technik *",
        "pmuPigment": "Pigment-Art",
        "pmuDepth": "Stichtiefe *",
        "eyeAreaHint": "Augenschutz: Bei der Behandlung im Augenbereich werden spezielle Schutzlinsen verwendet. Bitte informiere uns falls du Kontaktlinsen trägst.",
        "zoneMode": "Zonen-Modus",
        "zoneHint": "Grosses Motiv über mehrere Bereiche?",
        "singleTattoo": "Einzelnes Tattoo",
        "splitZones": "In Zonen aufteilen",
        "side": "Seite",
        "tattooAge": "Tattoo-Alter *",
        "tattooType": "Tattoo-Typ *",
        "coverup": "Cover-Up *",
        "coverupHint": "Wurde über ein älteres Tattoo tätowiert?",
        "priorTreatment": "Vorbehandlungen *",
        "priorHint": "Bereits laser-behandelt?",
        "priorCount": "Anzahl Vorbehandlungen",
        "priorCountPlaceholder": "z. B. 3"
      },
      "pmu": {
        "pretreatmentTitle": "Wurde die PMU bereits laser-behandelt? *",
        "pretreatmentNotes": "Bemerkungen zur Vorbehandlung",
        "pretreatmentNotesPlaceholder": "z. B. Anzahl Sitzungen, Studio, Zeitraum…",
        "colorsMulti": "Farben *",
        "colorsHint": "Mehrfachauswahl",
        "colorDensity": "Farbdichte *",
        "colorSaturation": "Farbsättigung *",
        "hasShading": "Schattierung vorhanden? *",
        "hasLinework": "Linienarbeit vorhanden? *",
        "smoking": "Rauchverhalten *",
        "smokingHint": "Rauchen verlangsamt die PMU-Entfernung.",
        "alcohol": "Alkohol *",
        "activity": "Körperliche Aktivität *",
        "hydration": "Hydration *",
        "aftercare": "Nachsorge-Bereitschaft *",
        "paradoxTitle": "Wichtiger Hinweis: Paradoxe Verdunkelung",
        "paradoxBody": "Bei bestimmten PMU-Pigmenten (besonders Eisenoxid-basierte) kann die Farbe nach der ersten Laser-Behandlung vorübergehend DUNKLER werden, bevor sie verblasst. Dies ist ein bekanntes Phänomen und kein Behandlungsfehler.",
        "paradoxConfirm": "Ich habe diesen Hinweis gelesen und verstanden *",
        "prognosisTitle": "Prognose",
        "sessionsEstimated": "Geschätzte Sitzungen",
        "pricePerSession": "Preis pro Sitzung",
        "totalCost": "Geschätzte Gesamtkosten",
        "confirmToContinue": "Bitte Hinweis bestätigen um fortzufahren"
      },
      "properties": {
        "zonesTitle": "Zonen aufteilen *",
        "zonesHint": "Mind. 2, max. 8 Zonen. Jede Zone wird separat geschätzt.",
        "zone": "Zone",
        "zoneLabel": "Bezeichnung *",
        "zoneLabelPlaceholder": "z. B. Unterarm aussen",
        "bodyPart": "Körperstelle *",
        "colors": "Farben *",
        "density": "Dichte *",
        "area": "Fläche *",
        "customArea": "Eigene Angabe (cm²)",
        "areaCm2": "Fläche (cm²)",
        "addZone": "Weitere Zone",
        "colorDensity": "Farbdichte",
        "saturation": "Farbsättigung",
        "shading": "Schattierung",
        "linework": "Linienarbeit",
        "dimensions": "Masse in cm *",
        "dimensionsHint": "Mit Lineal messen — Studio misst exakt nach.",
        "length": "Länge",
        "width": "Breite"
      },
      "skin": {
        "fitzpatrick": "Fitzpatrick-Hauttyp *",
        "fitzHint": "Natürliche Hautfarbe ohne Bräune.",
        "hyperpig": "Hyperpigmentierungsrisiko",
        "keloid": "Keloid-/Narbenrisiko",
        "sunZone": "Sonnenexpositionszone *",
        "sunHint": "Wie stark ist die Stelle der Sonne ausgesetzt?"
      },
      "lifestyle": {
        "smoking": "Rauchverhalten *",
        "smokingHint": "Rauchen verlangsamt die Entfernung erheblich.",
        "cigarettesPerDay": "Zigaretten pro Tag",
        "bodyMass": "Körpermasse *",
        "height": "Grösse (cm)",
        "weight": "Gewicht (kg)",
        "alcohol": "Alkohol *",
        "activity": "Aktivitätslevel *",
        "sportFreq": "Sport pro Woche (optional)",
        "sleepHours": "Schlafstunden *",
        "sleepQuality": "Schlafqualität *",
        "stress": "Stressniveau *",
        "hydration": "Hydration *",
        "nutrition": "Ernährungsqualität *"
      },
      "goal": {
        "title": "Behandlungsziel *",
        "notes": "Anmerkungen",
        "notesPlaceholder": "Weitere Angaben oder Wünsche…"
      },
      "photos": {
        "title": "Erstfotos (optional)",
        "intro": "Fotos werden sicher auf unserem Server gespeichert — kein öffentlicher Link. Sie können diesen Schritt überspringen; der Kunde kann Fotos später in der App hochladen.",
        "main": "Hauptfoto",
        "mainHint": "Ganzes Tattoo",
        "detail": "Detailfoto",
        "detailHint": "Nahaufnahme",
        "marker": "Referenzmarker",
        "markerHint": "Optional",
        "checklist": "Qualitäts-Checkliste",
        "selectPhoto": "Foto auswählen",
        "uploading": "Wird hochgeladen…",
        "uploadFailed": "Upload fehlgeschlagen",
        "removeFailed": "Entfernen fehlgeschlagen",
        "removeAria": "Foto entfernen"
      },
      "pricing": {
        "title": "KI-Tattooanalyse",
        "confidence": "Konfidenz",
        "estimatedSessions": "Geschätzte Sitzungen",
        "timeframe": "Zeitrahmen ca.",
        "months": "Monate",
        "priceEstimate": "Preisschätzung",
        "area": "Fläche",
        "pricePerSession": "Preis pro Sitzung",
        "totalCost": "Gesamtkosten",
        "disclaimer": "KI-Schätzung (AB-Preis{confidence}). Endgültiger Preis wird im Studio nach exakter Messung bestätigt.",
        "nextStep": "Im nächsten Schritt prüfen Sie die Zusammenfassung. Nach dem Speichern können Sie die Anamnese im Fall-Detail erfassen."
      },
      "review": {
        "title": "Zusammenfassung",
        "type": "Typ",
        "tattoo": "Tattoo",
        "pmu": "PMU",
        "label": "Bezeichnung",
        "bodyRegion": "Körperregion",
        "zones": "Zonen",
        "zonesCount": "Zonen",
        "singleTattoo": "Einzelnes Tattoo",
        "area": "Fläche",
        "age": "Alter",
        "tattooStyle": "Tätowierungsart",
        "fitzpatrick": "Fitzpatrick",
        "goal": "Ziel",
        "pricePerSession": "Preis / Sitzung",
        "sessionsEstimated": "Sitzungen (geschätzt)",
        "afterSave": "Nach dem Speichern können Sie die Anamnese im Fall-Detail erfassen und Behandlungen planen."
      }
    }
  },
  "language": {
    "label": "Sprache",
    "desc": "Sprache der Studio-Oberfläche.",
    "de": "Deutsch",
    "en": "English"
  },
  "theme": {
    "title": "Darstellung",
    "desc": "Wähle das Farbschema für das Studio-Dashboard.",
    "light": "Hell",
    "dark": "Dunkel",
    "system": "System"
  },
  "settings": {
    "title": "Einstellungen",
    "subtitle": "Studio-Konfiguration und Darstellung",
    "tabs": {
      "appearance": "Darstellung",
      "profile": "Studio-Profil",
      "prices": "Preise",
      "sessionPrediction": "Sitzungsprognose",
      "hours": "Öffnungszeiten",
      "rooms": "Räume",
      "staff": "Mitarbeiter",
      "stripe": "Stripe"
    },
    "readOnly": "Nur Anzeige — Bearbeitung erfordert Studio-Admin.",
    "edit": "Bearbeiten",
    "save": "Speichern",
    "cancel": "Abbrechen",
    "saved": "Gespeichert.",
    "saveFailed": "Speichern fehlgeschlagen.",
    "loadFailed": "Konnte nicht geladen werden."
  },
  "studio": {
    "sectionStudio": "STUDIO",
    "sectionAdmin": "VERWALTUNG"
  },
  "commonUi": {
    "showMore": "Mehr anzeigen",
    "search": "Suchen…",
    "actions": "Aktionen",
    "status": "Status",
    "yes": "Ja",
    "no": "Nein",
    "delete": "Löschen",
    "confirm": "Bestätigen",
    "close": "Schliessen",
    "create": "Erstellen",
    "add": "Hinzufügen",
    "remove": "Entfernen",
    "optional": "optional",
    "required": "Pflichtfeld",
    "all": "Alle",
    "none": "Keine",
    "today": "Heute",
    "from": "Von",
    "to": "Bis",
    "open": "Geöffnet",
    "closed": "Geschlossen",
    "minutes": "Min.",
    "loading": "Laden…"
  },
  "settingsPage": {
    "shared": {
      "emptyValue": "—",
      "readOnlyHint": "Nur Studio-Administratoren können Einstellungen ändern.",
      "saveFailedFallback": "Speichern fehlgeschlagen."
    },
    "appearance": {
      "themeLightDesc": "Heller Hintergrund",
      "themeDarkDesc": "Dunkler Hintergrund",
      "themeSystemDesc": "Folgt Systemeinstellung",
      "deviceNote": "Die Einstellung wird im Browser gespeichert und gilt nur für dieses Gerät."
    },
    "profile": {
      "title": "Studio-Profil",
      "desc": "Kontakt- und Standortdaten des Studios.",
      "companyName": "Firmenname",
      "phone": "Telefon",
      "address": "Adresse",
      "notes": "Notizen",
      "street": "Strasse",
      "postalCode": "PLZ",
      "city": "Ort",
      "country": "Land",
      "defaultCountry": "Schweiz",
      "studioCode": "Studio-Code",
      "adminOnlyFieldsHint": "E-Mail, Studio-Code und Status können nur vom Elaya-Administrator geändert werden.",
      "toasts": {
        "loadFailed": "Profil konnte nicht geladen werden.",
        "saved": "Profil gespeichert."
      }
    },
    "pricing": {
      "title": "Preise & Elaycoin",
      "desc": "Studio-spezifische Preisanpassungen. Plattform-Standardwerte gelten, wenn kein Wert gesetzt ist.",
      "coinSectionTitle": "Elaycoin-Wert",
      "chfPerCoin": "CHF pro Coin",
      "platformDefault": "Plattform-Standard",
      "priceWithCurrency": "CHF {{value}}",
      "allowedRange": "Erlaubter Bereich: CHF {{min}} – CHF {{max}} · Plattform-Standard: CHF {{default}}",
      "basePricePerCm2": "Basispreis / cm²",
      "minPricePerSession": "Mindestpreis / Sitzung",
      "pmuPrice": "PMU-Preis",
      "allMultipliersPlatformDefault": "Alle Multiplikatoren (Farbe, Tiefe, Alter…) verwenden den Plattform-Standard.",
      "adjustedMultipliers": "Angepasste Multiplikatoren ({{count}})",
      "multiplierValue": "× {{value}}",
      "aiPricingHint": "Diese Werte steuern die KI-Preisberechnung und die Sitzungsschätzung für die Kunden dieses Studios.",
      "toasts": {
        "loadFailed": "Konfiguration konnte nicht geladen werden.",
        "saved": "Preise gespeichert."
      }
    },
    "sessions": {
      "title": "Sitzungsprognose",
      "desc": "Plattform-Parameter für die geschätzte Sitzungszahl. Der Live-Rechner zeigt sofort, wie sich Faktoren auf Min/Max-Sitzungen auswirken.",
      "testModeHint": "Testmodus: Parameter dürfen lokal geändert werden, um den Live-Rechner zu prüfen — Speichern kann nur die Elaya-Administration. Nach Admin-Speichern aktualisiert sich diese Ansicht live.",
      "viewOnlyHint": "Sichtbar für das Studio, nicht editierbar. Bei jeder neuen Case-Erstellung fliessen Lifestyle, Hauttyp, Farben, Cover-up und die übrigen Faktoren automatisch in Min/Max-Sitzungen ein. Updates vom Admin erscheinen live.",
      "noParameters": "Keine Parameter hinterlegt.",
      "resetToSaved": "Auf gespeicherte Werte zurücksetzen",
      "toasts": {
        "loadFailed": "Sitzungsprognose konnte nicht geladen werden.",
        "adminUpdated": "Sitzungsprognose wurde vom Admin aktualisiert"
      }
    },
    "hours": {
      "title": "Öffnungszeiten",
      "desc": "Öffnungsfenster pro Wochentag (Von–Bis). Kund:innen sehen auf dem Handy stündliche Buchungszeiten innerhalb dieses Fensters — z. B. 9:00–19:00 → 9:00, 10:00, … 18:00. Einzelne Tage (extra öffnen oder schliessen) stehen darunter.",
      "bufferLabel": "Pufferzeit",
      "bufferValue": "{{minutes}} Min.",
      "bufferInputLabel": "Pufferzeit nach Terminen (Minuten)",
      "bufferHint": "Zeit zwischen aufeinanderfolgenden Terminen.",
      "slotCountSuffix": "({{count}} Zeiten)",
      "slotPreviewTruncated": "{{first}}, {{second}}, … {{last}} ({{count}} Zeiten)",
      "weekdays": {
        "mo": "Montag",
        "di": "Dienstag",
        "mi": "Mittwoch",
        "do": "Donnerstag",
        "fr": "Freitag",
        "sa": "Samstag",
        "so": "Sonntag"
      },
      "exceptions": {
        "title": "Einzelne Tage",
        "desc": "Zusätzliche Öffnungstage oder geschlossene Tage (z. B. Feiertage) — unabhängig vom Wochenschema.",
        "empty": "Noch keine einzelnen Tage hinterlegt.",
        "openWithRange": "Geöffnet {{range}}",
        "removeDayAria": "Tag entfernen",
        "addOrOverwrite": "Tag hinzufügen oder überschreiben",
        "date": "Datum",
        "note": "Notiz",
        "notePlaceholder": "z. B. Feiertag"
      },
      "toasts": {
        "loadFailed": "Öffnungszeiten konnten nicht geladen werden.",
        "saved": "Öffnungszeiten gespeichert.",
        "exceptionsLoadFailed": "Einzelne Tage konnten nicht geladen werden.",
        "exceptionsSaved": "Verfügbare Tage gespeichert.",
        "dateRequired": "Bitte ein Datum wählen."
      }
    },
    "rooms": {
      "title": "Räume & Geräte",
      "desc": "Behandlungsräume und Laser-Geräte für Kalender und Sitzungen.",
      "empty": "Noch keine Räume angelegt.",
      "inactive": "Inaktiv",
      "colorAria": "Raumfarbe",
      "fallbackName": "Raum {{index}}",
      "removeAria": "Raum entfernen",
      "name": "Name",
      "active": "Aktiv",
      "laserBrand": "Laser-Marke",
      "laserBrandPlaceholder": "z. B. Candela",
      "laserModel": "Laser-Modell",
      "laserModelPlaceholder": "z. B. GentleMax Pro",
      "addRoom": "Raum hinzufügen",
      "toasts": {
        "loadFailed": "Räume konnten nicht geladen werden.",
        "nameRequired": "Jeder Raum braucht einen Namen.",
        "saved": "Räume gespeichert."
      }
    },
    "staff": {
      "title": "Mitarbeiter",
      "desc": "Team-Roster für Kalender und Zuordnung. Login-Einladungen folgen in einer späteren Version.",
      "empty": "Noch keine Mitarbeiter erfasst.",
      "inactive": "Inaktiv",
      "roomPrefix": "Raum: {{name}}",
      "roomsTip": "Tipp: Lege zuerst unter «Räume» mindestens einen Behandlungsraum an.",
      "fallbackName": "Mitarbeiter {{index}}",
      "removeAria": "Mitarbeiter entfernen",
      "firstName": "Vorname",
      "lastName": "Nachname",
      "role": "Rolle",
      "room": "Raum",
      "noRoom": "— Kein Raum —",
      "active": "Aktiv",
      "addStaff": "Mitarbeiter hinzufügen",
      "roles": {
        "studioOwner": "Studiobetreiber",
        "laserTherapist": "Laser-Therapeutin",
        "reception": "Empfang",
        "other": "Andere"
      },
      "toasts": {
        "loadFailed": "Mitarbeiter konnten nicht geladen werden.",
        "nameRequired": "Vor- und Nachname sind Pflichtfelder.",
        "saved": "Mitarbeiter gespeichert."
      }
    },
    "stripe": {
      "title": "Stripe Connect",
      "desc": "Verbinde dein Studio-Konto, um Shop-Provisionen ausgezahlt zu bekommen (Testmodus möglich).",
      "notConfigured": "Stripe ist auf dem Server noch nicht konfiguriert (STRIPE_SECRET_KEY fehlt).",
      "onboardingComplete": "Onboarding fertig",
      "onboardingOpen": "Onboarding offen",
      "testMode": "Testmodus",
      "accountLabel": "Account:",
      "notConnected": "— noch nicht verbunden",
      "chargesPayouts": "Charges: {{charges}} · Payouts: {{payouts}}",
      "continueOnboarding": "Onboarding fortsetzen",
      "connectWithStripe": "Mit Stripe verbinden",
      "refreshStatus": "Status aktualisieren",
      "adminOnly": "Nur Studio-Admin kann Stripe verbinden.",
      "testModeHint": "Im Stripe-Testmodus kannst du die Onboarding-Formulare mit Testdaten ausfüllen. Später werden die Live-Keys des Clients eingetragen.",
      "toasts": {
        "loadFailed": "Stripe-Status konnte nicht geladen werden",
        "statusUpdated": "Stripe-Status aktualisiert",
        "connectFailed": "Stripe Connect fehlgeschlagen"
      }
    }
  },
  "studioPages": {
    "overview": {
      "title": "Dashboard",
      "viewCustomers": "Kunden ansehen",
      "kpiActiveCustomers": "Aktive Kunden",
      "kpiTodayAppointments": "Heute Termine",
      "kpiWeekRevenue": "Umsatz diese Woche",
      "kpiOpenAftercare": "Offene Nachsorgen",
      "todayAppointments": "Heutige Termine",
      "viewAll": "Alle ansehen",
      "noAppointmentsToday": "Heute keine Termine",
      "headers": {
        "customer": "Kunde",
        "case": "Fall",
        "time": "Zeit",
        "session": "Session",
        "status": "Status"
      },
      "typeConsultation": "Beratung",
      "typeTreatment": "Behandlung",
      "studioFallback": "Studio"
    },
    "today": {
      "title": "Heute",
      "calendar": "Kalender",
      "appointments": "Termine",
      "emptyTitle": "Keine Termine heute",
      "emptyDesc": "Kunden buchen Termine über die App oder im Kalender.",
      "loadError": "Termine konnten nicht geladen werden.",
      "headers": {
        "time": "Zeit",
        "customer": "Kunde",
        "case": "Fall",
        "type": "Typ",
        "duration": "Dauer",
        "status": "Status"
      },
      "types": {
        "beratung": "Beratung",
        "treatment": "Behandlung",
        "first": "Ersttermin"
      },
      "statuses": {
        "gebucht": "Gebucht",
        "storniert": "Storniert",
        "cancelled": "Storniert",
        "completed": "Abgeschlossen"
      },
      "minutes": "{{count}} min"
    },
    "customers": {
      "title": "Kunden",
      "subtitle": "{{count}} Kunden",
      "newCustomer": "Neuer Kunde",
      "searchPlaceholder": "Name, E-Mail oder Telefon…",
      "emptyTitle": "Keine Kunden gefunden",
      "emptySearch": "Versuche eine andere Suche.",
      "emptyHint": "Lege den ersten Kunden an.",
      "loadError": "Kunden konnten nicht geladen werden.",
      "createSuccess": "Kunden erfolgreich angelegt.",
      "createError": "Fehler beim Anlegen.",
      "modalTitle": "Neuen Kunden anlegen",
      "openCases": "{{count}} offen",
      "headers": {
        "name": "Name",
        "email": "E-Mail",
        "phone": "Telefon",
        "pipeline": "Pipeline",
        "source": "Quelle",
        "cases": "Fälle"
      },
      "sources": {
        "studio_eigen": "Studio",
        "plattform_vermittelt": "Plattform",
        "studio_wechsel": "Wechsel"
      },
      "filterAll": "Alle"
    },
    "customerDetail": {
      "backToCustomers": "Alle Kunden",
      "loadError": "Kunde konnte nicht geladen werden.",
      "pipelineUpdated": "Pipeline aktualisiert.",
      "notesSaved": "Notizen gespeichert.",
      "saveError": "Fehler beim Speichern.",
      "caseCreateError": "Fehler beim Anlegen des Falls.",
      "customerUpdated": "Kundendaten aktualisiert.",
      "transferInTitle": "Kunde per Studio-Wechsel übernommen",
      "transferInBody": "Medizinische Akte und Elaycoins gehören dem Kunden und sind hier sichtbar{{prev}}{{since}}. Übertragene Fälle sind als „Transferiert“ markiert.",
      "transferInPrev": " · vorher: {{name}}",
      "transferInSince": " · seit {{date}}",
      "elaycoins": "Elaycoins: {{count}}",
      "transferOutTitle": "Dieser Kunde hat zu {{studio}} gewechselt",
      "transferOutStudioFallback": "einem anderen Studio",
      "transferOutBody": "Nur Behandlungen aus eurem Studio bleiben sichtbar · Akte ist schreibgeschützt.",
      "sinceAccount": "Seit {{date}} · Konto: {{status}}",
      "edit": "Bearbeiten",
      "labels": {
        "email": "E-Mail",
        "phone": "Telefon",
        "birthDate": "Geburtsdatum",
        "address": "Adresse",
        "lastLogin": "Letzter Login",
        "accountStatus": "Konto-Status"
      },
      "casesTitle": "Fälle",
      "newCase": "Neuer Fall",
      "noCases": "Noch keine Fälle vorhanden.",
      "caseHeaders": {
        "ampel": "Ampel",
        "caseId": "Fall-ID",
        "label": "Bezeichnung",
        "status": "Status",
        "progress": "Fortschritt",
        "lastSession": "Letzte Sitzung"
      },
      "appointmentsTitle": "Termine",
      "noAppointments": "Noch keine Termine.",
      "apptHeaders": {
        "date": "Datum",
        "time": "Zeit",
        "case": "Fall",
        "type": "Art",
        "status": "Status"
      },
      "notesTitle": "Interne Notizen",
      "notesPlaceholder": "Interne Anmerkungen…",
      "saveNotes": "Notizen speichern",
      "pipelineTitle": "Pipeline",
      "studioTimeline": "Studio-Verlauf",
      "current": "Aktuell",
      "untilToday": "bis heute",
      "newCaseModal": "Neuen Fall anlegen",
      "editModal": "Kundendaten bearbeiten",
      "activityTitle": "Verlauf",
      "transferred": "Transferiert",
      "sources": {
        "studio_eigen": "Studio",
        "plattform_vermittelt": "Plattform",
        "studio_wechsel": "Wechsel"
      },
      "firmaGrund": {
        "registrierung": "Registrierung",
        "studio_anlage": "Im Studio angelegt",
        "studio_wechsel": "Studio-Wechsel"
      },
      "caseTypes": {
        "tattoo": "Tattoo",
        "pmu": "PMU"
      },
      "apptTypes": {
        "beratung": "Beratung",
        "treatment": "Behandlung",
        "first": "Erstbehandlung"
      },
      "apptStatuses": {
        "gebucht": "Gebucht",
        "storniert": "Storniert",
        "cancelled": "Abgesagt",
        "completed": "Abgeschlossen"
      },
      "calendar": "Kalender",
      "pipelineStage": "Pipeline-Stufe",
      "saveStage": "Stufe speichern",
      "editFields": {
        "firstName": "Vorname *",
        "lastName": "Nachname *",
        "email": "E-Mail",
        "phone": "Telefon",
        "birthDate": "Geburtsdatum",
        "street": "Strasse",
        "postalCode": "PLZ",
        "city": "Ort",
        "country": "Land"
      }
    },
    "cases": {
      "title": "Alle Fälle",
      "subtitle": "{{count}} Fälle gesamt",
      "searchPlaceholder": "Fall-ID, Körperstelle, Kunde…",
      "emptyTitle": "Keine Fälle gefunden",
      "emptySearch": "Versuche einen anderen Suchbegriff.",
      "emptyHint": "Noch keine Fälle angelegt.",
      "loadError": "Fälle konnten nicht geladen werden.",
      "deleteSuccess": "Test-Fall gelöscht (Studio & Customer App synchronisiert).",
      "deleteError": "Fall konnte nicht gelöscht werden.",
      "deleteConfirm": "Test-Löschung aktiv:\nSoll {{label}} wirklich gelöscht werden?\n\nDiese Aktion entfernt den Fall auch aus der Customer App.",
      "thisCase": "diesen Fall",
      "deleting": "Löscht…",
      "deleteTest": "Test löschen",
      "deleteTitle": "Test-Fall löschen",
      "deleteTransferredTitle": "Transferierte Fälle können hier nicht gelöscht werden.",
      "transferred": "Transferiert",
      "lastSession": "Letzte: {{date}}",
      "headers": {
        "case": "Fall",
        "customer": "Kunde",
        "body": "Körperstelle",
        "type": "Typ",
        "sessions": "Sitzungen",
        "ampel": "Ampel",
        "status": "Status"
      },
      "types": {
        "tattoo": "Tattoo",
        "pmu": "PMU"
      },
      "statusFilters": {
        "all": "Alle",
        "pending": "Ausstehend",
        "active": "Aktiv",
        "completed": "Abgeschlossen",
        "loeschantrag_ausstehend": "Löschantrag pend."
      },
      "medicalFilters": {
        "all": "Alle Ampeln",
        "rot": "🔴 Abklärung",
        "orange": "🟡 Hinweise",
        "gruen": "🟢 Geklärt"
      }
    },
    "caseDetail": {
      "loadError": "Fall konnte nicht geladen werden.",
      "statusUpdated": "Status aktualisiert.",
      "saveError": "Fehler beim Speichern.",
      "backToCustomer": "Zum Kunden · {{name}}",
      "back": "Zurück",
      "transferred": "Transferiert",
      "bookAppointment": "Termin buchen",
      "newSession": "Neue Sitzung",
      "transferBannerTitle": "Fall von anderem Studio übernommen",
      "transferBannerBody": "Medizinische Historie gehört zum Kunden und ist nach dem Studio-Wechsel hier sichtbar.",
      "stats": {
        "sessions": "Sitzungen",
        "lastSession": "Letzte Sitzung",
        "calculatedPrice": "Kalkulierter Preis",
        "confirmedPrice": "Bestätigter Preis",
        "goal": "Ziel",
        "systemAi": "System / KI",
        "studio": "Studio",
        "stillOpen": "Noch offen"
      },
      "tattooSection": "Tattoo-Angaben",
      "labels": {
        "type": "Typ",
        "body": "Körperstelle",
        "tattooType": "Tätowierungsart",
        "coverup": "Cover-up",
        "size": "Größe",
        "ageYears": "Alter (Jahre)",
        "ageYearsValue": "{{years}} J.",
        "colors": "Farben",
        "yes": "Ja",
        "no": "Nein"
      },
      "sessionsTitle": "Sitzungsprotokoll",
      "pendingApptsTitle": "Gebuchte Termine — Sitzung dokumentieren",
      "documentSession": "Sitzung dokumentieren",
      "emptySessionsPending": "Noch keine Sitzung dokumentiert. Wähle oben «Sitzung dokumentieren», damit Datum, Uhrzeit und Fall übernommen werden.",
      "emptySessions": "Noch keine Sitzungen aufgezeichnet.",
      "sessionHeaders": {
        "nr": "Nr.",
        "date": "Datum",
        "fade": "Verbl. %",
        "removal": "Entf. %",
        "payment": "Zahlung",
        "status": "Status"
      },
      "zonesTitle": "Zonen",
      "zoneHeaders": {
        "id": "Zonen-ID",
        "body": "Körperstelle",
        "area": "Fläche cm²",
        "progress": "Fortschritt",
        "sessionsEst": "Sitzungen (est.)"
      },
      "statusTitle": "Status",
      "saveStatus": "Status speichern",
      "statuses": {
        "draft": "Entwurf",
        "pending": "Ausstehend",
        "active": "Aktiv",
        "completed": "Abgeschlossen",
        "loeschantrag_ausstehend": "Löschantrag pend."
      },
      "sessionStatus": {
        "noShow": "No-show",
        "draft": "Entwurf",
        "completed": "Abgeschlossen"
      },
      "internalFade": "{{pct}} intern",
      "booked": "Gebucht",
      "minutes": "{{count}} Min.",
      "caseTypes": {
        "tattoo": "Tattoo",
        "pmu": "PMU"
      },
      "tcTypes": {
        "amateur": "Amateur",
        "cosmetic": "Kosmetisch",
        "professional": "Professionell",
        "coverup": "Cover-up"
      },
      "goals": {
        "full_removal": "Vollständige Entfernung",
        "full": "Vollständige Entfernung",
        "partial_fade": "Teilweises Aufhellen",
        "lightening_for_coverup": "Aufhellen für Cover-up"
      },
      "coverup": {
        "none": "Kein Cover-up",
        "once": "1× überdeckt",
        "multiple": "Mehrfach überdeckt",
        "unknown": "Unbekannt"
      },
      "apptTypes": {
        "beratung": "Beratung",
        "treatment": "Behandlung",
        "first": "Erstbehandlung"
      },
      "estimateRequired": "Preis und Sitzungsbereich sind erforderlich.",
      "estimateSaveFailed": "Speichern fehlgeschlagen.",
      "adjustEstimateTitle": "Schätzung anpassen",
      "customerNotePlaceholder": "Notiz an den Kunden (optional)…",
      "estimatePanel": {
        "title": "KI-Kalkulation & Bestätigung",
        "statusOffen": "KI-Schätzung — noch nicht bestätigt",
        "statusBestaetigt": "Vom Studio bestätigt",
        "statusAngepasst": "Vom Studio angepasst",
        "calculatedPrice": "Kalkulierter Preis (System)",
        "confirmedPrice": "Bestätigter Studio-Preis",
        "notConfirmed": "Noch nicht bestätigt",
        "sessionRange": "Sitzungsbereich",
        "sessionsValue": "{{min}}–{{max}} Sitzungen",
        "calculatedSessions": "Kalkulierte Sitzungen",
        "totalCost": "Gesamtkosten (min–max)",
        "note": "Notiz",
        "reviewTitle": "Studio-Review empfohlen",
        "reviewBody": "Die Kalkulation lief mit unvollständigen oder unsicheren Angaben. Bitte bestätigen oder anpassen.",
        "transparency": "Der kalkulierte Preis bleibt sichtbar. Nach Bestätigung oder Anpassung gilt der Studio-Preis für den Kunden — beide Werte bleiben transparent.",
        "confirm": "Schätzung bestätigen",
        "adjust": "Anpassen…",
        "reopen": "Neu öffnen",
        "pricePerSession": "Preis pro Sitzung (CHF)",
        "sessionsMin": "Sitzungen min.",
        "sessionsMax": "Sitzungen max.",
        "customerNoteLabel": "Notiz an den Kunden (optional)",
        "cancel": "Abbrechen",
        "saveAdjustment": "Anpassung speichern",
        "toastConfirmed": "Bestätigung gespeichert",
        "toastAdjusted": "Anpassung gespeichert",
        "toastReopened": "Schätzung neu geöffnet",
        "toastChatNotified": "{{message}} — Kunde wurde im Chat benachrichtigt"
      },
      "reviewTriggers": {
        "missing_size": "Grösse unvollständig",
        "missing_colors": "Farben fehlen",
        "missing_fitzpatrick": "Hauttyp unklar",
        "missing_location": "Körperstelle unklar",
        "missing_age": "Tattoalter fehlt",
        "missing_intake_photo": "Kein Initialfoto",
        "photo_full_visible": "Tattoo nicht vollständig sichtbar",
        "photo_good_light": "Beleuchtung unzureichend",
        "photo_focus": "Foto unscharf",
        "photo_distance": "Abstand ungeeignet",
        "photo_no_filter": "Filter verdächtig",
        "sit_scarring": "Narbengewebe / Vernarbung",
        "sit_coverup": "Cover-up-Komplexität",
        "sit_multicolour": "Mehrfarbiges Tattoo",
        "sit_large_area": "Grosse Fläche"
      }
    },
    "appointments": {
      "title": "Termine",
      "weekSubtitle": "KW {{week}} · {{count}} Termin{{plural}} diese Woche · Klick auf einen Tag, um Verfügbarkeit zu ändern",
      "pluralSuffix": "e",
      "today": "Heute",
      "groupAppointment": "Gruppen-Termin",
      "newAppointment": "Neuer Termin",
      "loadError": "Termine konnten nicht geladen werden.",
      "bookSuccess": "Termin erfolgreich gebucht.",
      "bookError": "Fehler beim Buchen.",
      "bookNotAllowed": "Termin nicht erlaubt.",
      "earliest": "Frühestens: {{date}}.",
      "tooEarly": "Termin zu früh. Frühestens buchbar ab {{date}}.",
      "requiredFields": "Fall, Datum und Uhrzeit sind Pflichtfelder.",
      "modalTitle": "Neuen Termin buchen",
      "availabilitySaved": "Verfügbarkeit gespeichert.",
      "saveFailed": "Speichern fehlgeschlagen.",
      "dayAvailabilityTitle": "Tages-Verfügbarkeit",
      "editDayAvailability": "Verfügbarkeit dieses Tages bearbeiten",
      "modes": {
        "weekly": "Wochenschema verwenden",
        "open": "Extra öffnen / abweichende Zeiten",
        "closed": "Diesen Tag schliessen"
      },
      "note": "Notiz",
      "noteOptional": "optional",
      "noteHoliday": "z. B. Feiertag",
      "types": {
        "beratung": "Beratung",
        "treatment": "Behandlung",
        "first": "Erstbehandlung"
      },
      "groupLabel": "Gruppen ({{count}})",
      "months": [
        "Jan",
        "Feb",
        "März",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez"
      ],
      "daysShort": [
        "Mo",
        "Di",
        "Mi",
        "Do",
        "Fr",
        "Sa",
        "So"
      ],
      "selectCustomer": "Kunden auswählen…",
      "selectCustomerFirst": "Zuerst Kunden auswählen…",
      "selectCase": "Fall auswählen…",
      "availabilityLoadError": "Verfügbarkeit konnte nicht geladen werden.",
      "earliestPrefix": "Frühestens:",
      "dateRequired": "Datum *",
      "timeRequired": "Uhrzeit *",
      "type": "Typ",
      "durationMin": "Dauer (Min.)",
      "consultationExempt": "Beratungstermine sind von Behandlungs-Sperrfristen ausgenommen.",
      "book": "Buchen",
      "save": "Speichern",
      "customer": "Kunde *",
      "case": "Fall *"
    },
    "aftercare": {
      "title": "Nachsorge",
      "subtitle": "KI-Nachsorge-Checks deiner Kunden — Heilungsverlauf und Auffälligkeiten",
      "loadError": "Nachsorge-Checks konnten nicht geladen werden.",
      "reviewSaved": "Studio-Review gespeichert",
      "reviewError": "Review konnte nicht gespeichert werden.",
      "emptyAll": "Noch keine Nachsorge-Checks vorhanden.",
      "emptyFilter": "Keine Nachsorge-Checks mit diesem Filter.",
      "photoAlt": "Nachsorge-Foto",
      "days": "{{count}} Tage",
      "daysAfterSession": "{{count}} Tage nach Sitzung",
      "contactRecommended": "Kontakt empfohlen",
      "studioContactRecommended": "Studio-Kontakt empfohlen",
      "modalFallbackTitle": "Nachsorge-Check",
      "toCase": "Zum Fall",
      "close": "Schliessen",
      "headers": {
        "date": "Datum",
        "customer": "Kunde",
        "case": "Fall",
        "ampel": "Ampel",
        "title": "Titel",
        "daysAfter": "Tage n. Sitzung",
        "contact": "Kontakt"
      },
      "filters": {
        "alle": "Alle",
        "rot": "Rot",
        "orange": "Orange",
        "gruen": "Grün"
      },
      "ampel": {
        "gruen": "Grün",
        "orange": "Orange",
        "rot": "Rot"
      },
      "healingStatus": {
        "normal": "Normal",
        "monitor": "Beobachten",
        "delayed": "Verzögert",
        "conspicuous": "Auffällig"
      },
      "healingPhase": {
        "early": "Tag 1–7 · Frühphase",
        "healing": "Tag 8–21 · Heilungsphase",
        "consolidation": "Tag >21 · Konsolidierung",
        "unknown": "Zeitfenster unbekannt"
      },
      "healingAction": {
        "continue_aftercare": "Nachsorge fortsetzen",
        "continue_monitoring": "Weiter beobachten",
        "photo_again": "Neues Foto empfehlen",
        "check_studio": "Studio prüfen / Kontakt"
      },
      "symptoms": {
        "erythema_level": "Rötung",
        "swelling_level": "Schwellung",
        "blistering_flag": "Blasen",
        "crusting_level": "Krusten",
        "pain_score": "Schmerz",
        "itching_level": "Juckreiz",
        "hyperpigmentation_level": "Hyperpigmentierung",
        "hypopigmentation_level": "Hypopigmentierung",
        "infection_suspected": "Infektionsverdacht",
        "oozing": "Nässen / offene Stelle",
        "warmth": "Wärme"
      },
      "reviewTitle": "Studio-Review (bestätigen oder korrigieren)",
      "autoAssessment": "Automatische Einschätzung — bitte prüfen.",
      "lastReviewed": "Zuletzt geprüft {{date}}",
      "systemStatus": " · System: {{status}}",
      "healingStatusLabel": "Heilungsstatus",
      "notesPlaceholder": "Interne Studio-Notiz…",
      "confirmAssessment": "Einschätzung bestätigen",
      "correct": "Korrigieren",
      "customerText": "Kundentext (keine Diagnose)",
      "recommendedAction": "Empfohlene Aktion",
      "progressScore": " · Progress-Score {{score}}",
      "courseCustomer": "Verlauf (Kunde)",
      "summary": "Zusammenfassung",
      "redFlags": "Red flags",
      "yes": "Ja",
      "reviewRecommended": " · Studio-Review empfohlen",
      "structuredSymptoms": "Strukturierte Symptome",
      "reportedSymptoms": "Gemeldete Symptome",
      "recommendations": "Empfehlungen",
      "photo": "Foto",
      "photoFindings": "Foto-Befund (KI)"
    },
    "chat": {
      "title": "Kunden-Chat",
      "subtitle": "Direktnachrichten mit Kundinnen und Kunden",
      "customerFallback": "Kunde",
      "inboxLoadError": "Chat-Inbox konnte nicht geladen werden",
      "openError": "Chat konnte nicht geöffnet werden",
      "messagesLoadError": "Nachrichten konnten nicht geladen werden",
      "sendFailed": "Senden fehlgeschlagen",
      "liveSecure": "Sicher · Live",
      "live": "Live",
      "connecting": "Verbinden…",
      "conversations": "Unterhaltungen",
      "emptyInboxTitle": "Noch keine Chats",
      "emptyInboxDesc": "Öffne einen Kunden und starte eine Nachricht.",
      "toCustomers": "Zu den Kunden →",
      "noMessagesYet": "Noch keine Nachrichten",
      "selectTitle": "Unterhaltung wählen",
      "selectDesc": "Wähle links einen Chat oder starte einen vom Kundenprofil.",
      "customerTyping": "Kunde tippt…",
      "liveChat": "Live-Chat",
      "writeFirst": "Schreib die erste Nachricht.",
      "placeholder": "Nachricht schreiben…",
      "sendAria": "Senden"
    },
    "sessions": {
      "title": "Sitzungen",
      "subtitle": "{{count}} Sitzungen gesamt",
      "loadError": "Sitzungen konnten nicht geladen werden.",
      "searchPlaceholder": "Kunde, Fall-ID, Sitzungs-Nr…",
      "emptyTitle": "Keine Sitzungen gefunden",
      "emptySearch": "Versuche einen anderen Suchbegriff.",
      "emptyHint": "Noch keine Sitzungen dokumentiert.",
      "filters": {
        "all": "Alle",
        "completed": "Abgeschlossen",
        "drafts": "Entwürfe"
      },
      "headers": {
        "nr": "Nr.",
        "date": "Datum",
        "customer": "Kunde",
        "case": "Fall",
        "fade": "Verbl. %",
        "payment": "Zahlung",
        "status": "Status"
      },
      "status": {
        "noShow": "No-Show",
        "draft": "Entwurf",
        "completed": "Abgeschlossen"
      }
    },
    "sessionDetail": {
      "loadError": "Sitzung konnte nicht geladen werden.",
      "finalizeSuccess": "Sitzung erfolgreich abgeschlossen.",
      "finalizeError": "Fehler beim Finalisieren.",
      "title": "Sitzung #{{number}}",
      "finalize": "Sitzung abschliessen",
      "draftBadge": "Entwurf",
      "noShowBadge": "No-Show",
      "photoTitle": "Fortschritts-Foto",
      "photoEmpty": "Noch kein Fortschritts-Foto vorhanden.",
      "photoUpload": "Foto hochladen",
      "photoSaved": "Fortschritts-Foto gespeichert.",
      "photoError": "Foto konnte nicht hochgeladen werden.",
      "lighteningTitle": "Verblassungslogik (Studio)",
      "lighteningSaved": "Lightening-Review gespeichert.",
      "lighteningSaveError": "Speichern fehlgeschlagen.",
      "saveReview": "Review speichern",
      "comparisonPossible": "Vergleich möglich",
      "uncertainty": "Unsicherheit",
      "direction": "Richtung",
      "confidence": "Konfidenz",
      "customerValue": "Kundenwert",
      "internalEstimate": "Interne Schätzung",
      "lighteningScore": "Lightening-Score",
      "humanReview": "Human Review",
      "yes": "ja",
      "no": "nein",
      "notShown": "nicht angezeigt",
      "flagQuality": "Bildqualität ausreichend",
      "flagAngle": "Ähnlicher Winkel",
      "flagDistance": "Ähnliche Distanz / Ausschnitt",
      "flagLight": "Vergleichbares Licht",
      "optional": "optional",
      "studioOverridePct": "Studio-Override %",
      "studioNote": "Studio-Notiz",
      "aiTitle": "KI-Verblassungsanalyse",
      "aiSaved": "KI-Verblassungsanalyse gespeichert.",
      "aiError": "KI-Analyse fehlgeschlagen.",
      "runAi": "KI-Analyse starten",
      "fadeCustomer": "Verblassung (kundenvisible)",
      "fadeInternal": "Verblassung intern (Studio)",
      "progressDirection": "Fortschrittsrichtung",
      "assessment": "Beurteilung",
      "progress": "Fortschritt",
      "recCustomer": "Empfehlung Kunde",
      "recStudio": "Empfehlung Studio",
      "lifestyleTips": "Lifestyle-Tipps",
      "general": "Allgemein",
      "date": "Datum",
      "time": "Uhrzeit",
      "durationMin": "Dauer (Min.)",
      "minutes": "{{count}} Min.",
      "sessionId": "Sitzungs-ID",
      "staff": "Mitarbeiter",
      "room": "Raum",
      "laserParams": "Laser-Parameter",
      "brand": "Marke",
      "model": "Modell",
      "laserType": "Laser-Typ",
      "wavelengths": "Wellenlängen",
      "fluence": "Fluence J/cm²",
      "spotSize": "Spot-Größe",
      "frequency": "Frequenz",
      "passes": "Passes",
      "outcome": "Behandlungsergebnis",
      "removal": "Entfernung",
      "painScale": "Schmerzskala",
      "endpoint": "Endpoint-Reaktion",
      "payment": "Zahlung",
      "amount": "Betrag",
      "method": "Methode",
      "discount": "Rabatt",
      "meta": "Meta",
      "createdAt": "Erstellt am",
      "directions": {
        "improving": "Verbesserung",
        "stable": "Stabil",
        "worsening": "Verschlechterung",
        "unclear": "Unklar"
      },
      "payments": {
        "bar": "Bar",
        "karte": "Karte",
        "twint": "TWINT",
        "rechnung": "Rechnung"
      },
      "photoAlt": "Fortschritts-Foto",
      "photoReplace": "Foto ersetzen",
      "lighteningHint": "Kunden sehen einen Prozentwert nur bei einem vergleichbaren Bildpaar (Vergleich möglich = ja). Interne Schätzung und Unsicherheit bleiben studio-intern.",
      "reasons": "Gründe: {{list}}",
      "photoComparability": "Foto-Vergleichbarkeit",
      "studioCorrectionPct": "Studio-Korrektur %",
      "reviewNote": "Review-Notiz",
      "saveComparisonReview": "Vergleich & Review speichern",
      "aiFirstSession": "Bei der ersten Sitzung gibt es noch kein Behandlungsfoto zum Vergleich. Das Vorher-Foto wird gespeichert und ab Sitzung 2 für die KI-Analyse verwendet.",
      "aiNoneYet": "Noch keine Analyse durchgeführt.",
      "aiUploadFirst": " Lade zuerst ein Fortschritts-Foto hoch.",
      "noReliableComparison": "Kein zuverlässiger Vergleich",
      "customersNoSafePct": "Kunden sehen keinen sicheren Verblassungs-Prozentwert.",
      "internalEstimatePct": " Interne Schätzung: {{pct}}%.",
      "uncertaintyValue": " Unsicherheit: {{level}}.",
      "reasonsInline": " Gründe: {{list}}.",
      "importantNote": "Wichtiger Hinweis",
      "analyzedAt": "Analysiert am {{date}}",
      "minutesShort": "{{count}} Min.",
      "noShowBanner": "Kunde ist nicht erschienen (No-Show)",
      "coolingUsed": "Kühlung wurde verwendet",
      "adverseEvent": "Unerwünschtes Ereignis",
      "notes": "Notizen",
      "details": "Details"
    },
    "newSession": {
      "noCase": "Kein Fall ausgewählt.",
      "caseLoadError": "Fall konnte nicht geladen werden.",
      "apptWrongCase": "Dieser Termin gehört nicht zu diesem Fall.",
      "apptLoadError": "Termin konnte nicht geladen werden. Bitte Datum und Uhrzeit prüfen.",
      "dateRequired": "Behandlungsdatum ist erforderlich.",
      "photoUploading": "Foto wird hochgeladen…",
      "photoFailed": "Sitzung gespeichert, aber das Foto konnte nicht hochgeladen werden.",
      "aiAnalyzing": "KI analysiert…",
      "aiSaved": "Sitzung abgeschlossen — KI-Verblassungsanalyse gespeichert.",
      "aiFailed": "Sitzung gespeichert, aber die KI-Analyse ist fehlgeschlagen.",
      "draftWithPhoto": "Entwurf mit Foto gespeichert.",
      "draftSaved": "Entwurf gespeichert.",
      "sessionDone": "Sitzung erfolgreich abgeschlossen.",
      "saveError": "Fehler beim Speichern.",
      "caseFallback": "Fall",
      "fromAppointment": " · vom Termin übernommen",
      "title": "Sitzung #{{number}}",
      "backToCase": "Zum Fall",
      "cancel": "Abbrechen",
      "saveDraft": "Als Entwurf speichern",
      "complete": "Sitzung abschliessen",
      "selectOption": "— Auswählen —",
      "linkedApptHint": "Datum, Uhrzeit und Fall stammen vom gebuchten Termin{{when}}. Laserparameter bitte ergänzen.",
      "linkedAppt": "Mit Termin verknüpft{{when}}.",
      "general": "Allgemein",
      "dateRequiredLabel": "Datum *",
      "time": "Uhrzeit",
      "durationMin": "Dauer (Min.)",
      "staff": "Mitarbeiter",
      "staffPh": "Dr. Muster",
      "room": "Raum",
      "roomPh": "Raum 1",
      "noShow": "No-Show",
      "noShowHint": "Kunde ist zum Termin nicht erschienen",
      "laserParams": "Laser-Parameter",
      "brand": "Marke",
      "model": "Modell",
      "laserType": "Laser-Typ",
      "wavelengths": "Wellenlängen (nm)",
      "wavelengthsHint": "Kommagetrennt",
      "fluence": "Fluence J/cm²",
      "spotMm": "Spot (mm)",
      "freqHz": "Frequenz (Hz)",
      "passes": "Passes",
      "cooling": "Kühlung verwendet",
      "outcome": "Behandlungsergebnis",
      "fadeStudio": "Verblassung (Studio-Schätzung)",
      "removal": "Entfernung",
      "painScale": "Schmerzskala",
      "endpoint": "Endpoint-Reaktion",
      "endpointPh": "Frosting, Rötung, Schwellung…",
      "adverse": "Unerwünschtes Ereignis",
      "adverseHint": "Komplikation oder unerwartete Reaktion aufgetreten",
      "adverseType": "Art des Ereignisses",
      "adverseTypePh": "Blasenbildung, Hyperpigmentierung…",
      "photoTitle": "Fortschritts-Foto",
      "photoAlt": "Fortschritts-Foto",
      "photoRemoveAria": "Foto entfernen",
      "photoSelect": "Foto auswählen",
      "photoHintNext": "Aktuelles Foto der behandelten Stelle — Grundlage für die KI-Verblassungsanalyse im Vergleich zur vorherigen Sitzung.",
      "photoHintFirst": "Vorher-Foto der behandelten Stelle. Bitte immer vor der ersten Behandlung speichern — ab der zweiten Sitzung wird es für den Fortschrittsvergleich benötigt. Eine KI-Analyse gibt es bei der ersten Sitzung nicht.",
      "aiAuto": "KI-Verblassungsanalyse automatisch starten",
      "aiAutoHint": "Vergleicht dieses Foto mit dem Foto der vorherigen Sitzung (nicht bei Entwürfen)",
      "payment": "Zahlung",
      "amountChf": "Betrag (CHF)",
      "paymentMethod": "Zahlungsart",
      "none": "—",
      "cash": "Bar",
      "card": "Karte",
      "twint": "TWINT",
      "discountChf": "Rabatt (CHF)",
      "notes": "Notizen",
      "specialNotes": "Besondere Hinweise",
      "notesPh": "Interne Anmerkungen zur Sitzung…"
    },
    "shop": {
      "title": "ElayShop",
      "subtitle": "Bestellungen deiner Kunden · Versandstatus & Provisionsauszahlung",
      "loadForbidden": "Keine Berechtigung — bitte als Studio abmelden und erneut anmelden.",
      "loadError": "Bestellungen konnten nicht geladen werden.",
      "statusUpdated": "Status aktualisiert.",
      "statusError": "Status konnte nicht gespeichert werden.",
      "emptyTitle": "Keine Shop-Bestellungen",
      "emptyDesc": "Bestellungen erscheinen hier, sobald Kunden im ElayShop einkaufen. Dev: npm run seed:shop",
      "kpiOrders": "Bestellungen",
      "kpiRevenue": "Umsatz",
      "kpiProvOpen": "Provision offen",
      "kpiProvPaid": "Provision ausgezahlt",
      "headers": {
        "date": "Datum",
        "customer": "Kunde",
        "products": "Produkte",
        "amount": "Betrag",
        "prov": "Prov.",
        "payout": "Auszahlung",
        "status": "Status"
      },
      "status": {
        "bestellt": "Bestellt",
        "versendet": "Versendet",
        "geliefert": "Geliefert"
      },
      "commission": {
        "paid": "Ausgezahlt",
        "cancelled": "Storniert",
        "open": "Offen"
      },
      "detailsTitle": "Bestellung {{number}}",
      "detailsFallback": "Bestelldetails",
      "labelDate": "Datum",
      "labelStatus": "Status",
      "labelCustomer": "Kunde",
      "labelPayment": "Zahlung",
      "simulated": "(simuliert)",
      "products": "Produkte",
      "noProducts": "Keine Produkte",
      "goodsValue": "Warenwert",
      "shipping": "Versand ({{country}})",
      "gross": "Brutto",
      "provision": "Provision ({{pct}}%)",
      "payout": "Auszahlung",
      "shippingAddress": "Lieferadresse",
      "showDetails": "Details anzeigen",
      "footerHint": "Nur der Versandstatus ist editierbar. Betrag und Provision sind schreibgeschützt. Produktnamen antippen für Bestelldetails."
    },
    "transfers": {
      "title": "Studio-Wechsel",
      "subtitle": "Eingehende und ausgehende Wechselanfragen — Genehmigung durch Elaya",
      "loadError": "Wechselanfragen konnten nicht geladen werden.",
      "info": "Wechselanfragen werden von <strong>Elaya Plattform-Admin</strong> geprüft und genehmigt (Handoff §10.15). Studios können Anfragen einsehen, aber nicht selbst annehmen. <strong>Eingehend</strong> = Kunde wechselt zu euch · <strong>Ausgehend</strong> = Kunde verlässt euer Studio. Nach Genehmigung erscheint der Kunde beim Ziel-Studio inkl. medizinischer Akte und Elaycoins. <strong>Beitritt</strong> = Kunde trat beim Quell-Studio ein · <strong>Wechsel</strong> = von Elaya genehmigt.",
      "filters": {
        "open": "Offen",
        "approved": "Genehmigt",
        "rejected": "Abgelehnt",
        "all": "Alle"
      },
      "emptyTitle": "Keine Wechselanfragen",
      "emptyDesc": "Eingehende Anfragen (Kunden zu euch) und ausgehende Anfragen (Kunden verlassen euch) erscheinen hier.",
      "headers": {
        "request": "Anfrage",
        "joined": "Beitritt",
        "transfer": "Wechsel",
        "direction": "Richtung",
        "customer": "Kunde",
        "fromStudio": "Von Studio",
        "toStudio": "Zu Studio",
        "status": "Status"
      },
      "status": {
        "ausstehend": "Ausstehend (Elaya)",
        "genehmigt": "Genehmigt",
        "abgelehnt": "Abgelehnt"
      },
      "direction": {
        "eingehend": "Eingehend",
        "ausgehend": "Ausgehend"
      }
    },
    "elaycoins": {
      "title": "Elaycoins",
      "subtitle": "Coin-Guthaben, Gutschriften und Einlösungen deiner Kunden",
      "loadError": "Elaycoins konnten nicht geladen werden.",
      "kpiTotal": "Coins gesamt",
      "kpiWithBalance": "Kunden mit Guthaben",
      "kpiCredited": "Gutgeschrieben (Seite)",
      "kpiRedeemed": "Eingelöst (Seite)",
      "emptyTitle": "Keine Kunden",
      "emptyDesc": "Lege Kunden an, um Coin-Konten zu sehen.",
      "headers": {
        "customer": "Kunde",
        "email": "E-Mail",
        "source": "Quelle",
        "balance": "Guthaben",
        "credited": "Gutgeschrieben",
        "redeemed": "Eingelöst"
      },
      "sources": {
        "studio_eigen": "Studio",
        "plattform_vermittelt": "Plattform",
        "studio_wechsel": "Wechsel"
      },
      "txTitle": "Letzte Transaktionen",
      "footerHint": "Studios vergeben Coins über Behandlungen und Termine. Manuelle Korrekturen nur durch Plattform-Admin. Stripe-Auszahlung der Shop-Provision folgt, sobald die Kontodaten vorliegen."
    },
    "analytics": {
      "title": "Analytik",
      "subtitle": "Umsatz, Sitzungen & Kunden",
      "periods": {
        "month": "Dieser Monat",
        "quarter": "Quartal",
        "year": "Dieses Jahr",
        "all": "Gesamt"
      },
      "kpiRevenue": "Umsatz",
      "kpiSessionsDone": "Sitzungen abgeschlossen",
      "kpiAvgPerSession": "Ø {{amount}} / Sitzung",
      "kpiNoShows": "No-Shows",
      "kpiNoShowRate": "{{pct}} Rate",
      "kpiCancelled": "Stornierte Termine",
      "kpiCancelledOf": "{{pct}} von {{total}}",
      "chartRevenueTitle": "Umsatz – letzte 6 Monate",
      "chartRevenueSub": "Abgeschlossene Sitzungen",
      "activeCustomers": "Aktive Kunden",
      "noCustomers": "Keine Kunden vorhanden",
      "sessionsOverview": "Sitzungen – Übersicht",
      "statDone": "Abgeschlossen",
      "statNoShow": "No-Show",
      "statAvgRevenue": "Ø Umsatz",
      "statApptsTotal": "Termine gesamt",
      "revenueBySource": "Umsatz nach Herkunft",
      "revenueBySourceSub": "Behandlungsumsatz ohne No-Shows",
      "totalTreatmentRevenue": "Gesamt-Behandlungsumsatz",
      "sessionCount": "{{count}} Sitzung(en)",
      "feeLine": " · {{pct}}% Gebühr: {{amount}}",
      "akquise": {
        "studio_eigen": "Studio-Eigen",
        "plattform_vermittelt": "Plattform",
        "studio_wechsel": "Wechsel"
      },
      "shopProvision": "Shop-Provision",
      "shopProvisionSub": "{{pct}}% auf ElayShop-Käufe",
      "orders": "Bestellungen",
      "shopRevenue": "Shop-Umsatz",
      "provision": "Provision",
      "elaycoins": "Elaycoins",
      "elaycoinsSub": "Übersicht im gewählten Zeitraum",
      "coinsTotal": "Coins gesamt (Studio)",
      "customersWithBalance": "Kunden mit Guthaben",
      "rewardedInPeriod": "Vergeben im Zeitraum",
      "nettoTitle": "Netto-Übersicht (ca.)",
      "nettoSub": "Grobe Rechnung für den gewählten Zeitraum",
      "treatmentRevenue": "Behandlungsumsatz",
      "platformFee": "− Plattform-Gebühr ({{pct}}%)",
      "plusShopProvision": "+ Shop-Provision",
      "nettoApprox": "Netto (ca.)"
    },
    "crm": {
      "title": "Lead-Pipeline",
      "subtitle": "{{count}} Kunden · Stufen werden automatisch berechnet",
      "tabPipeline": "Pipeline",
      "tabList": "Liste",
      "tabTasks": "Aufgaben",
      "searchPlaceholder": "Name, E-Mail oder Telefon…",
      "pipelineLoadError": "Pipeline konnte nicht geladen werden.",
      "tasksLoadError": "Aufgaben konnten nicht geladen werden.",
      "noTemplate": "Keine Vorlage für diese Stufe.",
      "templateCopied": "Nachricht in Zwischenablage kopiert.",
      "templateError": "Vorlage konnte nicht geladen werden.",
      "emptyTitle": "Keine Kunden in der Pipeline",
      "emptyDesc": "Lege Kunden an — sie erscheinen automatisch in der passenden Stufe.",
      "noCustomers": "Keine Kunden",
      "showMore": "+ {{count}} weitere anzeigen",
      "noHits": "Keine Treffer.",
      "copyMessage": "Nachricht kopieren",
      "copyTemplate": "Vorlage kopieren",
      "note": "Notiz",
      "task": "Aufgabe",
      "template": "Vorlage",
      "todayInStage": "Heute in Stufe",
      "daysInStage": "{{count}} T. in Stufe",
      "openCases": "{{count}} offen",
      "headers": {
        "name": "Name",
        "email": "E-Mail",
        "ampel": "Ampel",
        "stage": "Stufe",
        "inStage": "In Stufe",
        "lastContact": "Letzter Kontakt",
        "nextTask": "Nächste Aufgabe"
      },
      "sources": {
        "studio_eigen": "Studio",
        "plattform_vermittelt": "Plattform",
        "studio_wechsel": "Wechsel"
      }
    },
  },
  "adminPages": {
    "dashboard": {
      "title": "Admin Dashboard"
    },
    "studios": {
      "title": "Studios",
      "subtitle": "Freigabe / Sperre · Paketverwaltung unter Features",
      "empty": "Keine Studios",
      "loadError": "Studios konnten nicht geladen werden",
      "statusUpdated": "Status aktualisiert",
      "statusUpdateFailed": "Status-Update fehlgeschlagen",
      "pricingLoadError": "Preiskonfiguration konnte nicht geladen werden",
      "pricingSaved": "Preise gespeichert",
      "saveFailed": "Speichern fehlgeschlagen",
      "prices": "Preise",
      "activate": "Aktivieren",
      "lock": "Sperren",
      "pricingModalTitle": "Preise · {{name}}",
      "save": "Speichern"
    },
    "settings": {
      "title": "Einstellungen",
      "subtitle": "Sitzungsprognose — Parameter ändern und im Live-Rechner sofort die Sitzungsrange sehen. Speichern übernimmt die Werte plattformweit (Socket).",
      "loadError": "Sitzungsprognose konnte nicht geladen werden",
      "updatedReload": "Sitzungsprognose wurde aktualisiert — lade neu…",
      "saved": "Sitzungsprognose gespeichert — Studio & Apps werden live aktualisiert",
      "saveFailed": "Speichern fehlgeschlagen",
      "noParameters": "Keine Parameter geladen.",
      "save": "Speichern"
    },
    "overview": {
      "title": "Admin Übersicht",
      "subtitle": "Plattform-KPIs · Shop-Provision · Elaycoins (Stripe Connect pending)",
      "studios": "Studios",
      "shopRevenue": "Shop Umsatz",
      "provisionOpen": "Studio-Provision (offen)",
      "coinsTotal": "Elaycoins gesamt",
      "provisionStandard": "Provision Standard: {{pct}}% an Studios · Stripe Connect: {{stripe}}",
      "stripeActive": "aktiv",
      "stripePending": "ausstehend (Keys pending)",
      "topStudios": "Top Studios nach Shop-Umsatz: {{list}}"
    },
    "finance": {
      "title": "Finanzen",
      "subtitle": "Shop-Umsatz & Studio-Provisionen ({{pct}}% Standard). Stripe Connect Auszahlung: pending.",
      "revenue": "Umsatz (Warenwert)",
      "elayaShare": "Elaya-Anteil",
      "provisionOpen": "Provision offen",
      "provisionPaid": "Provision ausgezahlt",
      "empty": "Noch keine Shop-Umsätze",
      "headers": {
        "studio": "Studio",
        "orders": "Bestellungen",
        "revenue": "Umsatz",
        "provisionTotal": "Provision gesamt",
        "open": "Offen",
        "paid": "Ausgezahlt"
      }
    },
    "features": {
      "title": "Feature Management",
      "subtitle": "Pakete (Basic / Professional / Enterprise) · globale Schalter · Studio-Overrides",
      "loadError": "Features konnten nicht geladen werden",
      "planUpdated": "Paket aktualisiert",
      "planError": "Paket konnte nicht gespeichert werden",
      "overrideError": "Override fehlgeschlagen",
      "globalUpdated": "Globale Features aktualisiert",
      "globalError": "Globale Features fehlgeschlagen",
      "globalTitle": "Globale Feature-Schalter",
      "planDefaults": "Plan defaults — Basic: {{basic}} · Professional: {{pro}} · Enterprise: {{ent}} Features",
      "forceOn": "Force ON",
      "forceOff": "Force OFF",
      "planDefault": "Plan default"
    },
    "elaycoins": {
      "title": "Elaycoins (Plattform)",
      "subtitle": "Kunden-Guthaben gehören dem Kunden · studioübergreifende Übersicht · Admin-Korrekturen",
      "loadError": "Elaycoins konnten nicht geladen werden",
      "adjustSaved": "Korrektur gespeichert",
      "adjustError": "Korrektur fehlgeschlagen",
      "search": "Suche",
      "searchPh": "Name oder E-Mail",
      "searchBtn": "Suchen",
      "kpiTotal": "Coins gesamt",
      "kpiWithBalance": "Kunden mit Guthaben",
      "kpiCustomers": "Kunden",
      "empty": "Keine Kunden",
      "studioBalance": "Studio: {{studio}} · Balance: ",
      "adjust": "Korrigieren",
      "modalTitle": "Elaycoin-Korrektur",
      "modalIntro": "{{name}} · aktuell {{balance}} Coins",
      "coinsLabel": "Coins (+ gutschreiben / − abziehen)",
      "reason": "Grund",
      "save": "Speichern"
    },
    "shop": {
      "title": "Shop (Plattform)",
      "subtitle": "Produkte, Bestellungen und Studio-Provisionen",
      "productsLoadError": "Produkte konnten nicht geladen werden",
      "ordersLoadError": "Bestellungen konnten nicht geladen werden",
      "productCreated": "Produkt erstellt",
      "productUpdated": "Produkt gespeichert",
      "saveFailed": "Speichern fehlgeschlagen",
      "statusError": "Status konnte nicht geändert werden",
      "provisionUpdated": "Provision aktualisiert",
      "provisionStripe": "Provision via Stripe Transfer ausgezahlt",
      "provisionError": "Provision konnte nicht aktualisiert werden",
      "tabProducts": "Produkte",
      "tabOrders": "Bestellungen",
      "noProducts": "Keine Produkte",
      "noProductsDesc": "Lege das erste Produkt an.",
      "noOrders": "Keine Bestellungen",
      "editProduct": "Produkt bearbeiten",
      "newProduct": "Neues Produkt",
      "save": "Speichern",
      "cancel": "Abbrechen",
      "edit": "Bearbeiten",
      "deactivate": "Deaktivieren",
      "activate": "Aktivieren",
      "active": "Aktiv",
      "inactive": "Inaktiv",
      "markPaidManual": "Manuell ausgezahlt",
      "viaStripe": "Via Stripe",
      "reset": "Zurücksetzen",
      "headers": {
        "name": "Name",
        "sku": "Art.-Nr.",
        "price": "Preis",
        "stock": "Lager",
        "status": "Status",
        "order": "Order",
        "studio": "Studio",
        "customer": "Kunde",
        "revenue": "Umsatz",
        "provision": "Provision",
        "payout": "Auszahlung"
      },
      "form": {
        "name": "Name",
        "productCode": "Product code",
        "sku": "Artikelnummer",
        "description": "Beschreibung",
        "priceChf": "Preis CHF",
        "stock": "Lagerbestand",
        "stockPh": "leer = unbegrenzt",
        "category": "Kategorie",
        "imageUrl": "Bild-URL",
        "active": "Aktiv"
      },
      "categories": {
        "Nachsorge": "Nachsorge",
        "Sonnenschutz": "Sonnenschutz",
        "Reinigung": "Reinigung",
        "Zubehör": "Zubehör",
        "Sonstiges": "Sonstiges"
      }
    },
    "transfers": {
      "title": "Studio-Wechsel",
      "subtitle": "Anfragen genehmigen oder ablehnen",
      "loadError": "Transfers konnten nicht geladen werden",
      "approved": "Genehmigt",
      "approveError": "Genehmigung fehlgeschlagen",
      "rejected": "Abgelehnt",
      "rejectError": "Ablehnung fehlgeschlagen",
      "reasonRequired": "Bitte Ablehnungsgrund angeben",
      "empty": "Keine Anfragen",
      "customerFallback": "Kunde",
      "approve": "Genehmigen",
      "reject": "Ablehnen",
      "rejectTitle": "Wechsel ablehnen",
      "rejectReason": "Ablehnungsgrund",
      "rejectPh": "Grund für die Ablehnung",
      "cancel": "Abbrechen",
      "statuses": {
        "ausstehend": "Ausstehend",
        "pending": "Ausstehend",
        "genehmigt": "Genehmigt",
        "abgelehnt": "Abgelehnt"
      }
    },
  },
  "components": {
    "pagination": {
      "ofTotal": "{{from}}–{{to}} von {{total}}",
      "prev": "Zurück",
      "next": "Weiter",
      "page": "Seite {{page}} / {{total}}",
      "prevAria": "Vorherige Seite",
      "nextAria": "Nächste Seite"
    },
    "preSessionCheck": {
      "title": "Vorbehandlungs-Check",
      "hint": "UV-Exposition und Medikamente beeinflussen die Sperrfrist.",
      "medsLabel": "Medikamente (letzte Einnahme)",
      "uv": {
        "keine": "Keine",
        "leicht": "Leicht",
        "mittel": "Mittel (+21 Tage)",
        "intensiv": "Intensiv (+28 Tage)"
      },
      "meds": {
        "keine": "Keine",
        "retinoide": "Retinoide (+180 Tage)",
        "antibiotika": "Antibiotika (+14 Tage)",
        "antidepressiva": "Antidepressiva (+14 Tage)"
      }
    },
    "caseWizard": {
      "stepOf": "Schritt {{current}} / {{total}}"
    },
    "caseIntakePhotos": {
      "close": "Schliessen"
    },
    "customerForm": {
      "required": "Pflichtfeld",
      "firstName": "Vorname",
      "lastName": "Nachname",
      "email": "E-Mail",
      "phone": "Telefon",
      "birthDate": "Geburtsdatum",
      "street": "Strasse",
      "postalCode": "PLZ",
      "city": "Ort",
      "country": "Land",
      "notes": "Notizen (intern)",
      "notesPh": "Interne Anmerkungen…",
      "cancel": "Abbrechen",
      "submit": "Kunden anlegen",
      "countries": {
        "Schweiz": "Schweiz",
        "Deutschland": "Deutschland",
        "Österreich": "Österreich",
        "Frankreich": "Frankreich",
        "Italien": "Italien",
        "Anderes": "Anderes"
      }
    },
    "groupBooking": {
      "title": "Gruppen-Termin",
      "intro": "Mehrere Tattoos desselben Kunden in einem gemeinsamen Termin. Rabatt {{pct}}%. Max. {{max}} Grössen-Punkte (Klein=1, Mittel=2, Gross=4 allein).",
      "customer": "Kunde *",
      "selectCustomer": "Kunden auswählen…",
      "selectCases": "Fälle auswählen * ({{count}} gewählt · {{points}}/{{max}} Pkt.)",
      "selectCustomerFirst": "Zuerst Kunden auswählen…",
      "noEligible": "Keine geeigneten Tattoo-Fälle (PMU und abgeschlossene Fälle sind ausgeschlossen).",
      "areaNa": "Fläche n/a",
      "perSession": "/Sitzung",
      "priceOverview": "Preisübersicht ({{pct}}% Gruppen-Rabatt)",
      "subtotal": "Zwischensumme",
      "discount": "Rabatt −{{pct}}%",
      "total": "Gesamt",
      "lockoutLoading": "Sperrfristen werden geladen…",
      "lockoutTitle": "Sperrfrist (strengster Fall)",
      "earliest": "Frühestens: {{date}}",
      "noLockout": "Keine Sperrfrist — Termin frei wählbar.",
      "dateRequired": "Datum *",
      "timeRequired": "Uhrzeit *",
      "durationMin": "Dauer (Min.)",
      "cancel": "Abbrechen",
      "book": "Gruppen-Termin buchen",
      "minCases": "Mindestens 2 Tattoos für einen Gruppen-Termin auswählen.",
      "dateTimeRequired": "Datum und Uhrzeit sind Pflichtfelder.",
      "tooEarly": "Termin zu früh. Frühestens buchbar ab {{date}}.",
      "bookSuccess": "Gruppen-Termin gebucht ({{count}} Fälle).",
      "bookError": "Fehler beim Buchen des Gruppen-Termins.",
      "notAllowed": "Termin nicht erlaubt."
    },
    "groupDetail": {
      "title": "Gruppen-Termin",
      "timeSuffix": " · {{time}} Uhr",
      "minutes": " · {{count}} min",
      "status": "Status: {{status}}",
      "groupCases": "Gruppen-Termin ({{count}} Fälle)",
      "openRecord": " · Akte öffnen",
      "discount": "Gruppen-Rabatt {{pct}}%",
      "applied": "angewendet",
      "total": "Gesamt",
      "hint": "Jeder Fall braucht weiterhin eine eigene Sitzungsdokumentation. Tippen Sie einen Fall an, um die Akte zu öffnen.",
      "close": "Schliessen",
      "types": {
        "beratung": "Beratung",
        "treatment": "Behandlung",
        "first": "Erstbehandlung"
      },
      "tattoo": "Tattoo",
      "pmu": "PMU"
    },
    "crmTasks": {
      "done": "Erledigt.",
      "updateError": "Konnte nicht aktualisiert werden.",
      "deleted": "Aufgabe gelöscht.",
      "deleteError": "Konnte nicht gelöscht werden.",
      "general": "Allgemein",
      "due": "Fällig: {{date}}",
      "completeTitle": "Erledigen",
      "deleteTitle": "Löschen",
      "loading": "Lade Aufgaben…",
      "newTask": "+ Neue Aufgabe",
      "emptyTitle": "Keine Aufgaben",
      "emptyDesc": "Lege Follow-ups und Erinnerungen für deine Leads an.",
      "allDone": "Alle Aufgaben erledigt!",
      "overdue": "Überfällig",
      "today": "Heute",
      "thisWeek": "Diese Woche",
      "later": "Später",
      "recentlyDone": "Zuletzt erledigt"
    },
    "pricing": {
      "intro": "Diese Werte steuern die KI-Preisberechnung und die Sitzungsschätzung für die Kunden dieses Studios. Leere Felder verwenden den Plattform-Standard.",
      "platformDefault": "Plattform-Standard",
      "groups": {
        "base": "Grundpreise",
        "color": "Farb-Multiplikatoren",
        "depth": "Stichtiefe",
        "age": "Tattoo-Alter",
        "skin": "Hauttyp (Fitzpatrick)",
        "location": "Körperstelle",
        "layering": "Layering / Cover-up",
        "goal": "Behandlungsziel"
      },
      "fields": {
        "basePricePerCm2": "Basispreis / cm² (CHF)",
        "minPrice": "Mindestpreis / Sitzung (CHF)",
        "pmuPrice": "PMU-Preis (CHF)",
        "color_black": "Schwarz",
        "color_mixed": "Gemischt",
        "color_multi": "Mehrfarbig",
        "color_difficult": "Schwierige Farben (weiss/gelb/hautfarben)",
        "depth_shallow": "Oberflächlich",
        "depth_normal": "Normal",
        "depth_deep": "Tief",
        "depth_very_deep": "Sehr tief",
        "age_under1": "unter 1 Jahr",
        "age_1to3": "1–3 Jahre",
        "age_3to5": "3–5 Jahre",
        "age_5to10": "5–10 Jahre",
        "age_over10": "über 10 Jahre",
        "skin_1": "Typ I",
        "skin_2": "Typ II",
        "skin_3": "Typ III",
        "skin_4": "Typ IV",
        "skin_5": "Typ V",
        "skin_6": "Typ VI",
        "location_arm": "Arm",
        "location_leg": "Bein",
        "location_torso": "Torso",
        "location_neck": "Hals/Nacken",
        "location_face": "Gesicht",
        "location_hand": "Hand",
        "location_foot": "Fuss",
        "layering_none": "Kein",
        "layering_once": "Einmal",
        "layering_multi": "Mehrfach",
        "goal_full": "Vollständige Entfernung",
        "goal_partial": "Teilweise Aufhellung",
        "goal_lighten": "Aufhellung für Cover-up"
      }
    },
    "sessionPrediction": {
      "previewFailed": "Vorschau fehlgeschlagen",
      "sessionsUnit": "Sitzungen",
      "exampleCase": "Beispiel-Fall",
      "plausibilityTitle": "Excel-Plausibilität (Beispiele 1–3)",
      "plausibilityHint": "Master Excel §7: Preis/Sitzung × Sitzungsrange muss diese Referenzfälle treffen.",
      "sessionsRange": "{{min}}–{{max}} Sitzungen",
      "liveTitle": "Live-Rechner · Sitzungsprognose",
      "liveSubtitle": "Parameter ändern → Prognose aktualisiert sofort (ohne Speichern). Gleiche Engine wie bei Case-Erstellung.",
      "presets": {
        "example_1": "Excel §7 · Kleines schwarzes Tattoo (6–8)",
        "example_2": "Excel §7 · Buntes Tattoo (10–14)",
        "example_3": "Excel §7 · Cover-up Hand (12–16)"
      },
      "saved": "Gespeichert",
      "liveDraft": "Live (Entwurf)",
      "changeSessions": "Änderung {{minDelta}} / {{maxDelta}} Sitzungen",
      "currentForecast": "Aktuelle Prognose",
      "aftercareInFormula": "Nachsorge",
      "tattooDeltaLabel": "Tattoo-Delta",
      "lifestyleLabel": "Lifestyle",
      "lifestyleScoreLine": "Score {{score}} · ×{{mult}}",
      "midConfidence": "Mitte / Konfidenz",
      "activeFactors": "Wirksame Tattoo-Faktoren",
      "noDeltas": "Keine Tattoo-Deltas ≠ 0 — einfache Prognose (±1 Sitzung um die Mitte).",
      "loadPreview": "Vorschau laden",
      "formulaHint": "Formel: (Basis + Tattoo-Deltas) × Lifestyle-Multiplikator → Sitzungsmitte, danach Min/Max-Range. Lifestyle-Score 1 = ×0.85 (optimal), Score 5 = ×1.50 (stark beeinträchtigt). Kunden sehen diese Parameter nicht.",
      "baseSection": "Basis & Range",
      "lifestyleComposite": "Lifestyle-Composite",
      "lifestyleCompositeHint": "Sieben Hauptfaktoren gemittelt: Rauchen, Alkohol, Schlaf (Qualität+Stunden als ein Score), Stress, Aktivität (inkl. Sport), Hydration, Ernährung. Nachsorge fliesst nicht in den Score ein. BMI ≥30 hebt den Score auf mind. 4, ≥35 auf 5.",
      "lifestyleMultipliers": "Lifestyle-Multiplikatoren",
      "aftercareSection": "Nachsorge-Bereitschaft (zusätzliche Max-Sitzungen)",
      "avgUpTo": "Ø bis",
      "score": "Score",
      "multiplier": "Multiplikator",
      "base": {
        "base_sessions": "Basis-Sitzungen",
        "min_sessions": "Minimum",
        "max_sessions": "Maximum",
        "range_minus": "Range −",
        "range_plus": "Range +"
      },
      "baseHints": {
        "base_sessions": "Standardtattoo = 8",
        "range_minus": "Min = Mitte − dieser Wert",
        "range_plus": "Max = Mitte + dieser Wert"
      },
      "tattooGroupTitles": {
        "fitzpatrick": "Fitzpatrick (Delta)",
        "location": "Körperstelle (Delta)",
        "color": "Farben — schwierigste Farbe zählt (Delta)",
        "color_count": "Farbanzahl (Delta, falls höher als schwierigste Farbe)",
        "scarring": "Narben / Keloid-Risiko (Delta)",
        "density": "Dichte (Delta)",
        "saturation": "Sättigung (Delta)",
        "coverup": "Cover-up / Layering (Delta)",
        "age": "Tattoo-Alter (Delta)",
        "prior_treatment": "Vorbehandlung (Delta)",
        "type": "Tattoo-Art (Delta)",
        "goal": "Entfernungsziel (Delta)",
        "laser_profile": "Laser-/Studioqualität (Delta)",
        "healing_history": "Heilungsverlauf (Delta, sobald Verlauf da ist)",
        "lightening_rate": "Hellungsrate (Delta, ab 2 Vergleichsfotos)"
      },
      "tattooFields": {
        "fitzpatrick": {
          "I": "Typ I",
          "II": "Typ II",
          "III": "Typ III",
          "IV": "Typ IV",
          "V": "Typ V",
          "VI": "Typ VI",
          "unsicher": "Unsicher"
        },
        "location": {
          "arm": "Arm",
          "leg": "Bein",
          "chest": "Brust",
          "back": "Rücken",
          "shoulder": "Schulter",
          "abdomen": "Bauch",
          "hip": "Hüfte",
          "neck": "Hals",
          "face": "Gesicht",
          "hand": "Hand",
          "foot": "Fuss",
          "other": "Andere"
        },
        "color": {
          "black": "Schwarz",
          "grey": "Grau",
          "red": "Rot",
          "orange": "Orange",
          "blue": "Blau",
          "green": "Grün",
          "purple": "Lila",
          "yellow": "Gelb",
          "white": "Weiss",
          "skin_tone": "Hautfarbe"
        },
        "color_count": {
          "none": "Nur Schwarz/Grau",
          "one_two": "Schwarz + 1–2 Farben",
          "three_plus": "Bunt 3+ Farben"
        },
        "scarring": {
          "low": "Niedrig",
          "medium": "Mittel",
          "high": "Hoch",
          "unsure": "Unsicher"
        },
        "density": {
          "low": "Niedrig",
          "medium": "Mittel",
          "high": "Hoch",
          "very_high": "Sehr hoch"
        },
        "saturation": {
          "low": "Niedrig",
          "medium": "Mittel",
          "high": "Hoch",
          "very_high": "Sehr hoch"
        },
        "coverup": {
          "none": "Kein",
          "once": "1× überdeckt",
          "multiple": "Mehrfach",
          "unknown": "Unbekannt"
        },
        "age": {
          "under_1": "unter 1 Jahr",
          "age_1_3": "1–3 Jahre",
          "age_4_7": "4–7 Jahre",
          "age_8_15": "8–15 Jahre",
          "over_15": "über 15 Jahre",
          "unknown": "Unbekannt"
        },
        "prior_treatment": {
          "none": "Keine",
          "some": "1–2 Sitzungen",
          "many": "3+ Sitzungen"
        },
        "type": {
          "amateur": "Amateur",
          "professional": "Professionell",
          "cosmetic": "Kosmetisch",
          "coverup": "Cover-up",
          "mixed": "Gemischt"
        },
        "goal": {
          "full_removal": "Komplett",
          "partial_fade": "Teilweise",
          "lightening_for_coverup": "Aufhellen für Cover-up"
        },
        "laser_profile": {
          "basic": "Basic",
          "unknown": "Unbekannt",
          "advanced": "Advanced",
          "premium": "Premium",
          "elite": "Elite"
        },
        "healing_history": {
          "normal": "Normal",
          "mixed": "Gemischt",
          "problematic": "Problematisch"
        },
        "lightening_rate": {
          "fast": "Schnell",
          "expected": "Erwartet",
          "slow": "Langsam",
          "stagnant": "Stagnierend"
        }
      },
      "lifestyleGroupTitles": {
        "smoker": "Rauchen (Score 1–5)",
        "alcohol": "Alkohol (Score 1–5)",
        "sleep_quality": "Schlafqualität (Score 1–5)",
        "sleep_hours": "Schlafstunden (Score 1–5)",
        "stress": "Stress (Score 1–5)",
        "activity": "Aktivität (Score 1–5, niedriger = besser)",
        "sport_frequency": "Sport pro Woche (Score 1–5, wird mit Aktivität gemittelt)",
        "hydration": "Hydration (Score 1–5)",
        "nutrition": "Ernährung (Score 1–5)"
      },
      "lifestyleFields": {
        "smoker": {
          "no": "Nein",
          "occasionally": "Gelegentlich",
          "daily_light": "Täglich leicht",
          "daily_heavy": "Täglich stark"
        },
        "alcohol": {
          "never": "Nie",
          "rarely": "Selten",
          "1-2x_week": "1–2× / Woche",
          "3-4x_week": "3–4× / Woche",
          "5+x_week": "5+× / Woche"
        },
        "sleep_quality": {
          "excellent": "Sehr gut",
          "good": "Gut",
          "fair": "Mittel",
          "poor": "Schlecht"
        },
        "sleep_hours": {
          "8+": "8+ h",
          "7-8": "7–8 h",
          "6-7": "6–7 h",
          "5-6": "5–6 h",
          "under_5": "< 5 h"
        },
        "stress": {
          "low": "Niedrig",
          "medium": "Mittel",
          "high": "Hoch",
          "very_high": "Sehr hoch"
        },
        "activity": {
          "high": "Hoch",
          "regular": "Regelmässig",
          "light": "Leicht",
          "low": "Niedrig"
        },
        "sport_frequency": {
          "5+": "5+",
          "3-4": "3–4×",
          "1-2": "1–2×",
          "0": "Kein Sport"
        },
        "hydration": {
          "good": "Gut",
          "normal": "Normal",
          "low": "Niedrig"
        },
        "nutrition": {
          "very_good": "Sehr gut",
          "good": "Gut",
          "fair": "Mittel",
          "poor": "Schlecht",
          "very_poor": "Sehr schlecht"
        }
      },
      "aftercareFields": {
        "low": "Niedrig (+ Max-Sitzungen)",
        "medium": "Mittel",
        "high": "Hoch"
      }
    },
    "anamnesis": {
      "unchangedConfirmed": "Gesundheitszustand unverändert bestätigt",
      "edit": "Bearbeiten",
      "fill": "Ausfüllen",
      "customerCanConfirm": "Der Kunde kann die letzte Anamnese bestätigen oder Änderungen angeben.",
      "freigabeSaveError": "Freigabe konnte nicht gespeichert werden.",
      "freigabeNotePh": "z.B. Rücksprache mit Arzt erfolgt",
      "ablehnungNotePh": "z.B. Bitte zuerst Rücksprache mit Arzt halten",
      "confirm": "Bestätigen",
      "saveRejection": "Ablehnung speichern",
      "klaerungPending": "🔴 Noch nicht besprochen",
      "klaerungMore": "🟡 Weitere Klärung nötig",
      "klaerungDone": "🟢 Geklärt",
      "klaerungSaved": "Klärung gespeichert",
      "klaerungError": "Klärung konnte nicht gespeichert werden.",
      "klaerungNotePh": "Notiz zur Klärung (optional)…",
      "title": "Medizinische Anamnese",
      "filledOn": "Ausgefüllt am {{date}}",
      "loadError": "Anamnese konnte nicht geladen werden.",
      "pendingTitle": "⚠ Ausstehend",
      "pendingDesc": "Die medizinische Anamnese wurde für diesen Case noch nicht ausgefüllt.",
      "flagsOpen": "{{count}} Flag{{suffix}} offen",
      "medicalTimeline": "Medizinischer Verlauf",
      "signaturePresent": " · Unterschrift vorhanden",
      "signatureAlt": "Unterschrift",
      "history": {
        "submitted": "Anamnese eingereicht",
        "updated": "Medizinische Angaben aktualisiert",
        "anamnesis_submitted": "Anamnese eingereicht"
      },
      "freigabe": {
        "status": {
          "ausstehend": "Ausstehend",
          "freigegeben": "Freigegeben",
          "abgelehnt": "Abgelehnt",
          "nicht_erforderlich": "Nicht erforderlich"
        },
        "approvedTitle": "✅ Medizinische Freigabe erteilt",
        "rejectedTitle": "❌ Freigabe abgelehnt",
        "statusLine": "Status: {{status}}",
        "note": "Notiz: {{note}}",
        "requiredTitle": "🔴 Medizinische Freigabe erforderlich — Stufe 2",
        "triggers": "Auslöser: {{list}}",
        "approve": "✅ Freigeben",
        "reject": "❌ Ablehnen",
        "approveNoteLabel": "Optionale Notiz zur Freigabe:",
        "rejectNoteLabel": "Ablehnungsgrund (optional):",
        "cancel": "Abbrechen",
        "toastApproved": "Freigabe erteilt",
        "toastRejected": "Ablehnung gespeichert"
      },
      "wizard": {
        "title": "Medizinische Anamnese",
        "steps": {
          "skin": "Haut",
          "health1": "Gesundheit I",
          "health2": "Gesundheit II",
          "closing": "Abschluss",
          "summary": "Zusammenfassung"
        },
        "sectionSkin": "Abschnitt 1 — Hauterkrankungen",
        "sectionHealth1": "Abschnitt 2 — Allgemeine Gesundheit",
        "sectionHealth2": "Abschnitt 3 — Weitere Angaben",
        "sectionClosing": "Abschnitt 4 — Abschlussfragen",
        "incomplete": "Bitte alle Fragen beantworten.",
        "saved": "Anamnese gespeichert.",
        "back": "Zurück",
        "next": "Weiter",
        "save": "Anamnese speichern",
        "yes": "Ja",
        "no": "Nein",
        "unsure": "Unsicher",
        "specifyPh": "Bitte angeben…",
        "whichOptional": "Welche? (optional)",
        "koBannerTitle": "🔴 Aufgrund deiner Angaben ist eine Abklärung nötig.",
        "koBannerBody": "Du kannst die Anamnese trotzdem abschliessen. Beim Terminbuchen wirst du nochmals gefragt.",
        "studioHints": "Hinweise für das Studio",
        "clarificationNeeded": "Abklärung nötig",
        "confirmTruth": "Mit dem Speichern bestätigen Sie, dass alle Angaben wahrheitsgemäss erfasst wurden.",
        "q1": "Haben Sie Hauterkrankungen? (Mehrfachauswahl)",
        "q2": "Pigmentstörungen oder helle/dunkle Flecken nach Verletzungen?",
        "q3": "Akute Erkrankung, Fieber oder Infektion?",
        "q4": "Chronische Erkrankungen?",
        "q5": "Diabetes?",
        "q6": "Autoimmunerkrankung?",
        "q7": "Immunschwäche oder immunsuppressive Medikamente?",
        "q8": "Herz- oder Kreislauferkrankung?",
        "q9": "Epilepsie oder Krampfanfälle?",
        "q10": "Blutgerinnungsstörung?",
        "q11": "Blutverdünnende Medikamente?",
        "q12": "Infektionskrankheiten? (Mehrfachauswahl)",
        "q13": "Allergien?",
        "q14": "Schlechte Wundheilung oder frühere Laserbehandlungen?",
        "q15": "Herpes im Behandlungsbereich?",
        "q16": "Schwanger, stillend oder unsicher?",
        "q17": "Unter Alkohol- oder Drogeneinfluss?",
        "q18": "Sind Sie urteilsfähig?",
        "q19": "Mindestens 18 Jahre alt?",
        "haut": {
          "nein": "Nein",
          "neurodermitis": "Neurodermitis",
          "psoriasis": "Psoriasis",
          "ekzem": "Ekzem",
          "vitiligo": "Vitiligo",
          "akne": "Akne",
          "herpes": "Herpes",
          "andere": "Andere"
        },
        "infekt": {
          "nein": "Nein",
          "hepatitis": "Hepatitis",
          "hiv": "HIV",
          "andere": "Andere"
        },
        "diabetes": {
          "nein": "Nein",
          "typ1": "Typ 1",
          "typ2": "Typ 2",
          "unbekannt": "Weiss nicht"
        }
      }
    },
    "signature": {
      "canvasLabel": "Unterschrift *",
      "clear": "Löschen",
      "hint": "Mit Finger oder Maus unterschreiben",
      "panelTitle": "Unterschrift & Merkblatt",
      "sign": "Unterschreiben",
      "resign": "Erneut unterschreiben",
      "anamnesisFirstTitle": "Anamnese zuerst",
      "anamnesisFirstDesc": "Die medizinische Anamnese muss vor der Unterschrift ausgefüllt sein.",
      "present": "✅ Unterschrift vorhanden",
      "signedAt": "Unterzeichnet: {{date}}",
      "leafletRead": "Merkblatt gelesen: Ja",
      "clickToEnlarge": "Klicken zum Vergrössern",
      "pendingTitle": "⚠ Ausstehend",
      "pendingDesc": "Nachsorgehinweise lesen und digital unterschreiben.",
      "lightboxTitle": "Unterschrift",
      "previewAlt": "Unterschrift Vorschau",
      "close": "Schliessen",
      "wizardTitle": "Nachsorge & Unterschrift",
      "stepLeaflet": "Merkblatt",
      "stepSignature": "Unterschrift",
      "leafletHeading": "Nachsorgehinweise",
      "leafletIntro": "Bitte lies die folgenden Hinweise sorgfältig durch.",
      "cancel": "Abbrechen",
      "continue": "Weiter →",
      "confirmHeading": "Bestätigung & Unterschrift",
      "labelName": "Name",
      "labelCase": "Case",
      "labelDate": "Datum",
      "confirmBtn": "Unterschrift bestätigen",
      "needSignature": "Bitte unterschreiben.",
      "saved": "Unterschrift gespeichert.",
      "alt": "Unterschrift"
    },
    "casePricing": {
      "title": "Preiskalkulation",
      "error": "Preis konnte nicht berechnet werden.",
      "calculated": "Kalkulierter Preis",
      "confirmed": "Bestätigter Studio-Preis",
      "notConfirmed": "Noch nicht bestätigt",
      "area": "Fläche: {{area}} cm²",
      "confidence": "Konfidenz der Schätzung: {{pct}} %",
      "reviewRecommended": "Studio-Review empfohlen",
      "factors": "Faktoren: Farbe ×{{color}}, Alter ×{{age}}, Haut ×{{skin}}"
    },
    "caseAvailability": {
      "title": "Buchbarkeit & Sperrfristen",
      "error": "Verfügbarkeit konnte nicht geladen werden.",
      "earliest": "Frühestens buchbar",
      "lockedUntil": " · gesperrt bis {{until}}",
      "noLockouts": "Keine aktiven Sperrfristen",
      "nextWindow": "Nächstes freies Fenster ab {{from}}",
      "book": "Termin buchen"
    },
    "activityTags": {
      "BUCHUNG": "Buchung",
      "STORNIERUNG": "Stornierung",
      "NEU ANGESETZT": "Neu angesetzt",
      "NICHT ERSCHIENEN": "Nicht erschienen",
      "SPERRFRIST": "Sperrfrist",
      "MEDIZIN": "Medizin",
      "STATUS": "Status",
      "PREIS": "Preis",
      "SITZUNG": "Sitzung",
      "PROFIL": "Profil",
      "STUDIO": "Studio",
      "SONSTIGES": "Sonstiges"
    },
    "badge": {
      "pending": "Ausstehend",
      "active": "Aktiv",
      "completed": "Abgeschlossen",
      "loeschantrag_ausstehend": "Löschantrag ausstehend",
      "aktiv": "Aktiv",
      "ausstehend": "Ausstehend",
      "gesperrt": "Gesperrt",
      "gebucht": "Gebucht",
      "storniert": "Storniert"
    },
  },
  "pipeline": {
    "Neu": "Neu",
    "Beratung geplant": "Beratung geplant",
    "Behandlung aktiv": "Behandlung aktiv",
    "Beratung erledigt": "Beratung erledigt"
  },
  "crm": {
    "taskTypes": {
      "followup": "Follow-up",
      "anruf": "Anruf",
      "email": "E-Mail",
      "termin": "Termin",
      "sonstiges": "Sonstiges"
    },
    "priorities": {
      "niedrig": "Niedrig",
      "mittel": "Mittel",
      "hoch": "Hoch"
    },
    "noteTypes": {
      "anruf": "Anruf",
      "email": "E-Mail",
      "meeting": "Meeting",
      "sonstiges": "Sonstiges"
    },
    "stageActions": {
      "Neu": "Ersten Fall anlegen",
      "Beratung geplant": "Termin bestätigen",
      "Behandlung aktiv": "Nächsten Termin planen",
      "Beratung erledigt": "Follow-up senden",
      "bookConsultation": "Beratung terminieren"
    }
  }
,
  "crmModals": {
    "noteTitle": "CRM-Notiz · {{name}}",
    "noteType": "Typ",
    "noteContent": "Notiz",
    "notePlaceholder": "Gesprächsnotiz…",
    "createTask": "Aufgabe erstellen",
    "taskTitle": "Aufgabentitel",
    "taskType": "Aufgabentyp",
    "taskPriority": "Priorität",
    "taskDue": "Fällig am",
    "noteRequired": "Bitte Notiz eingeben.",
    "taskTitleRequired": "Bitte Aufgaben-Titel eingeben.",
    "noteSaved": "Notiz gespeichert.",
    "noteSaveFailed": "Notiz konnte nicht gespeichert werden.",
    "newTask": "Neue Aufgabe",
    "taskWithCustomer": "Aufgabe · {{name}}",
    "titleRequired": "Bitte Titel eingeben.",
    "taskCreated": "Aufgabe erstellt.",
    "taskSaveFailed": "Aufgabe konnte nicht gespeichert werden.",
    "title": "Titel",
    "customer": "Kunde",
    "noCustomer": "— Kein Kunde —",
    "save": "Speichern",
    "create": "Erstellen",
    "noteContentLabel": "Inhalt",
    "noteContentPlaceholder": "Gespräch, E-Mail, Ergebnis…",
    "createFollowUpTask": "Follow-up-Aufgabe erstellen",
    "taskTitlePlaceholder": "z.B. Erneut anrufen",
    "taskTypeLabel": "Aufgaben-Typ",
    "cancel": "Abbrechen",
    "customerOptional": "Kunde (optional)",
    "studioWide": "Allgemein (Studio-weit)",
    "titlePlaceholder": "z.B. Follow-up nach Beratung"
  }
}

export default de
