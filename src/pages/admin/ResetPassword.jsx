import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ElayaLogo from '../../components/ElayaLogo'
import { resetPassword } from '../../api/auth'
import { adminAuth, common, toast as toastMessages } from '../../content'
import { getApiErrorMessage } from '../../lib/apiError'

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-admin-ivory text-[11px] font-semibold tracking-wide">{label}</label>
    {children}
  </div>
)

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-[14px] py-[10px] rounded-[8px] border-[1.5px] border-admin-line bg-admin-bg-card-2
      text-admin-ivory text-[13px] outline-none focus:border-admin-emerald transition-colors
      placeholder:text-admin-dim-2 font-sans ${className}`}
  />
)

const AdminResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

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
      <div className="min-h-screen bg-admin-bg flex flex-col items-center justify-center font-admin px-4">
        <div className="w-full max-w-[360px] bg-admin-bg-card border border-admin-line rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <ElayaLogo size="md" />
          <p className="text-admin-dim text-[13px] m-0 leading-relaxed">
            {toastMessages.invalidResetToken}
          </p>
          <Link
            to="/admin/forgot-password"
            className="text-admin-emerald hover:text-admin-emerald-soft transition-colors no-underline font-semibold text-[12px]"
          >
            {common.forgotPassword}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-admin-bg flex flex-col items-center justify-center font-admin px-4">
      <div className="w-full max-w-[360px] bg-admin-bg-card border border-admin-line rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <ElayaLogo size="md" />
          <div className="text-center">
            <h1 className="text-admin-ivory font-bold text-xl m-0 leading-tight tracking-wide">
              {adminAuth.resetTitle}
            </h1>
            <p className="text-admin-dim text-[12px] mt-1 m-0 leading-relaxed">
              {adminAuth.resetSubtitle}
            </p>
          </div>
        </div>

        <div className="h-px bg-admin-line" />

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

          {error && <p className="text-admin-carmine text-[12px] m-0">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[11px] rounded-[12px] border border-admin-emerald font-bold text-[13px]
              cursor-pointer transition-all bg-admin-emerald text-white hover:bg-admin-emerald-soft
              disabled:opacity-60 disabled:cursor-not-allowed font-sans tracking-wide"
          >
            {loading ? common.loading : common.resetPassword}
          </button>

          <Link
            to="/admin/login"
            className="text-center text-admin-dim hover:text-admin-ivory transition-colors no-underline text-[12px]"
          >
            ← {common.backToLogin}
          </Link>
        </form>
      </div>
    </div>
  )
}

export default AdminResetPassword
