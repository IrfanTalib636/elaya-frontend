import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ElayaLogo from '../../components/ElayaLogo'
import { resetPassword } from '../../api/auth'
import useContent from '../../i18n/useContent'
import { getApiErrorMessage } from '../../lib/apiError'

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-studio-white text-[11px] font-semibold tracking-wide">{label}</label>
    {children}
  </div>
)

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-[14px] py-[10px] rounded-[8px] border-[1.5px] border-elaya-border bg-studio-bg-card-2
      text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors
      placeholder:text-studio-w2-2 font-sans ${className}`}
  />
)

const AdminResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { adminAuth, common, toast: toastMessages } = useContent()

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      setError(toastMessages.invalidResetToken)
      return
    }

    if (!form.password || !form.confirmPassword) {
      setError(common.required)
      return
    }

    if (form.password.length < 8) {
      setError(common.passwordMinLength)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError(common.passwordMismatch)
      return
    }

    setLoading(true)
    setError('')

    try {
      await resetPassword({ token, password: form.password })
      toast.success(toastMessages.resetPasswordSuccess)
      navigate('/admin/login', { replace: true })
    } catch (err) {
      const message = getApiErrorMessage(err) || toastMessages.invalidResetToken
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-studio-bg flex flex-col items-center justify-center font-sans px-4">
        <div className="w-full max-w-[360px] bg-studio-bg-card border border-elaya-border rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <ElayaLogo size="md" />
          <p className="text-studio-w2 text-[13px] m-0 leading-relaxed">
            {toastMessages.invalidResetToken}
          </p>
          <Link
            to="/admin/forgot-password"
            className="text-studio-gold-2 hover:text-studio-gold-2 transition-colors no-underline font-semibold text-[12px]"
          >
            {common.forgotPassword}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col items-center justify-center font-sans px-4">
      <div className="w-full max-w-[360px] bg-studio-bg-card border border-elaya-border rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <ElayaLogo size="md" />
          <div className="text-center">
            <h1 className="text-studio-white font-bold text-xl m-0 leading-tight tracking-wide">
              {adminAuth.resetTitle}
            </h1>
            <p className="text-studio-w2 text-[12px] mt-1 m-0 leading-relaxed">
              {adminAuth.resetSubtitle}
            </p>
          </div>
        </div>

        <div className="h-px bg-elaya-border" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" translate="no">
          <Field label={common.newPassword}>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </Field>

          <Field label={common.confirmPassword}>
            <Input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-studio-red text-[12px] m-0">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[11px] rounded-[12px] border border-studio-gold font-bold text-[13px]
              cursor-pointer transition-all bg-studio-gold text-white hover:bg-studio-gold-soft
              disabled:opacity-60 disabled:cursor-not-allowed font-sans tracking-wide"
          >
            {loading ? common.loading : common.resetPassword}
          </button>

          <Link
            to="/admin/login"
            className="text-center text-studio-w2 hover:text-studio-white transition-colors no-underline text-[12px]"
          >
            ← {common.backToLogin}
          </Link>
        </form>
      </div>
    </div>
  )
}

export default AdminResetPassword
