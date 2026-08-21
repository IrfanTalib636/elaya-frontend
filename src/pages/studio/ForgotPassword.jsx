import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import ElayaLogo from '../../components/ElayaLogo'
import { forgotPassword } from '../../api/auth'
import useContent from '../../i18n/useContent'
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

const StudioForgotPassword = () => {
  const { studioAuth, common, toast: toastMessages } = useContent()
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
      await forgotPassword({ email: email.trim(), portal: 'studio' })
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
      <div className="w-full max-w-[380px] bg-studio-bg-3 border border-elaya-border rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <ElayaLogo size="md" />
          <div className="text-center">
            <h1 className="text-studio-white font-bold text-xl m-0 leading-tight">
              {studioAuth.forgotTitle}
            </h1>
            <p className="text-studio-w2 text-[13px] mt-1 m-0 leading-relaxed">
              {studioAuth.forgotSubtitle}
            </p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-studio-w2 text-[13px] m-0 leading-relaxed">
              {toastMessages.forgotPasswordSent}
            </p>
            <Link
              to="/studio/login"
              className="text-studio-gold hover:text-studio-gold-2 transition-colors no-underline font-semibold text-[12px]"
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
                placeholder="studio@beispiel.de"
              />
            </Field>

            {error && <p className="text-studio-red text-[12px] m-0">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-[12px] rounded-[12px] border-0 font-bold text-[13px] cursor-pointer transition-all
                bg-studio-gold text-studio-bg hover:bg-studio-gold-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? common.loading : common.sendResetLink}
            </button>

            <Link
              to="/studio/login"
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

export default StudioForgotPassword
