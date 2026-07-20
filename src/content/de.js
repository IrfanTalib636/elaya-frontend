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
  crm:          'Nachsorge',
  shop:         'Avora Shop',
  transfers:    'Studio-Wechsel',
  elaycoins:    'Elaycoins',
  settings:     'Einstellungen',
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
    { id: 'ai', icon: '🤖', label: 'Elaya KI' },
    { id: 'shop', icon: '🛍️', label: 'ElayShop' },
    { id: 'settings', icon: '⚙️', label: 'Einstellungen' },
  ],
}

export { caseForm } from './caseForm.de'
