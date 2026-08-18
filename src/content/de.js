/**
 * German UI content.
 * Keys: English, camelCase. Values: German.
 */

export const common = {
  appName: 'Elaya',
  back: 'Zurück',
  save: 'Speichern',
  cancel: 'Abbrechen',
  loading: 'Laden…',
  error: 'Fehler',
  success: 'Erfolgreich',
  email: 'E-Mail',
  password: 'Passwort',
  confirmPassword: 'Passwort Bestätigen',
  forgotPassword: 'Passwort Vergessen?',
  noAccount: 'Noch kein Konto?',
  hasAccount: 'Bereits ein Konto?',
  register: 'Registrieren',
  login: 'Anmelden',
  logout: 'Abmelden',
  required: 'Dieses Feld ist erforderlich',
  invalidEmail: 'Ungültige E-Mail-Adresse',
  passwordMismatch: 'Passwörter stimmen nicht überein',
  passwordMinLength: 'Passwort muss mindestens 8 Zeichen haben',
  serverError: 'Serverfehler. Bitte versuche es später erneut.',
  sendResetLink: 'Link senden',
  newPassword: 'Neues Passwort',
  resetPassword: 'Passwort zurücksetzen',
  backToLogin: 'Zurück zur Anmeldung',
}

export const toast = {
  loginSuccess: 'Erfolgreich angemeldet',
  registerSuccess: 'Registrierung eingereicht — warte auf Admin-Freigabe',
  logoutSuccess: 'Erfolgreich abgemeldet',
  wrongPortal: 'Dieses Konto hat keinen Zugang zu diesem Portal.',
  serverError: 'Serverfehler. Bitte versuche es später erneut.',
  forgotPasswordSent: 'Falls ein Konto existiert, erhalten Sie in Kürze eine E-Mail.',
  resetPasswordSuccess: 'Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.',
  invalidResetToken: 'Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.',
}

export const landing = {
  badge: 'Tattoo Removal Platform',
  tagline: 'Tattooentfernung — intelligent verwaltet',
  subtitle: 'Die professionelle Plattform für Studios, Kunden und Klinik-Management.',
  portalHeading: 'Wähle deinen Bereich',

  customerLabel: 'Kunden-App',
  customerSub: 'Termine buchen, Verlauf verfolgen, Elaycoins verwalten.',
  customerCta: 'App öffnen',
  customerBadge: 'Nur mobil',

  studioLabel: 'Studio-Dashboard',
  studioSub: 'Terminverwaltung, Kundenpflege und Studio-Analytics.',
  studioCta: 'Anmelden',

  adminLabel: 'Admin',
  adminSub: 'Plattform-Verwaltung',
  adminCta: 'Admin-Zugang',

  footer: `© ${new Date().getFullYear()} Elaya · Moro Concept Group GmbH`,
}

export const studioAuth = {
  loginTitle: 'Studio-Anmeldung',
  loginSubtitle: 'Melde dich im Studio-Dashboard an',
  registerTitle: 'Studio Registrieren',
  registerSubtitle: 'Erstelle dein Studio-Konto auf Elaya',
  studioName: 'Firmenname',
  studioCode: 'Studio-Code',
  phone: 'Telefonnummer',
  city: 'Stadt',
  registerButton: 'Studio Registrieren',
  registerPrompt: 'Noch kein Studio-Konto?',
  loginPrompt: 'Bereits ein Konto?',
  forgotTitle: 'Passwort Vergessen',
  forgotSubtitle: 'Geben Sie Ihre E-Mail ein — wir senden Ihnen einen Link zum Zurücksetzen.',
  resetTitle: 'Neues Passwort',
  resetSubtitle: 'Wählen Sie ein neues Passwort für Ihr Studio-Konto.',
}

export const adminAuth = {
  loginTitle: 'Admin-Anmeldung',
  loginSubtitle: 'Plattform-Verwaltung',
  forgotTitle: 'Passwort Vergessen',
  forgotSubtitle: 'Geben Sie Ihre Admin-E-Mail ein — wir senden Ihnen einen Link zum Zurücksetzen.',
  resetTitle: 'Neues Passwort',
  resetSubtitle: 'Wählen Sie ein neues Passwort für Ihr Admin-Konto.',
}

