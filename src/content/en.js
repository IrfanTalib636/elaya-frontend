/**
 * English UI content.
 * Keys: English, camelCase. Values: English.
 */

export const common = {
  appName: 'Elaya',
  back: 'Back',
  save: 'Save',
  cancel: 'Cancel',
  loading: 'Loading…',
  error: 'Error',
  success: 'Success',
  email: 'E-mail',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  forgotPassword: 'Forgot Password?',
  noAccount: "Don't have an account?",
  hasAccount: 'Already have an account?',
  register: 'Register',
  login: 'Login',
  logout: 'Logout',
  required: 'This field is required',
  invalidEmail: 'Invalid E-mail address',
  passwordMismatch: 'Passwords do not match',
  passwordMinLength: 'Password must be at least 8 characters',
  serverError: 'Server error. Please try again later.',
  sendResetLink: 'Send reset link',
  newPassword: 'New password',
  resetPassword: 'Reset password',
  backToLogin: 'Back to login',
}

export const toast = {
  loginSuccess: 'Logged in successfully',
  registerSuccess: 'Registration submitted — awaiting admin approval',
  logoutSuccess: 'Logged out successfully',
  wrongPortal: 'This account does not have access to this portal.',
  serverError: 'Server error. Please try again later.',
  forgotPasswordSent: 'If an account exists, you will receive an email shortly.',
  resetPasswordSuccess: 'Password reset successfully. You can now log in.',
  invalidResetToken: 'This link is invalid or expired. Please request a new one.',
}

export const landing = {
  badge: 'Tattoo Removal Platform',
  tagline: 'Tattoo removal — intelligently managed',
  subtitle: 'The professional platform for studios, clients and clinic management.',
  portalHeading: 'Choose your portal',

  customerLabel: 'Customer App',
  customerSub: 'Book appointments, track progress and manage Elaycoins.',
  customerCta: 'Open App',
  customerBadge: 'Mobile only',

  studioLabel: 'Studio Dashboard',
  studioSub: 'Appointment management, customer care and studio analytics.',
  studioCta: 'Sign in',

  adminLabel: 'Admin',
  adminSub: 'Platform management',
  adminCta: 'Admin access',

  footer: `© ${new Date().getFullYear()} Elaya · Moro Concept Group GmbH`,
}

export const studioAuth = {
  loginTitle: 'Studio Login',
  loginSubtitle: 'Sign in to the studio dashboard',
  registerTitle: 'Register Studio',
  registerSubtitle: 'Create your studio account on Elaya',
  studioName: 'Company Name',
  studioCode: 'Studio Code',
  phone: 'Phone Number',
  city: 'City',
  registerButton: 'Register Studio',
  registerPrompt: "Don't have a studio account?",
  loginPrompt: 'Already have an account?',
  forgotTitle: 'Forgot Password',
  forgotSubtitle: 'Enter your email — we will send you a reset link.',
  resetTitle: 'New Password',
  resetSubtitle: 'Choose a new password for your studio account.',
}

export const adminAuth = {
  loginTitle: 'Admin Login',
  loginSubtitle: 'Platform management',
  forgotTitle: 'Forgot Password',
  forgotSubtitle: 'Enter your admin email — we will send you a reset link.',
  resetTitle: 'New Password',
  resetSubtitle: 'Choose a new password for your admin account.',
}

export const notFound = {
  title: '404',
  heading: 'Page not found',
  message: 'The page you requested does not exist or has been moved.',
  homeButton: 'Back to home',
}

export const studioNav = {
  dashboard:    'Dashboard',
  appointments: 'Calendar',
  today:        'Today',
  customers:    'Customers',
  cases:        'All cases',
  sessions:     'Sessions',
  analytics:    'Analytics',
  aftercare:    'Aftercare',
  crm:          'CRM',
  chat:         'Customer chat',
  elayaChat:    'Elaya Chat',
  activity:     'History',
  shop:         'Avora Shop',
  transfers:    'Studio transfer',
  elaycoins:    'Elaycoins',
  settings:     'Settings',
}

export const studioActivity = {
  title: 'Appointment history',
  subtitle: 'Chronological log of every relevant action in the studio.',
  customerTitle: 'History',
  empty: 'No entries for the selected filters.',
  emptyHint: 'Bookings, cancellations, medical changes and studio actions appear here.',
  loadError: 'Could not load history.',
  categories: {
    all: 'All',
    bookings: 'Appointments',
    cancellations: 'Cancellations',
    reschedules: 'Rescheduled',
    no_shows: 'No-shows',
    lockouts: 'Lockouts',
    medical: 'Medical',
    profile: 'Profile',
    studio: 'Studio',
    prices: 'Prices',
    sessions: 'Sessions',
  },
  ranges: {
    all: 'All',
    h24: '24 hrs',
    h48: '48 hrs',
    d7: '7 days',
    d30: '30 days',
    m3: '3 months',
    m6: '6 months',
    custom: 'Date range',
  },
  from: 'From',
  to: 'To',
}

export const studioElayaChat = {
  title: 'Elaya Chat',
  subtitle: 'Your AI assistant for medical questions, treatments and cases — inside the studio.',
  welcome:
    'Hi! I am Elaya. Ask me about tattoo removal, skin, lockouts, Quick Check, or a specific customer case.',
  placeholder: 'Ask Elaya…',
  send: 'Send',
  thinking: 'Elaya is thinking…',
  emptyHint: 'Type a question or pick a suggestion.',
  contextLabel: 'Context',
  contextNone: 'Whole studio',
  contextCustomer: 'Customer',
  contextSearch: 'Search customer…',
  newChat: 'New chat',
  openCustomer: 'Open customer',
  openCase: 'Open case',
  unavailable: 'Elaya is unavailable right now. Please try again later.',
  loadError: 'Could not load a reply.',
  prompts: [
    'What contraindications apply before a laser session?',
    'Customer had the flu — when can we treat?',
    'Explain the current lockout logic.',
    'What to watch with Fitzpatrick IV?',
    'How do I document a session in Elaya?',
  ],
}

export const adminNav = {
  sidebarTitle: 'Platform management',
  sidebarTag: 'Skin · Laser · Care',
  contentPlaceholder: 'Content coming soon',
  items: [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'studios', icon: '🏪', label: 'Studios' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'transfer', icon: '🔄', label: 'Studio transfer' },
    { id: 'elaycoins', icon: '🪙', label: 'Elaycoins' },
    { id: 'finance', icon: '💶', label: 'Finance' },
    { id: 'features', icon: '🎛️', label: 'Features' },
    { id: 'ai', icon: '🤖', label: 'Elaya AI' },
    { id: 'shop', icon: '🛍️', label: 'ElayShop' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ],
}

export { caseForm } from './caseForm.en'
