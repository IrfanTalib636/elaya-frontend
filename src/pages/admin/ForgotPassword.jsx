import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import ElayaLogo from '../../components/ElayaLogo'
import { forgotPassword } from '../../api/auth'
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

const AdminForgotPassword = () => {
  const { adminAuth, common, toast: toastMessages } = useContent()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setError(common.required)
      return
    }

    setLoading(true)
    setError('')

    try {
      await forgotPassword({ email: email.trim(), portal: 'admin' })
      setSent(true)
      toast.success(toastMessages.forgotPasswordSent)
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
      <div className="w-full max-w-[360px] bg-studio-bg-card border border-elaya-border rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <ElayaLogo size="md" />
          <div className="text-center">
            <h1 className="text-studio-white font-bold text-xl m-0 leading-tight tracking-wide">
              {adminAuth.forgotTitle}
            </h1>
            <p className="text-studio-w2 text-[12px] mt-1 m-0 leading-relaxed">
              {adminAuth.forgotSubtitle}
            </p>
          </div>
        </div>

        <div className="h-px bg-elaya-border" />

        {sent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-studio-w2 text-[13px] m-0 leading-relaxed">
              {toastMessages.forgotPasswordSent}
            </p>
            <Link
              to="/admin/login"
              className="text-studio-gold-2 hover:text-studio-gold-2 transition-colors no-underline font-semibold text-[12px]"
            >
              ← {common.backToLogin}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" translate="no">
            <Field label={common.email}>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="admin@mail.ch"
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
              {loading ? common.loading : common.sendResetLink}
            </button>

            <Link
              to="/admin/login"
              className="text-center text-studio-w2 hover:text-studio-white transition-colors no-underline text-[12px]"
            >
              ← {common.backToLogin}
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}

export default AdminForgotPassword
