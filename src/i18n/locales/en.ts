/** Elaya frontend locale (en). */
const en = {
  "common": {
    "appName": "Elaya",
    "back": "Back",
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading…",
    "error": "Error",
    "success": "Success",
    "email": "E-mail",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "forgotPassword": "Forgot Password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "register": "Register",
    "login": "Login",
    "logout": "Logout",
    "required": "This field is required",
    "invalidEmail": "Invalid E-mail address",
    "passwordMismatch": "Passwords do not match",
    "passwordMinLength": "Password must be at least 8 characters",
    "serverError": "Server error. Please try again later.",
    "sendResetLink": "Send reset link",
    "newPassword": "New password",
    "resetPassword": "Reset password",
    "backToLogin": "Back to login"
  },
  "toast": {
    "loginSuccess": "Logged in successfully",
    "registerSuccess": "Registration submitted — awaiting admin approval",
    "logoutSuccess": "Logged out successfully",
    "wrongPortal": "This account does not have access to this portal.",
    "serverError": "Server error. Please try again later.",
    "forgotPasswordSent": "If an account exists, you will receive an email shortly.",
    "resetPasswordSuccess": "Password reset successfully. You can now log in.",
    "invalidResetToken": "This link is invalid or expired. Please request a new one."
  },
  "landing": {
    "badge": "Tattoo Removal Platform",
    "tagline": "Tattoo removal — intelligently managed",
    "subtitle": "The professional platform for studios, clients and clinic management.",
    "portalHeading": "Choose your portal",
    "customerLabel": "Customer App",
    "customerSub": "Book appointments, track progress and manage Elaycoins.",
    "customerCta": "Open App",
    "customerBadge": "Mobile only",
    "studioLabel": "Studio Dashboard",
    "studioSub": "Appointment management, customer care and studio analytics.",
    "studioCta": "Sign in",
    "adminLabel": "Admin",
    "adminSub": "Platform management",
    "adminCta": "Admin access",
    "footer": "© {{year}} Elaya · Moro Concept Group GmbH"
  },
  "studioAuth": {
    "loginTitle": "Studio Login",
    "loginSubtitle": "Sign in to the studio dashboard",
    "registerTitle": "Register Studio",
    "registerSubtitle": "Create your studio account on Elaya",
    "studioName": "Company Name",
    "studioCode": "Studio Code",
    "phone": "Phone Number",
    "city": "City",
    "registerButton": "Register Studio",
    "registerPrompt": "Don't have a studio account?",
    "loginPrompt": "Already have an account?",
    "forgotTitle": "Forgot Password",
    "forgotSubtitle": "Enter your email — we will send you a reset link.",
    "resetTitle": "New Password",
    "resetSubtitle": "Choose a new password for your studio account."
  },
  "adminAuth": {
    "loginTitle": "Admin Login",
    "loginSubtitle": "Platform management",
    "forgotTitle": "Forgot Password",
    "forgotSubtitle": "Enter your admin email — we will send you a reset link.",
    "resetTitle": "New Password",
    "resetSubtitle": "Choose a new password for your admin account."
  },
  "notFound": {
    "title": "404",
    "heading": "Page not found",
    "message": "The page you requested does not exist or has been moved.",
    "homeButton": "Back to home"
  },
  "studioNav": {
    "dashboard": "Dashboard",
    "appointments": "Calendar",
    "today": "Today",
    "customers": "Customers",
    "cases": "All cases",
    "sessions": "Sessions",
    "analytics": "Analytics",
    "aftercare": "Aftercare",
    "crm": "CRM",
    "chat": "Customer chat",
    "elayaChat": "Elaya Chat",
    "activity": "History",
    "shop": "Avora Shop",
    "transfers": "Studio transfer",
    "elaycoins": "Elaycoins",
    "settings": "Settings"
  },
  "studioActivity": {
    "title": "Appointment history",
    "subtitle": "Chronological log of every relevant action in the studio.",
    "customerTitle": "History",
    "empty": "No entries for the selected filters.",
    "emptyHint": "Bookings, cancellations, medical changes and studio actions appear here.",
    "loadError": "Could not load history.",
    "categories": {
      "all": "All",
      "bookings": "Appointments",
      "cancellations": "Cancellations",
      "reschedules": "Rescheduled",
      "no_shows": "No-shows",
      "lockouts": "Lockouts",
      "medical": "Medical",
      "profile": "Profile",
      "studio": "Studio",
      "prices": "Prices",
      "sessions": "Sessions"
    },
    "ranges": {
      "all": "All",
      "h24": "24 hrs",
      "h48": "48 hrs",
      "d7": "7 days",
      "d30": "30 days",
      "m3": "3 months",
      "m6": "6 months",
      "custom": "Date range"
    },
    "from": "From",
    "to": "To"
  },
  "studioElayaChat": {
    "title": "Elaya Chat",
    "subtitle": "Your AI assistant for medical questions, treatments and cases — inside the studio.",
    "welcome": "Hi! I am Elaya. Ask me about tattoo removal, skin, lockouts, Quick Check, or a specific customer case.",
    "placeholder": "Ask Elaya…",
    "send": "Send",
    "thinking": "Elaya is thinking…",
    "emptyHint": "Type a question or pick a suggestion.",
    "contextLabel": "Context",
    "contextNone": "Whole studio",
    "contextCustomer": "Customer",
    "contextSearch": "Search customer…",
    "newChat": "New chat",
    "openCustomer": "Open customer",
    "openCase": "Open case",
    "unavailable": "Elaya is unavailable right now. Please try again later.",
    "loadError": "Could not load a reply.",
    "prompts": [
      "What contraindications apply before a laser session?",
      "Customer had the flu — when can we treat?",
      "Explain the current lockout logic.",
      "What to watch with Fitzpatrick IV?",
      "How do I document a session in Elaya?"
    ]
  },
  "adminNav": {
    "sidebarTitle": "Platform management",
    "sidebarTag": "Skin · Laser · Care",
    "contentPlaceholder": "Content coming soon",
    "items": [
      {
        "id": "overview",
        "icon": "📊",
        "label": "Overview"
      },
      {
        "id": "studios",
        "icon": "🏪",
        "label": "Studios"
      },
      {
        "id": "customers",
        "icon": "👥",
        "label": "Customers"
      },
      {
        "id": "transfer",
        "icon": "🔄",
        "label": "Studio transfer"
      },
      {
        "id": "elaycoins",
        "icon": "🪙",
        "label": "Elaycoins"
      },
      {
        "id": "finance",
        "icon": "💶",
        "label": "Finance"
      },
      {
        "id": "features",
        "icon": "🎛️",
        "label": "Features"
      },
      {
        "id": "ai",
        "icon": "🤖",
        "label": "Elaya AI"
      },
      {
        "id": "shop",
        "icon": "🛍️",
        "label": "ElayShop"
      },
      {
        "id": "settings",
        "icon": "⚙️",
        "label": "Settings"
      }
    ]
  },
  "caseForm": {
    "caseTypes": [
      {
        "value": "tattoo",
        "label": "Tattoo removal"
      },
      {
        "value": "pmu",
        "label": "PMU removal"
      }
    ],
    "wizardSteps": [
      {
        "id": "basics",
        "code": "TC_01",
        "title": "Basics",
        "subtitle": "General info"
      },
      {
        "id": "properties",
        "code": "TC_02",
        "title": "Properties",
        "subtitle": "Colors & size"
      },
      {
        "id": "skin",
        "code": "TC_03",
        "title": "Skin & risk",
        "subtitle": "Safety"
      },
      {
        "id": "lifestyle",
        "code": "TC_04",
        "title": "Lifestyle",
        "subtitle": "Recovery"
      },
      {
        "id": "goal",
        "code": "TC_05",
        "title": "Goal",
        "subtitle": "Expectations"
      },
      {
        "id": "photos",
        "code": "TC_06",
        "title": "Photos",
        "subtitle": "Optional"
      },
      {
        "id": "pricing",
        "code": "AI",
        "title": "Analysis",
        "subtitle": "Price estimate"
      },
      {
        "id": "review",
        "code": "✓",
        "title": "Review",
        "subtitle": "Check & save"
      }
    ],
    "pmuWizardSteps": [
      {
        "id": "pmu-basics",
        "code": "PMU_01",
        "title": "Basics",
        "subtitle": "PMU details"
      },
      {
        "id": "pmu-pretreatment",
        "code": "PMU_02",
        "title": "Pretreatment",
        "subtitle": "Laser history"
      },
      {
        "id": "pmu-colors",
        "code": "PMU_03",
        "title": "Colors",
        "subtitle": "Details"
      },
      {
        "id": "pmu-lifestyle",
        "code": "PMU_04",
        "title": "Lifestyle",
        "subtitle": "Recovery"
      },
      {
        "id": "pmu-prognosis",
        "code": "PMU_05",
        "title": "Prognosis",
        "subtitle": "Consent"
      },
      {
        "id": "pmu-photos",
        "code": "PMU_06",
        "title": "Photos",
        "subtitle": "Optional"
      },
      {
        "id": "pmu-review",
        "code": "✓",
        "title": "Review",
        "subtitle": "Check & save"
      }
    ],
    "pmuTypes": [
      [
        "eyebrows",
        "Eyebrows"
      ],
      [
        "eyeliner",
        "Eyeliner"
      ],
      [
        "lips",
        "Lips"
      ],
      [
        "microblading",
        "Microblading"
      ],
      [
        "other",
        "Other"
      ]
    ],
    "pmuSides": [
      [
        "left",
        "Left"
      ],
      [
        "right",
        "Right"
      ],
      [
        "both",
        "Both"
      ]
    ],
    "pmuAgeRanges": [
      [
        "<1",
        "< 1 year"
      ],
      [
        "1-3",
        "1-3 years"
      ],
      [
        "4-7",
        "4-7 years"
      ],
      [
        "8-15",
        "8-15 years"
      ],
      [
        ">15",
        "> 15 years"
      ],
      [
        "unknown",
        "Unknown"
      ]
    ],
    "pmuTechniques": [
      [
        "professional",
        "Professional"
      ],
      [
        "amateur",
        "Amateur"
      ],
      [
        "cosmetic",
        "Cosmetic tattoo"
      ]
    ],
    "pmuPigments": [
      [
        "organic",
        "Organic (plant-based)"
      ],
      [
        "inorganic",
        "Inorganic (iron oxide)"
      ],
      [
        "unknown",
        "Unknown"
      ]
    ],
    "pmuStitchDepths": [
      [
        "surface",
        "Surface (microblading)"
      ],
      [
        "medium",
        "Medium (standard PMU)"
      ],
      [
        "deep",
        "Deep (classic)"
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
        "Light"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "intense",
        "Intense"
      ]
    ],
    "pmuColorSaturation": [
      [
        "faded",
        "Faded"
      ],
      [
        "normal",
        "Normal"
      ],
      [
        "saturated",
        "Saturated"
      ]
    ],
    "pmuLifeSmoker": [
      [
        "never",
        "Never"
      ],
      [
        "occasional",
        "Occasional"
      ],
      [
        "daily_light",
        "Daily (light)"
      ],
      [
        "daily_heavy",
        "Daily (heavy)"
      ]
    ],
    "pmuLifeAlcohol": [
      [
        "rarely",
        "Rarely"
      ],
      [
        "moderate",
        "Moderate"
      ],
      [
        "frequent",
        "Frequent"
      ]
    ],
    "pmuLifeActivity": [
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "high",
        "High"
      ]
    ],
    "pmuLifeHydration": [
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Normal"
      ],
      [
        "high",
        "High"
      ]
    ],
    "pmuLifeAftercare": [
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "high",
        "High"
      ]
    ],
    "bodyLocations": [
      [
        "arm",
        "Arm"
      ],
      [
        "leg",
        "Leg"
      ],
      [
        "chest",
        "Chest"
      ],
      [
        "back",
        "Back"
      ],
      [
        "shoulder",
        "Shoulder"
      ],
      [
        "neck",
        "Neck"
      ],
      [
        "face",
        "Face"
      ],
      [
        "abdomen",
        "Abdomen"
      ],
      [
        "hip",
        "Hip"
      ],
      [
        "hand",
        "Hand"
      ],
      [
        "foot",
        "Foot"
      ],
      [
        "other",
        "Other"
      ]
    ],
    "tcSides": [
      [
        "left",
        "Left"
      ],
      [
        "right",
        "Right"
      ],
      [
        "center",
        "Center"
      ]
    ],
    "tcAgeBuckets": [
      [
        "under_1",
        "< 1 year"
      ],
      [
        "age_1_3",
        "1–3 years"
      ],
      [
        "age_4_7",
        "4–7 years"
      ],
      [
        "age_8_15",
        "8–15 years"
      ],
      [
        "over_15",
        "> 15 years"
      ],
      [
        "unknown",
        "Unknown"
      ]
    ],
    "tcTypes": [
      [
        "professional",
        "Professional"
      ],
      [
        "amateur",
        "Amateur"
      ],
      [
        "cosmetic",
        "Cosmetic"
      ],
      [
        "coverup",
        "Cover-up"
      ],
      [
        "mixed",
        "Mixed"
      ]
    ],
    "tcCoverup": [
      [
        "none",
        "No cover-up"
      ],
      [
        "once",
        "Covered once"
      ],
      [
        "multiple",
        "Covered multiple times"
      ],
      [
        "unknown",
        "Unknown"
      ]
    ],
    "qualityLevel": [
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "high",
        "High"
      ],
      [
        "very_high",
        "Very high"
      ]
    ],
    "shadingLevel": [
      [
        "none",
        "None"
      ],
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "high",
        "High"
      ]
    ],
    "lineworkLevel": [
      [
        "fine",
        "Fine"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "bold",
        "Bold"
      ],
      [
        "mixed",
        "Mixed"
      ]
    ],
    "inkColors": [
      {
        "id": "black",
        "color": "#1a1a1a",
        "label": "Black"
      },
      {
        "id": "grey",
        "color": "#888888",
        "label": "Grey"
      },
      {
        "id": "red",
        "color": "#cc2233",
        "label": "Red"
      },
      {
        "id": "orange",
        "color": "#e67300",
        "label": "Orange"
      },
      {
        "id": "yellow",
        "color": "#e6cc00",
        "label": "Yellow"
      },
      {
        "id": "green",
        "color": "#1a8833",
        "label": "Green"
      },
      {
        "id": "blue",
        "color": "#1a3366",
        "label": "Blue"
      },
      {
        "id": "purple",
        "color": "#7733aa",
        "label": "Purple"
      },
      {
        "id": "white",
        "color": "#f0f0f0",
        "label": "White"
      },
      {
        "id": "skin_tone",
        "color": "#d4a574",
        "label": "Skin tone"
      }
    ],
    "fitzpatrick": [
      {
        "id": "I",
        "color": "#f5dcc3",
        "desc": "Very fair"
      },
      {
        "id": "II",
        "color": "#e8c8a0",
        "desc": "Fair"
      },
      {
        "id": "III",
        "color": "#c8a878",
        "desc": "Medium"
      },
      {
        "id": "IV",
        "color": "#a08060",
        "desc": "Olive"
      },
      {
        "id": "V",
        "color": "#6a4a30",
        "desc": "Brown"
      },
      {
        "id": "VI",
        "color": "#3a2a1a",
        "desc": "Dark"
      },
      {
        "id": "unsicher",
        "color": "linear-gradient(135deg,#f5dcc3,#3a2a1a)",
        "desc": "Unsure"
      }
    ],
    "riskLevel": [
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "high",
        "High"
      ],
      [
        "unsure",
        "Unsure"
      ]
    ],
    "sunExposure": [
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "high",
        "High"
      ]
    ],
    "lifeSmoker": [
      [
        "no",
        "No"
      ],
      [
        "occasionally",
        "Occasionally"
      ],
      [
        "daily_light",
        "Daily (light)"
      ],
      [
        "daily_heavy",
        "Daily (heavy)"
      ]
    ],
    "lifeAlcohol": [
      [
        "never",
        "Never"
      ],
      [
        "rarely",
        "Rarely"
      ],
      [
        "1-2x_week",
        "1–2×/week"
      ],
      [
        "3-4x_week",
        "3–4×/week"
      ],
      [
        "5+x_week",
        "5+×/week"
      ]
    ],
    "lifeActivity": [
      [
        "low",
        "Low"
      ],
      [
        "light",
        "Light"
      ],
      [
        "regular",
        "Regular"
      ],
      [
        "high",
        "High"
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
        "Poor"
      ],
      [
        "fair",
        "Fair"
      ],
      [
        "good",
        "Good"
      ],
      [
        "excellent",
        "Excellent"
      ]
    ],
    "lifeStress": [
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "high",
        "High"
      ],
      [
        "very_high",
        "Very high"
      ]
    ],
    "lifeHydration": [
      [
        "low",
        "Low"
      ],
      [
        "normal",
        "Normal"
      ],
      [
        "good",
        "Good"
      ]
    ],
    "lifeNutrition": [
      [
        "poor",
        "Poor"
      ],
      [
        "fair",
        "Fair"
      ],
      [
        "good",
        "Good"
      ]
    ],
    "lifeSportFreq": [
      [
        "0",
        "None"
      ],
      [
        "1-2",
        "1–2×/week"
      ],
      [
        "3-4",
        "3–4×/week"
      ],
      [
        "5+",
        "5+×/week"
      ]
    ],
    "goalTargets": [
      [
        "full_removal",
        "Full removal",
        "The tattoo should disappear completely."
      ],
      [
        "lightening_for_coverup",
        "Lighten for cover-up",
        "Lighten for a new tattoo on top."
      ],
      [
        "partial_fade",
        "Partial fade",
        "Only part should be removed or lightened."
      ]
    ],
    "zoneDichte": [
      [
        "low",
        "Low"
      ],
      [
        "medium",
        "Medium"
      ],
      [
        "high",
        "High"
      ],
      [
        "very_high",
        "Very high"
      ]
    ],
    "zoneFlaechen": [
      {
        "value": "xs",
        "label": "Very small",
        "cm2": 3
      },
      {
        "value": "sm",
        "label": "Small",
        "cm2": 8
      },
      {
        "value": "md",
        "label": "Medium",
        "cm2": 13.5
      },
      {
        "value": "lg",
        "label": "Large",
        "cm2": 21
      },
      {
        "value": "xl",
        "label": "Very large",
        "cm2": 33
      },
      {
        "value": "xxl",
        "label": "Extra large",
        "cm2": 45
      }
    ],
    "photoChecklist": [
      {
        "key": "photo_full_visible",
        "label": "Full tattoo visible"
      },
      {
        "key": "photo_good_light",
        "label": "Good natural light"
      },
      {
        "key": "photo_focus",
        "label": "Sharp, not blurry"
      },
      {
        "key": "photo_distance",
        "label": "About 30 cm distance"
      },
      {
        "key": "photo_no_filter",
        "label": "No filter / no editing"
      }
    ],
    "ui": {
      "optional": "(optional)",
      "yes": "Yes",
      "no": "No",
      "choose": "— select —",
      "back": "Back",
      "cancel": "Cancel",
      "next": "Next",
      "save": "Save case",
      "createCase": "Create case",
      "perSession": "/ session",
      "validation": {
        "titleRequired": "Please enter a title.",
        "bodyRequired": "Please select a body region.",
        "ageRequired": "Please select tattoo age.",
        "typeRequired": "Please select tattoo type.",
        "priorRequired": "Please indicate prior treatments.",
        "zonesMin": "At least 2 zones required.",
        "zonesIncomplete": "Please complete all zones.",
        "colorsRequired": "Please select at least one color.",
        "propertiesRequired": "Please complete all properties.",
        "sizeRequired": "Please enter dimensions in cm.",
        "fitzRequired": "Please select Fitzpatrick type.",
        "sunRequired": "Please select sun exposure.",
        "lifestyleRequired": "Please complete all required fields.",
        "sleepRequired": "Please enter sleep & stress info.",
        "bodyMassRequired": "Please enter body measurements.",
        "hydrationRequired": "Please enter hydration & nutrition.",
        "goalRequired": "Please select a treatment goal.",
        "pricingFailed": "Could not calculate estimate.",
        "pmuTypeRequired": "Please select a PMU type.",
        "pmuAgeRequired": "Please select PMU age.",
        "pmuTechniqueRequired": "Please select PMU technique.",
        "pmuDepthRequired": "Please select stitch depth.",
        "pmuLaserRequired": "Please indicate prior laser treatment.",
        "pmuColorsRequired": "Please select at least one color.",
        "pmuColorPropsRequired": "Please fill density, saturation, shading and linework.",
        "pmuLifestyleRequired": "Please fill all lifestyle fields.",
        "pmuParadoxRequired": "Please acknowledge the paradoxical darkening notice."
      },
      "basics": {
        "caseType": "Case type",
        "pmuNotice": "PMU wizard matches the prototype (7 steps). After save: anamnesis, leaflet and signature on the case.",
        "title": "Title *",
        "titlePlaceholder": "e.g. Left forearm script",
        "pmuTitlePlaceholder": "e.g. Left eyebrow",
        "bodyRegion": "Body region *",
        "bodyHint": "Where is the tattoo located?",
        "pmuType": "PMU type *",
        "pmuSide": "Side",
        "pmuAge": "PMU age *",
        "pmuTechnique": "PMU technique *",
        "pmuPigment": "Pigment type",
        "pmuDepth": "Stitch depth *",
        "eyeAreaHint": "Eye protection: treatments near the eyes use special lenses. Tell us if you wear contact lenses.",
        "zoneMode": "Zone mode",
        "zoneHint": "Large design across multiple areas?",
        "singleTattoo": "Single tattoo",
        "splitZones": "Split into zones",
        "side": "Side",
        "tattooAge": "Tattoo age *",
        "tattooType": "Tattoo type *",
        "coverup": "Cover-up *",
        "coverupHint": "Tattooed over an older tattoo?",
        "priorTreatment": "Prior treatments *",
        "priorHint": "Already treated with laser?",
        "priorCount": "Number of prior treatments",
        "priorCountPlaceholder": "e.g. 3"
      },
      "pmu": {
        "pretreatmentTitle": "Has this PMU already been laser-treated? *",
        "pretreatmentNotes": "Notes about prior treatment",
        "pretreatmentNotesPlaceholder": "e.g. sessions, studio, timeframe…",
        "colorsMulti": "Colors *",
        "colorsHint": "Multi-select",
        "colorDensity": "Color density *",
        "colorSaturation": "Color saturation *",
        "hasShading": "Shading present? *",
        "hasLinework": "Linework present? *",
        "smoking": "Smoking *",
        "smokingHint": "Smoking slows PMU removal.",
        "alcohol": "Alcohol *",
        "activity": "Physical activity *",
        "hydration": "Hydration *",
        "aftercare": "Aftercare commitment *",
        "paradoxTitle": "Important: paradoxical darkening",
        "paradoxBody": "With certain PMU pigments (especially iron oxide), color may temporarily become DARKER after the first laser session before fading. This is a known effect, not a treatment error.",
        "paradoxConfirm": "I have read and understood this notice *",
        "prognosisTitle": "Prognosis",
        "sessionsEstimated": "Estimated sessions",
        "pricePerSession": "Price per session",
        "totalCost": "Estimated total cost",
        "confirmToContinue": "Please confirm the notice to continue"
      },
      "properties": {
        "zonesTitle": "Split into zones *",
        "zonesHint": "Min. 2, max. 8 zones. Each zone is estimated separately.",
        "zone": "Zone",
        "zoneLabel": "Label *",
        "zoneLabelPlaceholder": "e.g. Outer forearm",
        "bodyPart": "Body part *",
        "colors": "Colors *",
        "density": "Density *",
        "area": "Area *",
        "customArea": "Custom (cm²)",
        "areaCm2": "Area (cm²)",
        "addZone": "Add zone",
        "colorDensity": "Color density",
        "saturation": "Saturation",
        "shading": "Shading",
        "linework": "Linework",
        "dimensions": "Dimensions in cm *",
        "dimensionsHint": "Measure with ruler — studio confirms exactly.",
        "length": "Length",
        "width": "Width"
      },
      "skin": {
        "fitzpatrick": "Fitzpatrick skin type *",
        "fitzHint": "Natural skin tone without tan.",
        "hyperpig": "Hyperpigmentation risk",
        "keloid": "Keloid / scarring risk",
        "sunZone": "Sun exposure zone *",
        "sunHint": "How exposed is this area to the sun?"
      },
      "lifestyle": {
        "smoking": "Smoking *",
        "smokingHint": "Smoking significantly slows removal.",
        "cigarettesPerDay": "Cigarettes per day",
        "bodyMass": "Body measurements *",
        "height": "Height (cm)",
        "weight": "Weight (kg)",
        "alcohol": "Alcohol *",
        "activity": "Activity level *",
        "sportFreq": "Exercise per week (optional)",
        "sleepHours": "Sleep hours *",
        "sleepQuality": "Sleep quality *",
        "stress": "Stress level *",
        "hydration": "Hydration *",
        "nutrition": "Nutrition quality *"
      },
      "goal": {
        "title": "Treatment goal *",
        "notes": "Notes",
        "notesPlaceholder": "Additional details or wishes…"
      },
      "photos": {
        "title": "Initial photos (optional)",
        "intro": "Photos are stored securely on our server — no public link. You can skip this step; the customer can upload photos later in the app.",
        "main": "Main photo",
        "mainHint": "Full tattoo",
        "detail": "Detail photo",
        "detailHint": "Close-up",
        "marker": "Reference marker",
        "markerHint": "Optional",
        "checklist": "Quality checklist",
        "selectPhoto": "Select photo",
        "uploading": "Uploading…",
        "uploadFailed": "Upload failed",
        "removeFailed": "Could not remove",
        "removeAria": "Remove photo"
      },
      "pricing": {
        "title": "AI tattoo analysis",
        "confidence": "Confidence",
        "estimatedSessions": "Estimated sessions",
        "timeframe": "Timeframe approx.",
        "months": "months",
        "priceEstimate": "Price estimate",
        "area": "Area",
        "pricePerSession": "Price per session",
        "totalCost": "Total cost",
        "disclaimer": "AI estimate (indicative price{confidence}). Final price confirmed in studio after exact measurement.",
        "nextStep": "Next, review the summary. After saving, you can complete anamnesis in the case detail view."
      },
      "review": {
        "title": "Summary",
        "type": "Type",
        "tattoo": "Tattoo",
        "pmu": "PMU",
        "label": "Title",
        "bodyRegion": "Body region",
        "zones": "Zones",
        "zonesCount": "zones",
        "singleTattoo": "Single tattoo",
        "area": "Area",
        "age": "Age",
        "tattooStyle": "Tattoo style",
        "fitzpatrick": "Fitzpatrick",
        "goal": "Goal",
        "pricePerSession": "Price / session",
        "sessionsEstimated": "Sessions (estimated)",
        "afterSave": "After saving, you can complete anamnesis in the case detail view and schedule treatments."
      }
    }
  },
  "language": {
    "label": "Language",
    "desc": "Language of the studio interface.",
    "de": "Deutsch",
    "en": "English"
  },
  "theme": {
    "title": "Appearance",
    "desc": "Choose the colour scheme for the studio dashboard.",
    "light": "Light",
    "dark": "Dark",
    "system": "System"
  },
  "settings": {
    "title": "Settings",
    "subtitle": "Studio configuration and appearance",
    "tabs": {
      "appearance": "Appearance",
      "profile": "Studio profile",
      "prices": "Prices",
      "sessionPrediction": "Session prediction",
      "hours": "Opening hours",
      "rooms": "Rooms",
      "staff": "Staff",
      "stripe": "Stripe"
    },
    "readOnly": "View only — editing requires a studio admin.",
    "edit": "Edit",
    "save": "Save",
    "cancel": "Cancel",
    "saved": "Saved.",
    "saveFailed": "Save failed.",
    "loadFailed": "Could not load."
  },
  "studio": {
    "sectionStudio": "STUDIO",
    "sectionAdmin": "ADMIN"
  },
  "commonUi": {
    "showMore": "Show more",
    "search": "Search…",
    "actions": "Actions",
    "status": "Status",
    "yes": "Yes",
    "no": "No",
    "delete": "Delete",
    "confirm": "Confirm",
    "close": "Close",
    "create": "Create",
    "add": "Add",
    "remove": "Remove",
    "optional": "optional",
    "required": "Required",
    "all": "All",
    "none": "None",
    "today": "Today",
    "from": "From",
    "to": "To",
    "open": "Open",
    "closed": "Closed",
    "minutes": "min",
    "loading": "Loading…"
  },
  "settingsPage": {
    "shared": {
      "emptyValue": "—",
      "readOnlyHint": "Only studio administrators can change settings.",
      "saveFailedFallback": "Save failed."
    },
    "appearance": {
      "themeLightDesc": "Light background",
      "themeDarkDesc": "Dark background",
      "themeSystemDesc": "Follows system setting",
      "deviceNote": "This preference is stored in the browser and applies only to this device."
    },
    "profile": {
      "title": "Studio profile",
      "desc": "Studio contact and location details.",
      "companyName": "Company name",
      "phone": "Phone",
      "address": "Address",
      "notes": "Notes",
      "street": "Street",
      "postalCode": "Postal code",
      "city": "City",
      "country": "Country",
      "defaultCountry": "Switzerland",
      "studioCode": "Studio code",
      "adminOnlyFieldsHint": "Email, studio code and status can only be changed by the Elaya administrator.",
      "toasts": {
        "loadFailed": "Could not load profile.",
        "saved": "Profile saved."
      }
    },
    "pricing": {
      "title": "Prices & Elaycoin",
      "desc": "Studio-specific price adjustments. Platform defaults apply when no value is set.",
      "coinSectionTitle": "Elaycoin value",
      "chfPerCoin": "CHF per coin",
      "platformDefault": "Platform default",
      "priceWithCurrency": "CHF {{value}}",
      "allowedRange": "Allowed range: CHF {{min}} – CHF {{max}} · Platform default: CHF {{default}}",
      "basePricePerCm2": "Base price / cm²",
      "minPricePerSession": "Minimum price / session",
      "pmuPrice": "PMU price",
      "allMultipliersPlatformDefault": "All multipliers (colour, depth, age…) use the platform default.",
      "adjustedMultipliers": "Adjusted multipliers ({{count}})",
      "multiplierValue": "× {{value}}",
      "aiPricingHint": "These values drive AI price calculation and session estimates for this studio’s customers.",
      "toasts": {
        "loadFailed": "Could not load configuration.",
        "saved": "Prices saved."
      }
    },
    "sessions": {
      "title": "Session prediction",
      "desc": "Platform parameters for estimated session count. The live calculator shows immediately how factors affect min/max sessions.",
      "testModeHint": "Test mode: parameters may be changed locally to check the live calculator — only Elaya administration can save. After an admin save, this view updates live.",
      "viewOnlyHint": "Visible to the studio, not editable. On each new case creation, lifestyle, skin type, colours, cover-up and other factors flow automatically into min/max sessions. Admin updates appear live.",
      "noParameters": "No parameters configured.",
      "resetToSaved": "Reset to saved values",
      "toasts": {
        "loadFailed": "Could not load session prediction.",
        "adminUpdated": "Session prediction was updated by admin"
      }
    },
    "hours": {
      "title": "Opening hours",
      "desc": "Opening window per weekday (From–To). Customers see hourly booking times on mobile within this window — e.g. 9:00–19:00 → 9:00, 10:00, … 18:00. Individual days (extra open or closed) are below.",
      "bufferLabel": "Buffer time",
      "bufferValue": "{{minutes}} min",
      "bufferInputLabel": "Buffer time after appointments (minutes)",
      "bufferHint": "Time between consecutive appointments.",
      "slotCountSuffix": "({{count}} times)",
      "slotPreviewTruncated": "{{first}}, {{second}}, … {{last}} ({{count}} times)",
      "weekdays": {
        "mo": "Monday",
        "di": "Tuesday",
        "mi": "Wednesday",
        "do": "Thursday",
        "fr": "Friday",
        "sa": "Saturday",
        "so": "Sunday"
      },
      "exceptions": {
        "title": "Individual days",
        "desc": "Extra open days or closed days (e.g. holidays) — independent of the weekly schedule.",
        "empty": "No individual days configured yet.",
        "openWithRange": "Open {{range}}",
        "removeDayAria": "Remove day",
        "addOrOverwrite": "Add or overwrite day",
        "date": "Date",
        "note": "Note",
        "notePlaceholder": "e.g. Holiday"
      },
      "toasts": {
        "loadFailed": "Could not load opening hours.",
        "saved": "Opening hours saved.",
        "exceptionsLoadFailed": "Could not load individual days.",
        "exceptionsSaved": "Available days saved.",
        "dateRequired": "Please select a date."
      }
    },
    "rooms": {
      "title": "Rooms & equipment",
      "desc": "Treatment rooms and laser devices for calendar and sessions.",
      "empty": "No rooms created yet.",
      "inactive": "Inactive",
      "colorAria": "Room colour",
      "fallbackName": "Room {{index}}",
      "removeAria": "Remove room",
      "name": "Name",
      "active": "Active",
      "laserBrand": "Laser brand",
      "laserBrandPlaceholder": "e.g. Candela",
      "laserModel": "Laser model",
      "laserModelPlaceholder": "e.g. GentleMax Pro",
      "addRoom": "Add room",
      "toasts": {
        "loadFailed": "Could not load rooms.",
        "nameRequired": "Every room needs a name.",
        "saved": "Rooms saved."
      }
    },
    "staff": {
      "title": "Staff",
      "desc": "Team roster for calendar and assignment. Login invitations follow in a later version.",
      "empty": "No staff recorded yet.",
      "inactive": "Inactive",
      "roomPrefix": "Room: {{name}}",
      "roomsTip": "Tip: First create at least one treatment room under “Rooms”.",
      "fallbackName": "Staff member {{index}}",
      "removeAria": "Remove staff member",
      "firstName": "First name",
      "lastName": "Last name",
      "role": "Role",
      "room": "Room",
      "noRoom": "— No room —",
      "active": "Active",
      "addStaff": "Add staff member",
      "roles": {
        "studioOwner": "Studio owner",
        "laserTherapist": "Laser therapist",
        "reception": "Reception",
        "other": "Other"
      },
      "toasts": {
        "loadFailed": "Could not load staff.",
        "nameRequired": "First and last name are required.",
        "saved": "Staff saved."
      }
    },
    "stripe": {
      "title": "Stripe Connect",
      "desc": "Connect your studio account to receive shop commission payouts (test mode available).",
      "notConfigured": "Stripe is not yet configured on the server (STRIPE_SECRET_KEY missing).",
      "onboardingComplete": "Onboarding complete",
      "onboardingOpen": "Onboarding pending",
      "testMode": "Test mode",
      "accountLabel": "Account:",
      "notConnected": "— not connected yet",
      "chargesPayouts": "Charges: {{charges}} · Payouts: {{payouts}}",
      "continueOnboarding": "Continue onboarding",
      "connectWithStripe": "Connect with Stripe",
      "refreshStatus": "Refresh status",
      "adminOnly": "Only a studio admin can connect Stripe.",
      "testModeHint": "In Stripe test mode you can fill onboarding forms with test data. Live client keys will be added later.",
      "toasts": {
        "loadFailed": "Could not load Stripe status",
        "statusUpdated": "Stripe status updated",
        "connectFailed": "Stripe Connect failed"
      }
    }
  },
  "studioPages": {
    "overview": {
      "title": "Dashboard",
      "viewCustomers": "View customers",
      "kpiActiveCustomers": "Active customers",
      "kpiTodayAppointments": "Appointments today",
      "kpiWeekRevenue": "Revenue this week",
      "kpiOpenAftercare": "Open aftercare",
      "todayAppointments": "Today's appointments",
      "viewAll": "View all",
      "noAppointmentsToday": "No appointments today",
      "headers": {
        "customer": "Customer",
        "case": "Case",
        "time": "Time",
        "session": "Session",
        "status": "Status"
      },
      "typeConsultation": "Consultation",
      "typeTreatment": "Treatment",
      "studioFallback": "Studio"
    },
    "today": {
      "title": "Today",
      "calendar": "Calendar",
      "appointments": "Appointments",
      "emptyTitle": "No appointments today",
      "emptyDesc": "Customers book via the app or the calendar.",
      "loadError": "Could not load appointments.",
      "headers": {
        "time": "Time",
        "customer": "Customer",
        "case": "Case",
        "type": "Type",
        "duration": "Duration",
        "status": "Status"
      },
      "types": {
        "beratung": "Consultation",
        "treatment": "Treatment",
        "first": "First appointment"
      },
      "statuses": {
        "gebucht": "Booked",
        "storniert": "Cancelled",
        "cancelled": "Cancelled",
        "completed": "Completed"
      },
      "minutes": "{{count}} min"
    },
    "customers": {
      "title": "Customers",
      "subtitle": "{{count}} customers",
      "newCustomer": "New customer",
      "searchPlaceholder": "Name, email or phone…",
      "emptyTitle": "No customers found",
      "emptySearch": "Try a different search.",
      "emptyHint": "Create the first customer.",
      "loadError": "Could not load customers.",
      "createSuccess": "Customer created successfully.",
      "createError": "Could not create customer.",
      "modalTitle": "Create new customer",
      "openCases": "{{count}} open",
      "headers": {
        "name": "Name",
        "email": "E-mail",
        "phone": "Phone",
        "pipeline": "Pipeline",
        "source": "Source",
        "cases": "Cases"
      },
      "sources": {
        "studio_eigen": "Studio",
        "plattform_vermittelt": "Platform",
        "studio_wechsel": "Transfer"
      },
      "filterAll": "All"
    },
    "customerDetail": {
      "backToCustomers": "All customers",
      "loadError": "Could not load customer.",
      "pipelineUpdated": "Pipeline updated.",
      "notesSaved": "Notes saved.",
      "saveError": "Could not save.",
      "caseCreateError": "Could not create case.",
      "customerUpdated": "Customer updated.",
      "transferInTitle": "Customer taken over via studio transfer",
      "transferInBody": "Medical record and Elaycoins belong to the customer and are visible here{{prev}}{{since}}. Transferred cases are marked “Transferred”.",
      "transferInPrev": " · previous: {{name}}",
      "transferInSince": " · since {{date}}",
      "elaycoins": "Elaycoins: {{count}}",
      "transferOutTitle": "This customer transferred to {{studio}}",
      "transferOutStudioFallback": "another studio",
      "transferOutBody": "Only treatments from your studio remain visible · record is read-only.",
      "sinceAccount": "Since {{date}} · Account: {{status}}",
      "edit": "Edit",
      "labels": {
        "email": "E-mail",
        "phone": "Phone",
        "birthDate": "Date of birth",
        "address": "Address",
        "lastLogin": "Last login",
        "accountStatus": "Account status"
      },
      "casesTitle": "Cases",
      "newCase": "New case",
      "noCases": "No cases yet.",
      "caseHeaders": {
        "ampel": "Flag",
        "caseId": "Case ID",
        "label": "Label",
        "status": "Status",
        "progress": "Progress",
        "lastSession": "Last session"
      },
      "appointmentsTitle": "Appointments",
      "noAppointments": "No appointments yet.",
      "apptHeaders": {
        "date": "Date",
        "time": "Time",
        "case": "Case",
        "type": "Type",
        "status": "Status"
      },
      "notesTitle": "Internal notes",
      "notesPlaceholder": "Internal notes…",
      "saveNotes": "Save notes",
      "pipelineTitle": "Pipeline",
      "studioTimeline": "Studio history",
      "current": "Current",
      "untilToday": "until today",
      "newCaseModal": "Create new case",
      "editModal": "Edit customer data",
      "activityTitle": "History",
      "transferred": "Transferred",
      "sources": {
        "studio_eigen": "Studio",
        "plattform_vermittelt": "Platform",
        "studio_wechsel": "Transfer"
      },
      "firmaGrund": {
        "registrierung": "Registration",
        "studio_anlage": "Created in studio",
        "studio_wechsel": "Studio transfer"
      },
      "caseTypes": {
        "tattoo": "Tattoo",
        "pmu": "PMU"
      },
      "apptTypes": {
        "beratung": "Consultation",
        "treatment": "Treatment",
        "first": "First treatment"
      },
      "apptStatuses": {
        "gebucht": "Booked",
        "storniert": "Cancelled",
        "cancelled": "Cancelled",
        "completed": "Completed"
      },
      "calendar": "Calendar",
      "pipelineStage": "Pipeline stage",
      "saveStage": "Save stage",
      "editFields": {
        "firstName": "First name *",
        "lastName": "Last name *",
        "email": "E-mail",
        "phone": "Phone",
        "birthDate": "Date of birth",
        "street": "Street",
        "postalCode": "Postal code",
        "city": "City",
        "country": "Country"
      }
    },
    "cases": {
      "title": "All cases",
      "subtitle": "{{count}} cases total",
      "searchPlaceholder": "Case ID, body area, customer…",
      "emptyTitle": "No cases found",
      "emptySearch": "Try a different search term.",
      "emptyHint": "No cases created yet.",
      "loadError": "Could not load cases.",
      "deleteSuccess": "Test case deleted (studio & customer app synced).",
      "deleteError": "Could not delete case.",
      "deleteConfirm": "Test delete active:\nReally delete {{label}}?\n\nThis also removes the case from the Customer App.",
      "thisCase": "this case",
      "deleting": "Deleting…",
      "deleteTest": "Delete test",
      "deleteTitle": "Delete test case",
      "deleteTransferredTitle": "Transferred cases cannot be deleted here.",
      "transferred": "Transferred",
      "lastSession": "Last: {{date}}",
      "headers": {
        "case": "Case",
        "customer": "Customer",
        "body": "Body area",
        "type": "Type",
        "sessions": "Sessions",
        "ampel": "Flag",
        "status": "Status"
      },
      "types": {
        "tattoo": "Tattoo",
        "pmu": "PMU"
      },
      "statusFilters": {
        "all": "All",
        "pending": "Pending",
        "active": "Active",
        "completed": "Completed",
        "loeschantrag_ausstehend": "Deletion pending"
      },
      "medicalFilters": {
        "all": "All flags",
        "rot": "🔴 Clarification",
        "orange": "🟡 Notes",
        "gruen": "🟢 Cleared"
      }
    },
    "caseDetail": {
      "loadError": "Could not load case.",
      "statusUpdated": "Status updated.",
      "saveError": "Could not save.",
      "backToCustomer": "To customer · {{name}}",
      "back": "Back",
      "transferred": "Transferred",
      "bookAppointment": "Book appointment",
      "newSession": "New session",
      "transferBannerTitle": "Case taken over from another studio",
      "transferBannerBody": "Medical history belongs to the customer and is visible here after the studio transfer.",
      "stats": {
        "sessions": "Sessions",
        "lastSession": "Last session",
        "calculatedPrice": "Calculated price",
        "confirmedPrice": "Confirmed price",
        "goal": "Goal",
        "systemAi": "System / AI",
        "studio": "Studio",
        "stillOpen": "Still open"
      },
      "tattooSection": "Tattoo details",
      "labels": {
        "type": "Type",
        "body": "Body area",
        "tattooType": "Tattoo style",
        "coverup": "Cover-up",
        "size": "Size",
        "ageYears": "Age (years)",
        "ageYearsValue": "{{years}} y",
        "colors": "Colors",
        "yes": "Yes",
        "no": "No"
      },
      "sessionsTitle": "Session log",
      "pendingApptsTitle": "Booked appointments — document session",
      "documentSession": "Document session",
      "emptySessionsPending": "No session documented yet. Choose “Document session” above so date, time and case are filled in.",
      "emptySessions": "No sessions recorded yet.",
      "sessionHeaders": {
        "nr": "No.",
        "date": "Date",
        "fade": "Fade %",
        "removal": "Rem. %",
        "payment": "Payment",
        "status": "Status"
      },
      "zonesTitle": "Zones",
      "zoneHeaders": {
        "id": "Zone ID",
        "body": "Body area",
        "area": "Area cm²",
        "progress": "Progress",
        "sessionsEst": "Sessions (est.)"
      },
      "statusTitle": "Status",
      "saveStatus": "Save status",
      "statuses": {
        "draft": "Draft",
        "pending": "Pending",
        "active": "Active",
        "completed": "Completed",
        "loeschantrag_ausstehend": "Deletion pending"
      },
      "sessionStatus": {
        "noShow": "No-show",
        "draft": "Draft",
        "completed": "Completed"
      },
      "internalFade": "{{pct}} internal",
      "booked": "Booked",
      "minutes": "{{count}} min",
      "caseTypes": {
        "tattoo": "Tattoo",
        "pmu": "PMU"
      },
      "tcTypes": {
        "amateur": "Amateur",
        "cosmetic": "Cosmetic",
        "professional": "Professional",
        "coverup": "Cover-up"
      },
      "goals": {
        "full_removal": "Full removal",
        "full": "Full removal",
        "partial_fade": "Partial fade",
        "lightening_for_coverup": "Lighten for cover-up"
      },
      "coverup": {
        "none": "No cover-up",
        "once": "Covered once",
        "multiple": "Covered multiple times",
        "unknown": "Unknown"
      },
      "apptTypes": {
        "beratung": "Consultation",
        "treatment": "Treatment",
        "first": "First treatment"
      },
      "estimateRequired": "Price and session range are required.",
      "estimateSaveFailed": "Save failed.",
      "adjustEstimateTitle": "Adjust estimate",
      "customerNotePlaceholder": "Note for the customer (optional)…",
      "estimatePanel": {
        "title": "AI calculation & confirmation",
        "statusOffen": "AI estimate — not yet confirmed",
        "statusBestaetigt": "Confirmed by studio",
        "statusAngepasst": "Adjusted by studio",
        "calculatedPrice": "Calculated price (system)",
        "confirmedPrice": "Confirmed studio price",
        "notConfirmed": "Not yet confirmed",
        "sessionRange": "Session range",
        "sessionsValue": "{{min}}–{{max}} sessions",
        "calculatedSessions": "Calculated sessions",
        "totalCost": "Total cost (min–max)",
        "note": "Note",
        "reviewTitle": "Studio review recommended",
        "reviewBody": "The calculation ran with incomplete or uncertain data. Please confirm or adjust.",
        "transparency": "The calculated price stays visible. After confirmation or adjustment, the studio price applies for the customer — both values remain transparent.",
        "confirm": "Confirm estimate",
        "adjust": "Adjust…",
        "reopen": "Reopen",
        "pricePerSession": "Price per session (CHF)",
        "sessionsMin": "Sessions min.",
        "sessionsMax": "Sessions max.",
        "customerNoteLabel": "Note for the customer (optional)",
        "cancel": "Cancel",
        "saveAdjustment": "Save adjustment",
        "toastConfirmed": "Confirmation saved",
        "toastAdjusted": "Adjustment saved",
        "toastReopened": "Estimate reopened",
        "toastChatNotified": "{{message}} — customer notified in chat"
      },
      "reviewTriggers": {
        "missing_size": "Size incomplete",
        "missing_colors": "Colours missing",
        "missing_fitzpatrick": "Skin type unclear",
        "missing_location": "Body area unclear",
        "missing_age": "Tattoo age missing",
        "missing_intake_photo": "No initial photo",
        "photo_full_visible": "Tattoo not fully visible",
        "photo_good_light": "Insufficient lighting",
        "photo_focus": "Photo out of focus",
        "photo_distance": "Unsuitable distance",
        "photo_no_filter": "Filter suspected",
        "sit_scarring": "Scarring / scar tissue",
        "sit_coverup": "Cover-up complexity",
        "sit_multicolour": "Multi-colour tattoo",
        "sit_large_area": "Large area"
      }
    },
    "appointments": {
      "title": "Appointments",
      "weekSubtitle": "CW {{week}} · {{count}} appointment{{plural}} this week · Click a day to change availability",
      "pluralSuffix": "s",
      "today": "Today",
      "groupAppointment": "Group appointment",
      "newAppointment": "New appointment",
      "loadError": "Could not load appointments.",
      "bookSuccess": "Appointment booked successfully.",
      "bookError": "Could not book appointment.",
      "bookNotAllowed": "Appointment not allowed.",
      "earliest": "Earliest: {{date}}.",
      "tooEarly": "Appointment too early. Earliest bookable from {{date}}.",
      "requiredFields": "Case, date and time are required.",
      "modalTitle": "Book new appointment",
      "availabilitySaved": "Availability saved.",
      "saveFailed": "Save failed.",
      "dayAvailabilityTitle": "Day availability",
      "editDayAvailability": "Edit availability for this day",
      "modes": {
        "weekly": "Use weekly schedule",
        "open": "Extra open / custom hours",
        "closed": "Close this day"
      },
      "note": "Note",
      "noteOptional": "optional",
      "noteHoliday": "e.g. holiday",
      "types": {
        "beratung": "Consultation",
        "treatment": "Treatment",
        "first": "First treatment"
      },
      "groupLabel": "Group ({{count}})",
      "months": [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      "daysShort": [
        "Mo",
        "Tu",
        "We",
        "Th",
        "Fr",
        "Sa",
        "Su"
      ],
      "selectCustomer": "Select customer…",
      "selectCustomerFirst": "Select a customer first…",
      "selectCase": "Select case…",
      "availabilityLoadError": "Could not load availability.",
      "earliestPrefix": "Earliest:",
      "dateRequired": "Date *",
      "timeRequired": "Time *",
      "type": "Type",
      "durationMin": "Duration (min)",
      "consultationExempt": "Consultation appointments are exempt from treatment lockouts.",
      "book": "Book",
      "save": "Save",
      "customer": "Customer *",
      "case": "Case *"
    },
    "aftercare": {
      "title": "Aftercare",
      "subtitle": "AI aftercare checks for your customers — healing progress and findings",
      "loadError": "Could not load aftercare checks.",
      "reviewSaved": "Studio review saved",
      "reviewError": "Could not save review.",
      "emptyAll": "No aftercare checks yet.",
      "emptyFilter": "No aftercare checks for this filter.",
      "photoAlt": "Aftercare photo",
      "days": "{{count}} days",
      "daysAfterSession": "{{count}} days after session",
      "contactRecommended": "Contact recommended",
      "studioContactRecommended": "Studio contact recommended",
      "modalFallbackTitle": "Aftercare check",
      "toCase": "Open case",
      "close": "Close",
      "headers": {
        "date": "Date",
        "customer": "Customer",
        "case": "Case",
        "ampel": "Flag",
        "title": "Title",
        "daysAfter": "Days after session",
        "contact": "Contact"
      },
      "filters": {
        "alle": "All",
        "rot": "Red",
        "orange": "Orange",
        "gruen": "Green"
      },
      "ampel": {
        "gruen": "Green",
        "orange": "Orange",
        "rot": "Red"
      },
      "healingStatus": {
        "normal": "Normal",
        "monitor": "Monitor",
        "delayed": "Delayed",
        "conspicuous": "Conspicuous"
      },
      "healingPhase": {
        "early": "Days 1–7 · Early phase",
        "healing": "Days 8–21 · Healing phase",
        "consolidation": "Day >21 · Consolidation",
        "unknown": "Time window unknown"
      },
      "healingAction": {
        "continue_aftercare": "Continue aftercare",
        "continue_monitoring": "Keep monitoring",
        "photo_again": "Recommend a new photo",
        "check_studio": "Studio check / contact"
      },
      "symptoms": {
        "erythema_level": "Redness",
        "swelling_level": "Swelling",
        "blistering_flag": "Blisters",
        "crusting_level": "Crusts",
        "pain_score": "Pain",
        "itching_level": "Itching",
        "hyperpigmentation_level": "Hyperpigmentation",
        "hypopigmentation_level": "Hypopigmentation",
        "infection_suspected": "Suspected infection",
        "oozing": "Oozing / open area",
        "warmth": "Warmth"
      },
      "reviewTitle": "Studio review (confirm or correct)",
      "autoAssessment": "Automatic assessment — please review.",
      "lastReviewed": "Last reviewed {{date}}",
      "systemStatus": " · System: {{status}}",
      "healingStatusLabel": "Healing status",
      "notesPlaceholder": "Internal studio note…",
      "confirmAssessment": "Confirm assessment",
      "correct": "Correct",
      "customerText": "Customer text (no diagnosis)",
      "recommendedAction": "Recommended action",
      "progressScore": " · Progress score {{score}}",
      "courseCustomer": "Course (customer)",
      "summary": "Summary",
      "redFlags": "Red flags",
      "yes": "Yes",
      "reviewRecommended": " · Studio review recommended",
      "structuredSymptoms": "Structured symptoms",
      "reportedSymptoms": "Reported symptoms",
      "recommendations": "Recommendations",
      "photo": "Photo",
      "photoFindings": "Photo findings (AI)"
    },
    "chat": {
      "title": "Customer chat",
      "subtitle": "Direct messages with customers",
      "customerFallback": "Customer",
      "inboxLoadError": "Could not load chat inbox",
      "openError": "Could not open chat",
      "messagesLoadError": "Could not load messages",
      "sendFailed": "Send failed",
      "liveSecure": "Secure · Live",
      "live": "Live",
      "connecting": "Connecting…",
      "conversations": "Conversations",
      "emptyInboxTitle": "No chats yet",
      "emptyInboxDesc": "Open a customer and start a message.",
      "toCustomers": "Go to customers →",
      "noMessagesYet": "No messages yet",
      "selectTitle": "Select a conversation",
      "selectDesc": "Choose a chat on the left or start one from the customer profile.",
      "customerTyping": "Customer is typing…",
      "liveChat": "Live chat",
      "writeFirst": "Write the first message.",
      "placeholder": "Write a message…",
      "sendAria": "Send"
    },
    "sessions": {
      "title": "Sessions",
      "subtitle": "{{count}} sessions total",
      "loadError": "Could not load sessions.",
      "searchPlaceholder": "Customer, case ID, session no.…",
      "emptyTitle": "No sessions found",
      "emptySearch": "Try a different search term.",
      "emptyHint": "No sessions documented yet.",
      "filters": {
        "all": "All",
        "completed": "Completed",
        "drafts": "Drafts"
      },
      "headers": {
        "nr": "No.",
        "date": "Date",
        "customer": "Customer",
        "case": "Case",
        "fade": "Fade %",
        "payment": "Payment",
        "status": "Status"
      },
      "status": {
        "noShow": "No-show",
        "draft": "Draft",
        "completed": "Completed"
      }
    },
    "sessionDetail": {
      "loadError": "Could not load session.",
      "finalizeSuccess": "Session completed successfully.",
      "finalizeError": "Could not finalize.",
      "title": "Session #{{number}}",
      "finalize": "Complete session",
      "draftBadge": "Draft",
      "noShowBadge": "No-show",
      "photoTitle": "Progress photo",
      "photoEmpty": "No progress photo yet.",
      "photoUpload": "Upload photo",
      "photoSaved": "Progress photo saved.",
      "photoError": "Could not upload photo.",
      "lighteningTitle": "Fade logic (studio)",
      "lighteningSaved": "Lightening review saved.",
      "lighteningSaveError": "Save failed.",
      "saveReview": "Save review",
      "comparisonPossible": "Comparison possible",
      "uncertainty": "Uncertainty",
      "direction": "Direction",
      "confidence": "Confidence",
      "customerValue": "Customer value",
      "internalEstimate": "Internal estimate",
      "lighteningScore": "Lightening score",
      "humanReview": "Human review",
      "yes": "yes",
      "no": "no",
      "notShown": "not shown",
      "flagQuality": "Image quality sufficient",
      "flagAngle": "Similar angle",
      "flagDistance": "Similar distance / crop",
      "flagLight": "Comparable lighting",
      "optional": "optional",
      "studioOverridePct": "Studio override %",
      "studioNote": "Studio note",
      "aiTitle": "AI fade analysis",
      "aiSaved": "AI fade analysis saved.",
      "aiError": "AI analysis failed.",
      "runAi": "Run AI analysis",
      "fadeCustomer": "Fade (customer-visible)",
      "fadeInternal": "Fade internal (studio)",
      "progressDirection": "Progress direction",
      "assessment": "Assessment",
      "progress": "Progress",
      "recCustomer": "Recommendation (customer)",
      "recStudio": "Recommendation (studio)",
      "lifestyleTips": "Lifestyle tips",
      "general": "General",
      "date": "Date",
      "time": "Time",
      "durationMin": "Duration (min)",
      "minutes": "{{count}} min",
      "sessionId": "Session ID",
      "staff": "Staff",
      "room": "Room",
      "laserParams": "Laser parameters",
      "brand": "Brand",
      "model": "Model",
      "laserType": "Laser type",
      "wavelengths": "Wavelengths",
      "fluence": "Fluence J/cm²",
      "spotSize": "Spot size",
      "frequency": "Frequency",
      "passes": "Passes",
      "outcome": "Treatment outcome",
      "removal": "Removal",
      "painScale": "Pain scale",
      "endpoint": "Endpoint reaction",
      "payment": "Payment",
      "amount": "Amount",
      "method": "Method",
      "discount": "Discount",
      "meta": "Meta",
      "createdAt": "Created at",
      "directions": {
        "improving": "Improving",
        "stable": "Stable",
        "worsening": "Worsening",
        "unclear": "Unclear"
      },
      "payments": {
        "bar": "Cash",
        "karte": "Card",
        "twint": "TWINT",
        "rechnung": "Invoice"
      },
      "photoAlt": "Progress photo",
      "photoReplace": "Replace photo",
      "lighteningHint": "Customers only see a percentage for a comparable photo pair (comparison possible = yes). Internal estimate and uncertainty stay studio-internal.",
      "reasons": "Reasons: {{list}}",
      "photoComparability": "Photo comparability",
      "studioCorrectionPct": "Studio correction %",
      "reviewNote": "Review note",
      "saveComparisonReview": "Save comparison & review",
      "aiFirstSession": "On the first session there is no treatment photo to compare yet. The before photo is stored and used for AI analysis from session 2 onward.",
      "aiNoneYet": "No analysis run yet.",
      "aiUploadFirst": " Upload a progress photo first.",
      "noReliableComparison": "No reliable comparison",
      "customersNoSafePct": "Customers do not see a reliable fade percentage.",
      "internalEstimatePct": " Internal estimate: {{pct}}%.",
      "uncertaintyValue": " Uncertainty: {{level}}.",
      "reasonsInline": " Reasons: {{list}}.",
      "importantNote": "Important note",
      "analyzedAt": "Analysed on {{date}}",
      "minutesShort": "{{count}} min",
      "noShowBanner": "Customer did not attend (no-show)",
      "coolingUsed": "Cooling was used",
      "adverseEvent": "Adverse event",
      "notes": "Notes",
      "details": "Details"
    },
    "newSession": {
      "noCase": "No case selected.",
      "caseLoadError": "Could not load case.",
      "apptWrongCase": "This appointment does not belong to this case.",
      "apptLoadError": "Could not load appointment. Please check date and time.",
      "dateRequired": "Treatment date is required.",
      "photoUploading": "Uploading photo…",
      "photoFailed": "Session saved, but the photo could not be uploaded.",
      "aiAnalyzing": "AI analysing…",
      "aiSaved": "Session completed — AI fade analysis saved.",
      "aiFailed": "Session saved, but AI analysis failed.",
      "draftWithPhoto": "Draft with photo saved.",
      "draftSaved": "Draft saved.",
      "sessionDone": "Session completed successfully.",
      "saveError": "Could not save.",
      "caseFallback": "Case",
      "fromAppointment": " · taken from appointment",
      "title": "Session #{{number}}",
      "backToCase": "Back to case",
      "cancel": "Cancel",
      "saveDraft": "Save as draft",
      "complete": "Complete session",
      "selectOption": "— Select —",
      "linkedApptHint": "Date, time and case are taken from the booked appointment{{when}}. Please add laser parameters.",
      "linkedAppt": "Linked to appointment{{when}}.",
      "general": "General",
      "dateRequiredLabel": "Date *",
      "time": "Time",
      "durationMin": "Duration (min)",
      "staff": "Staff",
      "staffPh": "Dr. Example",
      "room": "Room",
      "roomPh": "Room 1",
      "noShow": "No-show",
      "noShowHint": "Customer did not attend the appointment",
      "laserParams": "Laser parameters",
      "brand": "Brand",
      "model": "Model",
      "laserType": "Laser type",
      "wavelengths": "Wavelengths (nm)",
      "wavelengthsHint": "Comma-separated",
      "fluence": "Fluence J/cm²",
      "spotMm": "Spot (mm)",
      "freqHz": "Frequency (Hz)",
      "passes": "Passes",
      "cooling": "Cooling used",
      "outcome": "Treatment outcome",
      "fadeStudio": "Fade (studio estimate)",
      "removal": "Removal",
      "painScale": "Pain scale",
      "endpoint": "Endpoint reaction",
      "endpointPh": "Frosting, redness, swelling…",
      "adverse": "Adverse event",
      "adverseHint": "Complication or unexpected reaction occurred",
      "adverseType": "Type of event",
      "adverseTypePh": "Blistering, hyperpigmentation…",
      "photoTitle": "Progress photo",
      "photoAlt": "Progress photo",
      "photoRemoveAria": "Remove photo",
      "photoSelect": "Select photo",
      "photoHintNext": "Current photo of the treated area — basis for AI fade analysis vs. the previous session.",
      "photoHintFirst": "Before photo of the treated area. Always save before the first treatment — from session two it is needed for progress comparison. No AI analysis on the first session.",
      "aiAuto": "Start AI fade analysis automatically",
      "aiAutoHint": "Compares this photo with the previous session photo (not for drafts)",
      "payment": "Payment",
      "amountChf": "Amount (CHF)",
      "paymentMethod": "Payment method",
      "none": "—",
      "cash": "Cash",
      "card": "Card",
      "twint": "TWINT",
      "discountChf": "Discount (CHF)",
      "notes": "Notes",
      "specialNotes": "Special notes",
      "notesPh": "Internal session notes…"
    },
    "shop": {
      "title": "ElayShop",
      "subtitle": "Your customers' orders · shipping status & commission payout",
      "loadForbidden": "No permission — please sign out as studio and sign in again.",
      "loadError": "Could not load orders.",
      "statusUpdated": "Status updated.",
      "statusError": "Could not save status.",
      "emptyTitle": "No shop orders",
      "emptyDesc": "Orders appear here when customers shop in ElayShop. Dev: npm run seed:shop",
      "kpiOrders": "Orders",
      "kpiRevenue": "Revenue",
      "kpiProvOpen": "Commission open",
      "kpiProvPaid": "Commission paid",
      "headers": {
        "date": "Date",
        "customer": "Customer",
        "products": "Products",
        "amount": "Amount",
        "prov": "Comm.",
        "payout": "Payout",
        "status": "Status"
      },
      "status": {
        "bestellt": "Ordered",
        "versendet": "Shipped",
        "geliefert": "Delivered"
      },
      "commission": {
        "paid": "Paid out",
        "cancelled": "Cancelled",
        "open": "Open"
      },
      "detailsTitle": "Order {{number}}",
      "detailsFallback": "Order details",
      "labelDate": "Date",
      "labelStatus": "Status",
      "labelCustomer": "Customer",
      "labelPayment": "Payment",
      "simulated": "(simulated)",
      "products": "Products",
      "noProducts": "No products",
      "goodsValue": "Goods value",
      "shipping": "Shipping ({{country}})",
      "gross": "Gross",
      "provision": "Commission ({{pct}}%)",
      "payout": "Payout",
      "shippingAddress": "Shipping address",
      "showDetails": "Show details",
      "footerHint": "Only shipping status is editable. Amount and commission are read-only. Tap product names for order details."
    },
    "transfers": {
      "title": "Studio transfers",
      "subtitle": "Incoming and outgoing transfer requests — approved by Elaya",
      "loadError": "Could not load transfer requests.",
      "info": "Transfer requests are reviewed and approved by <strong>Elaya platform admin</strong> (handoff §10.15). Studios can view requests but cannot accept them. <strong>Incoming</strong> = customer joins you · <strong>Outgoing</strong> = customer leaves your studio. After approval the customer appears at the destination studio including medical record and Elaycoins. <strong>Joined</strong> = customer joined at the source studio · <strong>Transfer</strong> = approved by Elaya.",
      "filters": {
        "open": "Open",
        "approved": "Approved",
        "rejected": "Rejected",
        "all": "All"
      },
      "emptyTitle": "No transfer requests",
      "emptyDesc": "Incoming requests (customers to you) and outgoing requests (customers leaving you) appear here.",
      "headers": {
        "request": "Request",
        "joined": "Joined",
        "transfer": "Transfer",
        "direction": "Direction",
        "customer": "Customer",
        "fromStudio": "From studio",
        "toStudio": "To studio",
        "status": "Status"
      },
      "status": {
        "ausstehend": "Pending (Elaya)",
        "genehmigt": "Approved",
        "abgelehnt": "Rejected"
      },
      "direction": {
        "eingehend": "Incoming",
        "ausgehend": "Outgoing"
      }
    },
    "elaycoins": {
      "title": "Elaycoins",
      "subtitle": "Coin balances, credits and redemptions for your customers",
      "loadError": "Could not load Elaycoins.",
      "kpiTotal": "Coins total",
      "kpiWithBalance": "Customers with balance",
      "kpiCredited": "Credited (page)",
      "kpiRedeemed": "Redeemed (page)",
      "emptyTitle": "No customers",
      "emptyDesc": "Create customers to see coin accounts.",
      "headers": {
        "customer": "Customer",
        "email": "E-mail",
        "source": "Source",
        "balance": "Balance",
        "credited": "Credited",
        "redeemed": "Redeemed"
      },
      "sources": {
        "studio_eigen": "Studio",
        "plattform_vermittelt": "Platform",
        "studio_wechsel": "Transfer"
      },
      "txTitle": "Recent transactions",
      "footerHint": "Studios award coins via treatments and appointments. Manual corrections only by platform admin. Stripe payout of shop commission follows once account details are available."
    },
    "analytics": {
      "title": "Analytics",
      "subtitle": "Revenue, sessions & customers",
      "periods": {
        "month": "This month",
        "quarter": "Quarter",
        "year": "This year",
        "all": "All time"
      },
      "kpiRevenue": "Revenue",
      "kpiSessionsDone": "Sessions completed",
      "kpiAvgPerSession": "Ø {{amount}} / session",
      "kpiNoShows": "No-shows",
      "kpiNoShowRate": "{{pct}} rate",
      "kpiCancelled": "Cancelled appointments",
      "kpiCancelledOf": "{{pct}} of {{total}}",
      "chartRevenueTitle": "Revenue — last 6 months",
      "chartRevenueSub": "Completed sessions",
      "activeCustomers": "Active customers",
      "noCustomers": "No customers yet",
      "sessionsOverview": "Sessions — overview",
      "statDone": "Completed",
      "statNoShow": "No-show",
      "statAvgRevenue": "Ø revenue",
      "statApptsTotal": "Appointments total",
      "revenueBySource": "Revenue by source",
      "revenueBySourceSub": "Treatment revenue excluding no-shows",
      "totalTreatmentRevenue": "Total treatment revenue",
      "sessionCount": "{{count}} session(s)",
      "feeLine": " · {{pct}}% fee: {{amount}}",
      "akquise": {
        "studio_eigen": "Studio-owned",
        "plattform_vermittelt": "Platform",
        "studio_wechsel": "Transfer"
      },
      "shopProvision": "Shop commission",
      "shopProvisionSub": "{{pct}}% on ElayShop purchases",
      "orders": "Orders",
      "shopRevenue": "Shop revenue",
      "provision": "Commission",
      "elaycoins": "Elaycoins",
      "elaycoinsSub": "Overview for the selected period",
      "coinsTotal": "Coins total (studio)",
      "customersWithBalance": "Customers with balance",
      "rewardedInPeriod": "Awarded in period",
      "nettoTitle": "Net overview (approx.)",
      "nettoSub": "Rough calculation for the selected period",
      "treatmentRevenue": "Treatment revenue",
      "platformFee": "− Platform fee ({{pct}}%)",
      "plusShopProvision": "+ Shop commission",
      "nettoApprox": "Net (approx.)"
    },
    "crm": {
      "title": "Lead pipeline",
      "subtitle": "{{count}} customers · stages are calculated automatically",
      "tabPipeline": "Pipeline",
      "tabList": "List",
      "tabTasks": "Tasks",
      "searchPlaceholder": "Name, e-mail or phone…",
      "pipelineLoadError": "Could not load pipeline.",
      "tasksLoadError": "Could not load tasks.",
      "noTemplate": "No template for this stage.",
      "templateCopied": "Message copied to clipboard.",
      "templateError": "Could not load template.",
      "emptyTitle": "No customers in the pipeline",
      "emptyDesc": "Create customers — they appear automatically in the matching stage.",
      "noCustomers": "No customers",
      "showMore": "+ {{count}} more",
      "noHits": "No matches.",
      "copyMessage": "Copy message",
      "copyTemplate": "Copy template",
      "note": "Note",
      "task": "Task",
      "template": "Template",
      "todayInStage": "Today in stage",
      "daysInStage": "{{count}} d in stage",
      "openCases": "{{count}} open",
      "headers": {
        "name": "Name",
        "email": "E-mail",
        "ampel": "Flag",
        "stage": "Stage",
        "inStage": "In stage",
        "lastContact": "Last contact",
        "nextTask": "Next task"
      },
      "sources": {
        "studio_eigen": "Studio",
        "plattform_vermittelt": "Platform",
        "studio_wechsel": "Transfer"
      }
    },
  },
  "adminPages": {
    "dashboard": {
      "title": "Admin Dashboard"
    },
    "studios": {
      "title": "Studios",
      "subtitle": "Approve / lock · Package management under Features",
      "empty": "No studios",
      "loadError": "Could not load studios",
      "statusUpdated": "Status updated",
      "statusUpdateFailed": "Status update failed",
      "pricingLoadError": "Could not load pricing configuration",
      "pricingSaved": "Prices saved",
      "saveFailed": "Save failed",
      "prices": "Prices",
      "activate": "Activate",
      "lock": "Lock",
      "pricingModalTitle": "Prices · {{name}}",
      "save": "Save"
    },
    "settings": {
      "title": "Settings",
      "subtitle": "Session prediction — change parameters and see the session range in the live calculator. Saving applies platform-wide (socket).",
      "loadError": "Could not load session prediction",
      "updatedReload": "Session prediction was updated — reloading…",
      "saved": "Session prediction saved — studio & apps update live",
      "saveFailed": "Save failed",
      "noParameters": "No parameters loaded.",
      "save": "Save"
    },
    "overview": {
      "title": "Admin overview",
      "subtitle": "Platform KPIs · shop commission · Elaycoins (Stripe Connect pending)",
      "studios": "Studios",
      "shopRevenue": "Shop revenue",
      "provisionOpen": "Studio commission (open)",
      "coinsTotal": "Elaycoins total",
      "provisionStandard": "Default commission: {{pct}}% to studios · Stripe Connect: {{stripe}}",
      "stripeActive": "active",
      "stripePending": "pending (keys pending)",
      "topStudios": "Top studios by shop revenue: {{list}}"
    },
    "finance": {
      "title": "Finance",
      "subtitle": "Shop revenue & studio commissions ({{pct}}% default). Stripe Connect payout: pending.",
      "revenue": "Revenue (goods value)",
      "elayaShare": "Elaya share",
      "provisionOpen": "Commission open",
      "provisionPaid": "Commission paid",
      "empty": "No shop revenue yet",
      "headers": {
        "studio": "Studio",
        "orders": "Orders",
        "revenue": "Revenue",
        "provisionTotal": "Commission total",
        "open": "Open",
        "paid": "Paid out"
      }
    },
    "features": {
      "title": "Feature management",
      "subtitle": "Plans (Basic / Professional / Enterprise) · global switches · studio overrides",
      "loadError": "Could not load features",
      "planUpdated": "Plan updated",
      "planError": "Could not save plan",
      "overrideError": "Override failed",
      "globalUpdated": "Global features updated",
      "globalError": "Global features failed",
      "globalTitle": "Global feature switches",
      "planDefaults": "Plan defaults — Basic: {{basic}} · Professional: {{pro}} · Enterprise: {{ent}} features",
      "forceOn": "Force ON",
      "forceOff": "Force OFF",
      "planDefault": "Plan default"
    },
    "elaycoins": {
      "title": "Elaycoins (platform)",
      "subtitle": "Customer balances belong to the customer · cross-studio overview · admin corrections",
      "loadError": "Could not load Elaycoins",
      "adjustSaved": "Correction saved",
      "adjustError": "Correction failed",
      "search": "Search",
      "searchPh": "Name or e-mail",
      "searchBtn": "Search",
      "kpiTotal": "Coins total",
      "kpiWithBalance": "Customers with balance",
      "kpiCustomers": "Customers",
      "empty": "No customers",
      "studioBalance": "Studio: {{studio}} · Balance: ",
      "adjust": "Correct",
      "modalTitle": "Elaycoin correction",
      "modalIntro": "{{name}} · currently {{balance}} coins",
      "coinsLabel": "Coins (+ credit / − deduct)",
      "reason": "Reason",
      "save": "Save"
    },
    "shop": {
      "title": "Shop (platform)",
      "subtitle": "Products, orders and studio commissions",
      "productsLoadError": "Could not load products",
      "ordersLoadError": "Could not load orders",
      "productCreated": "Product created",
      "productUpdated": "Product saved",
      "saveFailed": "Save failed",
      "statusError": "Could not change status",
      "provisionUpdated": "Commission updated",
      "provisionStripe": "Commission paid out via Stripe Transfer",
      "provisionError": "Could not update commission",
      "tabProducts": "Products",
      "tabOrders": "Orders",
      "noProducts": "No products",
      "noProductsDesc": "Create the first product.",
      "noOrders": "No orders",
      "editProduct": "Edit product",
      "newProduct": "New product",
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "deactivate": "Deactivate",
      "activate": "Activate",
      "active": "Active",
      "inactive": "Inactive",
      "markPaidManual": "Marked paid manually",
      "viaStripe": "Via Stripe",
      "reset": "Reset",
      "headers": {
        "name": "Name",
        "sku": "Item no.",
        "price": "Price",
        "stock": "Stock",
        "status": "Status",
        "order": "Order",
        "studio": "Studio",
        "customer": "Customer",
        "revenue": "Revenue",
        "provision": "Commission",
        "payout": "Payout"
      },
      "form": {
        "name": "Name",
        "productCode": "Product code",
        "sku": "Item number",
        "description": "Description",
        "priceChf": "Price CHF",
        "stock": "Stock",
        "stockPh": "empty = unlimited",
        "category": "Category",
        "imageUrl": "Image URL",
        "active": "Active"
      },
      "categories": {
        "Nachsorge": "Aftercare",
        "Sonnenschutz": "Sun protection",
        "Reinigung": "Cleansing",
        "Zubehör": "Accessories",
        "Sonstiges": "Other"
      }
    },
    "transfers": {
      "title": "Studio transfers",
      "subtitle": "Approve or reject requests",
      "loadError": "Could not load transfers",
      "approved": "Approved",
      "approveError": "Approval failed",
      "rejected": "Rejected",
      "rejectError": "Rejection failed",
      "reasonRequired": "Please provide a rejection reason",
      "empty": "No requests",
      "customerFallback": "Customer",
      "approve": "Approve",
      "reject": "Reject",
      "rejectTitle": "Reject transfer",
      "rejectReason": "Rejection reason",
      "rejectPh": "Reason for rejection",
      "cancel": "Cancel",
      "statuses": {
        "ausstehend": "Pending",
        "pending": "Pending",
        "genehmigt": "Approved",
        "abgelehnt": "Rejected"
      }
    },
  },
  "components": {
    "pagination": {
      "ofTotal": "{{from}}–{{to}} of {{total}}",
      "prev": "Back",
      "next": "Next",
      "page": "Page {{page}} / {{total}}",
      "prevAria": "Previous page",
      "nextAria": "Next page"
    },
    "preSessionCheck": {
      "title": "Pre-treatment check",
      "hint": "UV exposure and medication affect the lockout period.",
      "medsLabel": "Medication (last intake)",
      "uv": {
        "keine": "None",
        "leicht": "Light",
        "mittel": "Moderate (+21 days)",
        "intensiv": "Intense (+28 days)"
      },
      "meds": {
        "keine": "None",
        "retinoide": "Retinoids (+180 days)",
        "antibiotika": "Antibiotics (+14 days)",
        "antidepressiva": "Antidepressants (+14 days)"
      }
    },
    "caseWizard": {
      "stepOf": "Step {{current}} / {{total}}"
    },
    "caseIntakePhotos": {
      "close": "Close"
    },
    "customerForm": {
      "required": "Required",
      "firstName": "First name",
      "lastName": "Last name",
      "email": "E-mail",
      "phone": "Phone",
      "birthDate": "Date of birth",
      "street": "Street",
      "postalCode": "Postal code",
      "city": "City",
      "country": "Country",
      "notes": "Notes (internal)",
      "notesPh": "Internal remarks…",
      "cancel": "Cancel",
      "submit": "Create customer",
      "countries": {
        "Schweiz": "Switzerland",
        "Deutschland": "Germany",
        "Österreich": "Austria",
        "Frankreich": "France",
        "Italien": "Italy",
        "Anderes": "Other"
      }
    },
    "groupBooking": {
      "title": "Group appointment",
      "intro": "Multiple tattoos for the same customer in one appointment. Discount {{pct}}%. Max. {{max}} size points (Small=1, Medium=2, Large=4 alone).",
      "customer": "Customer *",
      "selectCustomer": "Select customer…",
      "selectCases": "Select cases * ({{count}} selected · {{points}}/{{max}} pts)",
      "selectCustomerFirst": "Select a customer first…",
      "noEligible": "No eligible tattoo cases (PMU and completed cases are excluded).",
      "areaNa": "Area n/a",
      "perSession": "/session",
      "priceOverview": "Price overview ({{pct}}% group discount)",
      "subtotal": "Subtotal",
      "discount": "Discount −{{pct}}%",
      "total": "Total",
      "lockoutLoading": "Loading lockout periods…",
      "lockoutTitle": "Lockout (strictest case)",
      "earliest": "Earliest: {{date}}",
      "noLockout": "No lockout — appointment freely selectable.",
      "dateRequired": "Date *",
      "timeRequired": "Time *",
      "durationMin": "Duration (min)",
      "cancel": "Cancel",
      "book": "Book group appointment",
      "minCases": "Select at least 2 tattoos for a group appointment.",
      "dateTimeRequired": "Date and time are required.",
      "tooEarly": "Appointment too early. Earliest bookable from {{date}}.",
      "bookSuccess": "Group appointment booked ({{count}} cases).",
      "bookError": "Could not book group appointment.",
      "notAllowed": "Appointment not allowed."
    },
    "groupDetail": {
      "title": "Group appointment",
      "timeSuffix": " · {{time}}",
      "minutes": " · {{count}} min",
      "status": "Status: {{status}}",
      "groupCases": "Group appointment ({{count}} cases)",
      "openRecord": " · Open record",
      "discount": "Group discount {{pct}}%",
      "applied": "applied",
      "total": "Total",
      "hint": "Each case still needs its own session documentation. Tap a case to open the record.",
      "close": "Close",
      "types": {
        "beratung": "Consultation",
        "treatment": "Treatment",
        "first": "First treatment"
      },
      "tattoo": "Tattoo",
      "pmu": "PMU"
    },
    "crmTasks": {
      "done": "Done.",
      "updateError": "Could not update.",
      "deleted": "Task deleted.",
      "deleteError": "Could not delete.",
      "general": "General",
      "due": "Due: {{date}}",
      "completeTitle": "Complete",
      "deleteTitle": "Delete",
      "loading": "Loading tasks…",
      "newTask": "+ New task",
      "emptyTitle": "No tasks",
      "emptyDesc": "Create follow-ups and reminders for your leads.",
      "allDone": "All tasks done!",
      "overdue": "Overdue",
      "today": "Today",
      "thisWeek": "This week",
      "later": "Later",
      "recentlyDone": "Recently completed"
    },
    "pricing": {
      "intro": "These values control AI price calculation and session estimates for this studio's customers. Empty fields use the platform default.",
      "platformDefault": "Platform default",
      "groups": {
        "base": "Base prices",
        "color": "Colour multipliers",
        "depth": "Needle depth",
        "age": "Tattoo age",
        "skin": "Skin type (Fitzpatrick)",
        "location": "Body area",
        "layering": "Layering / cover-up",
        "goal": "Treatment goal"
      },
      "fields": {
        "basePricePerCm2": "Base price / cm² (CHF)",
        "minPrice": "Minimum price / session (CHF)",
        "pmuPrice": "PMU price (CHF)",
        "color_black": "Black",
        "color_mixed": "Mixed",
        "color_multi": "Multicolour",
        "color_difficult": "Difficult colours (white/yellow/skin)",
        "depth_shallow": "Shallow",
        "depth_normal": "Normal",
        "depth_deep": "Deep",
        "depth_very_deep": "Very deep",
        "age_under1": "under 1 year",
        "age_1to3": "1–3 years",
        "age_3to5": "3–5 years",
        "age_5to10": "5–10 years",
        "age_over10": "over 10 years",
        "skin_1": "Type I",
        "skin_2": "Type II",
        "skin_3": "Type III",
        "skin_4": "Type IV",
        "skin_5": "Type V",
        "skin_6": "Type VI",
        "location_arm": "Arm",
        "location_leg": "Leg",
        "location_torso": "Torso",
        "location_neck": "Neck",
        "location_face": "Face",
        "location_hand": "Hand",
        "location_foot": "Foot",
        "layering_none": "None",
        "layering_once": "Once",
        "layering_multi": "Multiple",
        "goal_full": "Full removal",
        "goal_partial": "Partial lightening",
        "goal_lighten": "Lighten for cover-up"
      }
    },
    "sessionPrediction": {
      "previewFailed": "Preview failed",
      "sessionsUnit": "sessions",
      "exampleCase": "Example case",
      "plausibilityTitle": "Excel plausibility (examples 1–3)",
      "plausibilityHint": "Master Excel §7: price/session × session range must match these reference cases.",
      "sessionsRange": "{{min}}–{{max}} sessions",
      "liveTitle": "Live calculator · session prediction",
      "liveSubtitle": "Change parameters → forecast updates immediately (without saving). Same engine as case creation.",
      "presets": {
        "example_1": "Excel §7 · Small black tattoo (6–8)",
        "example_2": "Excel §7 · Colourful tattoo (10–14)",
        "example_3": "Excel §7 · Cover-up hand (12–16)"
      },
      "saved": "Saved",
      "liveDraft": "Live (draft)",
      "changeSessions": "Change {{minDelta}} / {{maxDelta}} sessions",
      "currentForecast": "Current forecast",
      "aftercareInFormula": "aftercare",
      "tattooDeltaLabel": "Tattoo delta",
      "lifestyleLabel": "Lifestyle",
      "lifestyleScoreLine": "Score {{score}} · ×{{mult}}",
      "midConfidence": "Mid / confidence",
      "activeFactors": "Active tattoo factors",
      "noDeltas": "No tattoo deltas ≠ 0 — simple forecast (±1 session around the mid).",
      "loadPreview": "Load preview",
      "formulaHint": "Formula: (base + tattoo deltas) × lifestyle multiplier → session mid, then min/max range. Lifestyle score 1 = ×0.85 (optimal), score 5 = ×1.50 (strongly impaired). Customers do not see these parameters.",
      "baseSection": "Base & range",
      "lifestyleComposite": "Lifestyle composite",
      "lifestyleCompositeHint": "Seven main factors averaged: smoking, alcohol, sleep (quality+hours as one score), stress, activity (incl. sport), hydration, nutrition. Aftercare does not enter the score. BMI ≥30 raises the score to at least 4, ≥35 to 5.",
      "lifestyleMultipliers": "Lifestyle multipliers",
      "aftercareSection": "Aftercare readiness (extra max sessions)",
      "avgUpTo": "Avg up to",
      "score": "Score",
      "multiplier": "Multiplier",
      "base": {
        "base_sessions": "Base sessions",
        "min_sessions": "Minimum",
        "max_sessions": "Maximum",
        "range_minus": "Range −",
        "range_plus": "Range +"
      },
      "baseHints": {
        "base_sessions": "Standard tattoo = 8",
        "range_minus": "Min = mid − this value",
        "range_plus": "Max = mid + this value"
      },
      "tattooGroupTitles": {
        "fitzpatrick": "Fitzpatrick (delta)",
        "location": "Body location (delta)",
        "color": "Colours — hardest colour counts (delta)",
        "color_count": "Colour count (delta, if higher than hardest colour)",
        "scarring": "Scars / keloid risk (delta)",
        "density": "Density (delta)",
        "saturation": "Saturation (delta)",
        "coverup": "Cover-up / layering (delta)",
        "age": "Tattoo age (delta)",
        "prior_treatment": "Prior treatment (delta)",
        "type": "Tattoo type (delta)",
        "goal": "Removal goal (delta)",
        "laser_profile": "Laser / studio quality (delta)",
        "healing_history": "Healing history (delta, once history exists)",
        "lightening_rate": "Lightening rate (delta, from 2 comparison photos)"
      },
      "tattooFields": {
        "fitzpatrick": {
          "I": "Type I",
          "II": "Type II",
          "III": "Type III",
          "IV": "Type IV",
          "V": "Type V",
          "VI": "Type VI",
          "unsicher": "Unsure"
        },
        "location": {
          "arm": "Arm",
          "leg": "Leg",
          "chest": "Chest",
          "back": "Back",
          "shoulder": "Shoulder",
          "abdomen": "Abdomen",
          "hip": "Hip",
          "neck": "Neck",
          "face": "Face",
          "hand": "Hand",
          "foot": "Foot",
          "other": "Other"
        },
        "color": {
          "black": "Black",
          "grey": "Grey",
          "red": "Red",
          "orange": "Orange",
          "blue": "Blue",
          "green": "Green",
          "purple": "Purple",
          "yellow": "Yellow",
          "white": "White",
          "skin_tone": "Skin tone"
        },
        "color_count": {
          "none": "Black/grey only",
          "one_two": "Black + 1–2 colours",
          "three_plus": "Colourful 3+ colours"
        },
        "scarring": {
          "low": "Low",
          "medium": "Medium",
          "high": "High",
          "unsure": "Unsure"
        },
        "density": {
          "low": "Low",
          "medium": "Medium",
          "high": "High",
          "very_high": "Very high"
        },
        "saturation": {
          "low": "Low",
          "medium": "Medium",
          "high": "High",
          "very_high": "Very high"
        },
        "coverup": {
          "none": "None",
          "once": "Covered once",
          "multiple": "Multiple",
          "unknown": "Unknown"
        },
        "age": {
          "under_1": "under 1 year",
          "age_1_3": "1–3 years",
          "age_4_7": "4–7 years",
          "age_8_15": "8–15 years",
          "over_15": "over 15 years",
          "unknown": "Unknown"
        },
        "prior_treatment": {
          "none": "None",
          "some": "1–2 sessions",
          "many": "3+ sessions"
        },
        "type": {
          "amateur": "Amateur",
          "professional": "Professional",
          "cosmetic": "Cosmetic",
          "coverup": "Cover-up",
          "mixed": "Mixed"
        },
        "goal": {
          "full_removal": "Complete",
          "partial_fade": "Partial",
          "lightening_for_coverup": "Lighten for cover-up"
        },
        "laser_profile": {
          "basic": "Basic",
          "unknown": "Unknown",
          "advanced": "Advanced",
          "premium": "Premium",
          "elite": "Elite"
        },
        "healing_history": {
          "normal": "Normal",
          "mixed": "Mixed",
          "problematic": "Problematic"
        },
        "lightening_rate": {
          "fast": "Fast",
          "expected": "Expected",
          "slow": "Slow",
          "stagnant": "Stagnant"
        }
      },
      "lifestyleGroupTitles": {
        "smoker": "Smoking (score 1–5)",
        "alcohol": "Alcohol (score 1–5)",
        "sleep_quality": "Sleep quality (score 1–5)",
        "sleep_hours": "Sleep hours (score 1–5)",
        "stress": "Stress (score 1–5)",
        "activity": "Activity (score 1–5, lower = better)",
        "sport_frequency": "Sport per week (score 1–5, averaged with activity)",
        "hydration": "Hydration (score 1–5)",
        "nutrition": "Nutrition (score 1–5)"
      },
      "lifestyleFields": {
        "smoker": {
          "no": "No",
          "occasionally": "Occasionally",
          "daily_light": "Daily light",
          "daily_heavy": "Daily heavy"
        },
        "alcohol": {
          "never": "Never",
          "rarely": "Rarely",
          "1-2x_week": "1–2× / week",
          "3-4x_week": "3–4× / week",
          "5+x_week": "5+× / week"
        },
        "sleep_quality": {
          "excellent": "Excellent",
          "good": "Good",
          "fair": "Fair",
          "poor": "Poor"
        },
        "sleep_hours": {
          "8+": "8+ h",
          "7-8": "7–8 h",
          "6-7": "6–7 h",
          "5-6": "5–6 h",
          "under_5": "< 5 h"
        },
        "stress": {
          "low": "Low",
          "medium": "Medium",
          "high": "High",
          "very_high": "Very high"
        },
        "activity": {
          "high": "High",
          "regular": "Regular",
          "light": "Light",
          "low": "Low"
        },
        "sport_frequency": {
          "5+": "5+",
          "3-4": "3–4×",
          "1-2": "1–2×",
          "0": "No sport"
        },
        "hydration": {
          "good": "Good",
          "normal": "Normal",
          "low": "Low"
        },
        "nutrition": {
          "very_good": "Very good",
          "good": "Good",
          "fair": "Fair",
          "poor": "Poor",
          "very_poor": "Very poor"
        }
      },
      "aftercareFields": {
        "low": "Low (+ max sessions)",
        "medium": "Medium",
        "high": "High"
      }
    },
    "anamnesis": {
      "unchangedConfirmed": "Health status confirmed unchanged",
      "edit": "Edit",
      "fill": "Fill in",
      "customerCanConfirm": "The customer can confirm the last anamnesis or report changes.",
      "freigabeSaveError": "Could not save clearance.",
      "freigabeNotePh": "e.g. doctor consulted",
      "ablehnungNotePh": "e.g. please consult a doctor first",
      "confirm": "Confirm",
      "saveRejection": "Save rejection",
      "klaerungPending": "🔴 Not discussed yet",
      "klaerungMore": "🟡 Further clarification needed",
      "klaerungDone": "🟢 Clarified",
      "klaerungSaved": "Clarification saved",
      "klaerungError": "Could not save clarification.",
      "klaerungNotePh": "Clarification note (optional)…",
      "title": "Medical anamnesis",
      "filledOn": "Filled in on {{date}}",
      "loadError": "Could not load anamnesis.",
      "pendingTitle": "⚠ Pending",
      "pendingDesc": "Medical anamnesis has not been filled in for this case yet.",
      "flagsOpen": "{{count}} flag{{suffix}} open",
      "medicalTimeline": "Medical history",
      "signaturePresent": " · Signature on file",
      "signatureAlt": "Signature",
      "history": {
        "submitted": "Anamnesis submitted",
        "updated": "Medical details updated",
        "anamnesis_submitted": "Anamnesis submitted"
      },
      "freigabe": {
        "status": {
          "ausstehend": "Pending",
          "freigegeben": "Approved",
          "abgelehnt": "Rejected",
          "nicht_erforderlich": "Not required"
        },
        "approvedTitle": "✅ Medical clearance granted",
        "rejectedTitle": "❌ Clearance rejected",
        "statusLine": "Status: {{status}}",
        "note": "Note: {{note}}",
        "requiredTitle": "🔴 Medical clearance required — level 2",
        "triggers": "Triggers: {{list}}",
        "approve": "✅ Approve",
        "reject": "❌ Reject",
        "approveNoteLabel": "Optional note for clearance:",
        "rejectNoteLabel": "Rejection reason (optional):",
        "cancel": "Cancel",
        "toastApproved": "Clearance granted",
        "toastRejected": "Rejection saved"
      },
      "wizard": {
        "title": "Medical anamnesis",
        "steps": {
          "skin": "Skin",
          "health1": "Health I",
          "health2": "Health II",
          "closing": "Closing",
          "summary": "Summary"
        },
        "sectionSkin": "Section 1 — Skin conditions",
        "sectionHealth1": "Section 2 — General health",
        "sectionHealth2": "Section 3 — Further details",
        "sectionClosing": "Section 4 — Closing questions",
        "incomplete": "Please answer all questions.",
        "saved": "Anamnesis saved.",
        "back": "Back",
        "next": "Next",
        "save": "Save anamnesis",
        "yes": "Yes",
        "no": "No",
        "unsure": "Unsure",
        "specifyPh": "Please specify…",
        "whichOptional": "Which? (optional)",
        "koBannerTitle": "🔴 Based on your answers, clarification is needed.",
        "koBannerBody": "You can still complete the anamnesis. You will be asked again when booking.",
        "studioHints": "Notes for the studio",
        "clarificationNeeded": "Clarification needed",
        "confirmTruth": "By saving you confirm that all information was recorded truthfully.",
        "q1": "Do you have skin conditions? (multiple choice)",
        "q2": "Pigment disorders or light/dark spots after injuries?",
        "q3": "Acute illness, fever or infection?",
        "q4": "Chronic diseases?",
        "q5": "Diabetes?",
        "q6": "Autoimmune disease?",
        "q7": "Immune deficiency or immunosuppressive medication?",
        "q8": "Heart or circulatory disease?",
        "q9": "Epilepsy or seizures?",
        "q10": "Blood clotting disorder?",
        "q11": "Blood-thinning medication?",
        "q12": "Infectious diseases? (multiple choice)",
        "q13": "Allergies?",
        "q14": "Poor wound healing or previous laser treatments?",
        "q15": "Herpes in the treatment area?",
        "q16": "Pregnant, breastfeeding or unsure?",
        "q17": "Under the influence of alcohol or drugs?",
        "q18": "Are you of sound mind?",
        "q19": "At least 18 years old?",
        "haut": {
          "nein": "No",
          "neurodermitis": "Atopic dermatitis",
          "psoriasis": "Psoriasis",
          "ekzem": "Eczema",
          "vitiligo": "Vitiligo",
          "akne": "Acne",
          "herpes": "Herpes",
          "andere": "Other"
        },
        "infekt": {
          "nein": "No",
          "hepatitis": "Hepatitis",
          "hiv": "HIV",
          "andere": "Other"
        },
        "diabetes": {
          "nein": "No",
          "typ1": "Type 1",
          "typ2": "Type 2",
          "unbekannt": "Don't know"
        }
      }
    },
    "signature": {
      "canvasLabel": "Signature *",
      "clear": "Clear",
      "hint": "Sign with finger or mouse",
      "panelTitle": "Signature & aftercare leaflet",
      "sign": "Sign",
      "resign": "Sign again",
      "anamnesisFirstTitle": "Anamnesis first",
      "anamnesisFirstDesc": "Medical anamnesis must be completed before signing.",
      "present": "✅ Signature on file",
      "signedAt": "Signed: {{date}}",
      "leafletRead": "Leaflet read: Yes",
      "clickToEnlarge": "Click to enlarge",
      "pendingTitle": "⚠ Pending",
      "pendingDesc": "Read the aftercare notes and sign digitally.",
      "lightboxTitle": "Signature",
      "previewAlt": "Signature preview",
      "close": "Close",
      "wizardTitle": "Aftercare & signature",
      "stepLeaflet": "Leaflet",
      "stepSignature": "Signature",
      "leafletHeading": "Aftercare notes",
      "leafletIntro": "Please read the following notes carefully.",
      "cancel": "Cancel",
      "continue": "Continue →",
      "confirmHeading": "Confirmation & signature",
      "labelName": "Name",
      "labelCase": "Case",
      "labelDate": "Date",
      "confirmBtn": "Confirm signature",
      "needSignature": "Please sign.",
      "saved": "Signature saved.",
      "alt": "Signature"
    },
    "casePricing": {
      "title": "Price calculation",
      "error": "Could not calculate price.",
      "calculated": "Calculated price",
      "confirmed": "Confirmed studio price",
      "notConfirmed": "Not yet confirmed",
      "area": "Area: {{area}} cm²",
      "confidence": "Estimate confidence: {{pct}} %",
      "reviewRecommended": "Studio review recommended",
      "factors": "Factors: colour ×{{color}}, age ×{{age}}, skin ×{{skin}}"
    },
    "caseAvailability": {
      "title": "Bookability & lockouts",
      "error": "Could not load availability.",
      "earliest": "Earliest bookable",
      "lockedUntil": " · locked until {{until}}",
      "noLockouts": "No active lockouts",
      "nextWindow": "Next free window from {{from}}",
      "book": "Book appointment"
    },
    "activityTags": {
      "BUCHUNG": "Booking",
      "STORNIERUNG": "Cancellation",
      "NEU ANGESETZT": "Rescheduled",
      "NICHT ERSCHIENEN": "No-show",
      "SPERRFRIST": "Lockout",
      "MEDIZIN": "Medical",
      "STATUS": "Status",
      "PREIS": "Price",
      "SITZUNG": "Session",
      "PROFIL": "Profile",
      "STUDIO": "Studio",
      "SONSTIGES": "Other"
    },
    "badge": {
      "pending": "Pending",
      "active": "Active",
      "completed": "Completed",
      "loeschantrag_ausstehend": "Deletion pending",
      "aktiv": "Active",
      "ausstehend": "Pending",
      "gesperrt": "Locked",
      "gebucht": "Booked",
      "storniert": "Cancelled"
    },
  },
  "pipeline": {
    "Neu": "New",
    "Beratung geplant": "Consultation scheduled",
    "Behandlung aktiv": "Treatment active",
    "Beratung erledigt": "Consultation done"
  },
  "crm": {
    "taskTypes": {
      "followup": "Follow-up",
      "anruf": "Call",
      "email": "E-mail",
      "termin": "Appointment",
      "sonstiges": "Other"
    },
    "priorities": {
      "niedrig": "Low",
      "mittel": "Medium",
      "hoch": "High"
    },
    "noteTypes": {
      "anruf": "Call",
      "email": "E-mail",
      "meeting": "Meeting",
      "sonstiges": "Other"
    },
    "stageActions": {
      "Neu": "Create first case",
      "Beratung geplant": "Confirm appointment",
      "Behandlung aktiv": "Plan next appointment",
      "Beratung erledigt": "Send follow-up",
      "bookConsultation": "Schedule consultation"
    }
  }
,
  "crmModals": {
    "noteTitle": "CRM note · {{name}}",
    "noteType": "Type",
    "noteContent": "Note",
    "notePlaceholder": "Call note…",
    "createTask": "Create task",
    "taskTitle": "Task title",
    "taskType": "Task type",
    "taskPriority": "Priority",
    "taskDue": "Due date",
    "noteRequired": "Please enter a note.",
    "taskTitleRequired": "Please enter a task title.",
    "noteSaved": "Note saved.",
    "noteSaveFailed": "Could not save note.",
    "newTask": "New task",
    "taskWithCustomer": "Task · {{name}}",
    "titleRequired": "Please enter a title.",
    "taskCreated": "Task created.",
    "taskSaveFailed": "Could not save task.",
    "title": "Title",
    "customer": "Customer",
    "noCustomer": "— No customer —",
    "save": "Save",
    "create": "Create",
    "noteContentLabel": "Content",
    "noteContentPlaceholder": "Call, email, outcome…",
    "createFollowUpTask": "Create follow-up task",
    "taskTitlePlaceholder": "e.g. Call again",
    "taskTypeLabel": "Task type",
    "cancel": "Cancel",
    "customerOptional": "Customer (optional)",
    "studioWide": "General (studio-wide)",
    "titlePlaceholder": "e.g. Follow-up after consultation"
  }
}

/** Structure matches `en`; leaf values are plain `string` so `de` can differ. */
export type TranslationSchema = typeof en
export default en
