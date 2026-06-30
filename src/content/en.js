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
}

export const toast = {
  loginSuccess: 'Logged in successfully',
  registerSuccess: 'Registration submitted — awaiting admin approval',
  logoutSuccess: 'Logged out successfully',
  wrongPortal: 'This account does not have access to this portal.',
  serverError: 'Server error. Please try again later.',
}

export const landing = {
  tagline: 'Tattoo removal — intelligently managed',
  customerLabel: '📱 Customer App',
  studioLabel: '🖥 Studio Dashboard',
  adminLabel: '⚙️ Admin',
  adminSub: 'Platform management',
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
}

export const adminAuth = {
  loginTitle: 'Admin Login',
  loginSubtitle: 'Platform management',
}

export const notFound = {
  title: '404',
  heading: 'Page not found',
  message: 'The page you requested does not exist or has been moved.',
  homeButton: 'Back to home',
}

export const studioNav = {
  sidebarTitle: 'Studio Dashboard',
  contentPlaceholder: 'Content coming soon',
  items: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'kalender', icon: '🗓️', label: 'Calendar' },
    { id: 'today', icon: '📅', label: 'Today' },
    { id: 'clients', icon: '👥', label: 'Customers' },
    { id: 'cases', icon: '🗂️', label: 'All Cases' },
    { id: 'verlauf', icon: '📋', label: 'History' },
    { id: 'nachsorge', icon: '🩺', label: 'Aftercare' },
    { id: 'leads', icon: '🎯', label: 'Leads' },
    { id: 'alerts', icon: '🚨', label: 'Alerts' },
    { id: 'crm', icon: '🎯', label: 'CRM' },
    { id: 'avora', icon: '🛍️', label: 'Avora Shop' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'fees', icon: '💳', label: 'Platform Fees' },
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
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
    { id: 'ai', icon: '🤖', label: 'Elaya AI' },
    { id: 'shop', icon: '🛍️', label: 'ElayShop' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ],
}