export const notFound = {
  title: '404',
  heading: 'Seite nicht gefunden',
  message: 'Die angeforderte Seite existiert nicht oder wurde verschoben.',
  homeButton: 'Zur Startseite',
}

export const studioNav = {
  dashboard:    'Dashboard',
  appointments: 'Kalender',
  today:        'Heute',
  customers:    'Kunden',
  cases:        'Alle Fälle',
  sessions:     'Sitzungen',
  analytics:    'Analytik',
  aftercare:    'Nachsorge',
  crm:          'CRM',
  chat:         'Kunden-Chat',
  elayaChat:    'Elaya Chat',
  activity:     'Verlauf',
  shop:         'Avora Shop',
  transfers:    'Studio-Wechsel',
  elaycoins:    'Elaycoins',
  settings:     'Einstellungen',
}

export const studioActivity = {
  title: 'Terminverlauf',
  subtitle: 'Chronologisches Protokoll aller relevanten Aktionen im Studio.',
  customerTitle: 'Verlauf',
  empty: 'Keine Einträge für die gewählten Filter.',
  emptyHint: 'Buchungen, Stornierungen, medizinische Änderungen und Studio-Aktionen erscheinen hier.',
  loadError: 'Verlauf konnte nicht geladen werden.',
  categories: {
    all: 'Alle',
    bookings: 'Termine',
    cancellations: 'Stornierungen',
    reschedules: 'Neu angesetzt',
    no_shows: 'Nicht erschienen',
    lockouts: 'Sperrfristen',
    medical: 'Medizin',
    profile: 'Profil',
    studio: 'Studio',
    prices: 'Preise',
    sessions: 'Sitzungen',
  },
  ranges: {
    all: 'Alles',
    h24: '24 Std',
    h48: '48 Std',
    d7: '7 Tage',
    d30: '30 Tage',
    m3: '3 Monate',
    m6: '6 Monate',
    custom: 'Zeitraum',
  },
  from: 'Von',
  to: 'Bis',
}

export const studioElayaChat = {
  title: 'Elaya Chat',
  subtitle: 'Deine KI-Assistentin für Medizin, Behandlung und Fälle — direkt im Studio.',
  welcome:
    'Hallo! Ich bin Elaya. Frag mich zu Tattooentfernung, Haut, Sperrfristen, Quick Check oder zu einem konkreten Kundenfall.',
  placeholder: 'Frage an Elaya…',
  send: 'Senden',
  thinking: 'Elaya denkt nach…',
  emptyHint: 'Tippe eine Frage oder wähle einen Vorschlag.',
  contextLabel: 'Kontext',
  contextNone: 'Ganzes Studio',
  contextCustomer: 'Kunde',
  contextSearch: 'Kunde suchen…',
  newChat: 'Neues Gespräch',
  openCustomer: 'Zum Kunden',
  openCase: 'Zum Fall',
  unavailable: 'Elaya ist gerade nicht erreichbar. Bitte später erneut versuchen.',
  loadError: 'Antwort konnte nicht geladen werden.',
  prompts: [
    'Welche Kontraindikationen gelten vor einer Lasersitzung?',
    'Kunde hatte Grippe — wann darf behandelt werden?',
    'Erkläre die aktuelle Sperrfrist-Logik.',
    'Worauf achten bei Fitzpatrick IV?',
    'Wie dokumentiere ich eine Sitzung in Elaya?',
  ],
}

export const adminNav = {
  sidebarTitle: 'Plattform-Verwaltung',
  sidebarTag: 'Skin · Laser · Care',
  contentPlaceholder: 'Inhalt folgt',
  items: [
    { id: 'overview', icon: '📊', label: 'Übersicht' },
    { id: 'studios', icon: '🏪', label: 'Studios' },
    { id: 'customers', icon: '👥', label: 'Kunden' },
    { id: 'transfer', icon: '🔄', label: 'Studio-Wechsel' },
    { id: 'elaycoins', icon: '🪙', label: 'Elaycoins' },
    { id: 'finance', icon: '💶', label: 'Finanzen' },
    { id: 'features', icon: '🎛️', label: 'Features' },
    { id: 'ai', icon: '🤖', label: 'Elaya KI' },
    { id: 'shop', icon: '🛍️', label: 'ElayShop' },
    { id: 'settings', icon: '⚙️', label: 'Einstellungen' },
  ],
}

export { caseForm } from './caseForm.de'
