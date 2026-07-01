import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import StudioShell from './components/StudioShell'
import useTheme from './hooks/useTheme'
import { STUDIO_ROLES, ADMIN_ROLES } from './constants/roles'

import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

// Studio auth
import StudioLogin from './pages/studio/Login'
import StudioRegister from './pages/studio/Register'
import StudioForgotPassword from './pages/studio/ForgotPassword'

// Studio dashboard pages
import StudioOverview from './pages/studio/Overview'
import StudioCustomers from './pages/studio/Customers'
import CustomerDetail from './pages/studio/CustomerDetail'
import CaseDetail from './pages/studio/CaseDetail'
import StudioAppointments from './pages/studio/Appointments'
import NewSession from './pages/studio/NewSession'
import SessionDetail from './pages/studio/SessionDetail'
import StudioAnalytics from './pages/studio/Analytics'
import StudioCrm from './pages/studio/Crm'
import StudioShop from './pages/studio/Shop'
import StudioElaycoins from './pages/studio/Elaycoins'
import StudioSettings from './pages/studio/Settings'

// Admin
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'

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
          error: { iconTheme: { primary: '#e05555', secondary: 'var(--color-studio-bg-3)' } },
        }}
      />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Studio auth — guest only */}
        <Route path="/studio/login"          element={<GuestRoute><StudioLogin /></GuestRoute>} />
        <Route path="/studio/register"       element={<GuestRoute><StudioRegister /></GuestRoute>} />
        <Route path="/studio/forgot-password" element={<GuestRoute><StudioForgotPassword /></GuestRoute>} />

        {/* Studio dashboard — protected layout wrapper */}
        <Route
          path="/studio"
          element={
            <ProtectedRoute allowedRoles={STUDIO_ROLES} loginPath="/studio/login">
              <StudioShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"        element={<StudioOverview />} />
          <Route path="customers"        element={<StudioCustomers />} />
          <Route path="customers/:id"    element={<CustomerDetail />} />
          <Route path="cases/:id"        element={<CaseDetail />} />
          <Route path="appointments"     element={<StudioAppointments />} />
          <Route path="sessions/new"     element={<NewSession />} />
          <Route path="sessions/:id"     element={<SessionDetail />} />
          <Route path="analytics"        element={<StudioAnalytics />} />
          <Route path="crm"              element={<StudioCrm />} />
          <Route path="shop"             element={<StudioShop />} />
          <Route path="elaycoins"        element={<StudioElaycoins />} />
          <Route path="settings"         element={<StudioSettings />} />
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
    </>
  )
}

const App = () => (
  <BrowserRouter>
    <AppInner />
  </BrowserRouter>
)

export default App
