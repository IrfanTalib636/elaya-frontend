import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import ThemeSwitcher from './components/ThemeSwitcher'
import useTheme from './hooks/useTheme'
import { STUDIO_ROLES, ADMIN_ROLES } from './constants/roles'
import LandingPage from './pages/LandingPage'
import StudioLogin from './pages/studio/Login'
import StudioRegister from './pages/studio/Register'
import StudioForgotPassword from './pages/studio/ForgotPassword'
import StudioDashboard from './pages/studio/Dashboard'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import NotFoundPage from './pages/NotFoundPage'

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

      <div className="fixed top-3 right-4 z-9999">
        <ThemeSwitcher />
      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Studio auth — guest only */}
        <Route path="/studio/login" element={<GuestRoute><StudioLogin /></GuestRoute>} />
        <Route path="/studio/register" element={<GuestRoute><StudioRegister /></GuestRoute>} />
        <Route path="/studio/forgot-password" element={<GuestRoute><StudioForgotPassword /></GuestRoute>} />
        <Route
          path="/studio"
          element={
            <ProtectedRoute allowedRoles={STUDIO_ROLES} loginPath="/studio/login">
              <StudioDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin auth — guest only */}
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
