import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import StudioShell from './components/StudioShell'
import useTheme from './hooks/useTheme'
import { STUDIO_ROLES, ADMIN_ROLES } from './constants/roles'

// ── Page chunks (each becomes a separate build chunk) ──────────────────────
const LandingPage          = lazy(() => import('./pages/LandingPage'))
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'))

const StudioLogin          = lazy(() => import('./pages/studio/Login'))
const StudioRegister       = lazy(() => import('./pages/studio/Register'))
const StudioForgotPassword = lazy(() => import('./pages/studio/ForgotPassword'))

const StudioOverview       = lazy(() => import('./pages/studio/Overview'))
const StudioToday          = lazy(() => import('./pages/studio/Today'))
const StudioCustomers      = lazy(() => import('./pages/studio/Customers'))
const StudioCases          = lazy(() => import('./pages/studio/Cases'))
const CustomerDetail       = lazy(() => import('./pages/studio/CustomerDetail'))
const CaseDetail           = lazy(() => import('./pages/studio/CaseDetail'))
const StudioAppointments   = lazy(() => import('./pages/studio/Appointments'))
const StudioSessions       = lazy(() => import('./pages/studio/Sessions'))
const NewSession           = lazy(() => import('./pages/studio/NewSession'))
const SessionDetail        = lazy(() => import('./pages/studio/SessionDetail'))
const StudioAnalytics      = lazy(() => import('./pages/studio/Analytics'))
const StudioCrm            = lazy(() => import('./pages/studio/Crm'))
const StudioShop           = lazy(() => import('./pages/studio/Shop'))
const StudioElaycoins      = lazy(() => import('./pages/studio/Elaycoins'))
const StudioSettings       = lazy(() => import('./pages/studio/Settings'))

const AdminLogin           = lazy(() => import('./pages/admin/Login'))
const AdminDashboard       = lazy(() => import('./pages/admin/Dashboard'))

// ── Fallback shown while a chunk loads ────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-studio-bg">
    <div className="w-8 h-8 rounded-full border-2 border-studio-gold/25 border-t-studio-gold animate-elaya-spin" />
  </div>
)

// ── App ───────────────────────────────────────────────────────────────────
const AppInner = () => {
  useTheme()

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-studio-bg-3)',
            color: 'var(--color-studio-white)',
            border: '1px solid var(--color-elaya-border)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#2ecc8a', secondary: 'var(--color-studio-bg-3)' } },
          error:   { iconTheme: { primary: '#e05555', secondary: 'var(--color-studio-bg-3)' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Studio auth — guest only */}
          <Route path="/studio/login"           element={<GuestRoute><StudioLogin /></GuestRoute>} />
          <Route path="/studio/register"        element={<GuestRoute><StudioRegister /></GuestRoute>} />
          <Route path="/studio/forgot-password" element={<GuestRoute><StudioForgotPassword /></GuestRoute>} />

          {/* Studio dashboard — protected */}
          <Route
            path="/studio"
            element={
              <ProtectedRoute allowedRoles={STUDIO_ROLES} loginPath="/studio/login">
                <StudioShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<StudioOverview />} />
            <Route path="today"         element={<StudioToday />} />
            <Route path="customers"     element={<StudioCustomers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="cases"         element={<StudioCases />} />
            <Route path="cases/:id"     element={<CaseDetail />} />
            <Route path="appointments"  element={<StudioAppointments />} />
            <Route path="sessions"      element={<StudioSessions />} />
            <Route path="sessions/new"  element={<NewSession />} />
            <Route path="sessions/:id"  element={<SessionDetail />} />
            <Route path="analytics"     element={<StudioAnalytics />} />
            <Route path="crm"           element={<StudioCrm />} />
            <Route path="shop"          element={<StudioShop />} />
            <Route path="elaycoins"     element={<StudioElaycoins />} />
            <Route path="settings"      element={<StudioSettings />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES} loginPath="/admin/login">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

const App = () => (
  <BrowserRouter>
    <AppInner />
  </BrowserRouter>
)

export default App
