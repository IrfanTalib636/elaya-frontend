import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import elayadLogo from '../../assets/elaya-logo.png'
import { studioAuth, common, toast as toastMessages } from '../../content'
import useAuthStore from '../../store/authStore'
import { STUDIO_ROLES } from '../../constants/roles'
import { getApiErrorMessage } from '../../lib/apiError'

export default function StudioLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      setError(common.required)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { user } = await login({ email: form.email, password: form.password })

      if (!STUDIO_ROLES.includes(user.role)) {
        await logout()
        setError(toastMessages.wrongPortal)
        toast.error(toastMessages.wrongPortal)
        return
      }

      toast.success(toastMessages.loginSuccess)
      const redirectTo = location.state?.from?.pathname || '/studio'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message = getApiErrorMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col items-center justify-center font-sans px-4">
      <div className="w-full max-w-[380px] bg-studio-bg-3 border border-white/4 rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <img
            src={elayadLogo}
            alt="Elaya"
            className="w-[100px] mix-blend-screen bg-transparent"
          />
          <div className="text-center">
            <h1 className="text-studio-white font-bold text-xl m-0 leading-tight">
              {studioAuth.loginTitle}
            </h1>
            <p className="text-studio-w3 text-[13px] mt-1 m-0">
              {studioAuth.loginSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={common.email}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="studio@beispiel.de"
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-studio-white text-[12px] font-semibold">
                {common.password}
              </label>
              <Link
                to="/studio/forgot-password"
                className="text-studio-w4 text-[11px] hover:text-studio-w3 transition-colors no-underline"
              >
                {common.forgotPassword}
              </Link>
            </div>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-studio-red text-[12px] m-0">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[12px] rounded-[8px] border-0 font-bold text-[13px] cursor-pointer transition-all
              bg-linear-to-br from-studio-gold-2 to-studio-gold text-landing-bg
              disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? common.loading : common.login}
          </button>
        </form>

        <p className="text-center text-studio-w4 text-[12px] m-0">
          {studioAuth.registerPrompt}{' '}
          <Link
            to="/studio/register"
            className="text-studio-gold hover:text-studio-gold-2 transition-colors no-underline font-semibold"
          >
            {common.register}
          </Link>
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 text-studio-w4 text-[12px] bg-transparent border-0 cursor-pointer hover:text-studio-w3 transition-colors"
      >
        ← {common.back}
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-studio-white text-[12px] font-semibold">{label}</label>
      {children}
    </div>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-[14px] py-[10px] rounded-[10px] border border-white/8 bg-studio-bg-3
        text-studio-white text-[13px] outline-none focus:border-studio-teal transition-colors
        placeholder:text-studio-w4 ${className}`}
    />
  )
}
