import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import ElayaLogo from '../../components/ElayaLogo'
import useContent from '../../i18n/useContent'
import useAuthStore from '../../store/authStore'
import { STUDIO_ROLES } from '../../constants/roles'
import { getApiErrorMessage } from '../../lib/apiError'

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-studio-white text-[12px] font-semibold">{label}</label>
    {children}
  </div>
)

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-[14px] py-[10px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3
      text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors
      placeholder:text-studio-w3 ${className}`}
  />
)

const StudioLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const { studioAuth, common, toast: toastMessages } = useContent()

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
      await login({
        email: form.email,
        password: form.password,
        allowedRoles: STUDIO_ROLES,
      })

      toast.success(toastMessages.loginSuccess)
      const redirectTo = location.state?.from?.pathname || '/studio'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.code === 'WRONG_PORTAL') {
        setError(toastMessages.wrongPortal)
        toast.error(toastMessages.wrongPortal)
        return
      }

      const message = getApiErrorMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col items-center justify-center font-sans px-4">
      <div className="w-full max-w-[380px] bg-studio-bg-3 border border-elaya-border rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <ElayaLogo size="md" />
          <div className="text-center">
            <h1 className="text-studio-white font-bold text-xl m-0 leading-tight">
              {studioAuth.loginTitle}
            </h1>
            <p className="text-studio-w2 text-[13px] mt-1 m-0">
              {studioAuth.loginSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" translate="no">
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
                className="text-studio-w2 text-[11px] hover:text-studio-white transition-colors no-underline"
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
            className="w-full py-[12px] rounded-[12px] border-0 font-bold text-[13px] cursor-pointer transition-all
              bg-linear-to-br from-studio-gold-2 to-studio-gold text-white
              disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? common.loading : common.login}
          </button>
        </form>

        <p className="text-center text-studio-w2 text-[12px] m-0">
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
        className="mt-6 text-studio-w2 text-[12px] bg-transparent border-0 cursor-pointer hover:text-studio-white transition-colors"
      >
        ← {common.back}
      </button>
    </div>
  )
}

export default StudioLogin
