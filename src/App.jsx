import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import { STUDIO_ROLES, ADMIN_ROLES } from './constants/roles'
import LandingPage from './pages/LandingPage'
import StudioLogin from './pages/studio/Login'
import StudioRegister from './pages/studio/Register'
import StudioForgotPassword from './pages/studio/ForgotPassword'
import StudioDashboard from './pages/studio/Dashboard'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import NotFoundPage from './pages/NotFoundPage'

const App = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#151f2c',
            color: '#f4f8fc',
            border: '1px solid rgba(255,255,255,0.06)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#2da888', secondary: '#151f2c' } },
          error: { iconTheme: { primary: '#c85858', secondary: '#151f2c' } },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Studio auth — redirect to dashboard if already logged in */}
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

        {/* Admin auth */}
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
    </BrowserRouter>
  )
}

export default App
