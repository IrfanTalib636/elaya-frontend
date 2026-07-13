import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import ElayaLogo from '../../components/ElayaLogo'
import { adminAuth, common, toast as toastMessages } from '../../content'
import useAuthStore from '../../store/authStore'
import { ADMIN_ROLES } from '../../constants/roles'
import { getApiErrorMessage } from '../../lib/apiError'

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-admin-ivory text-[11px] font-semibold tracking-wide">
      {label}
    </label>
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

const AdminLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useAuthStore((state) => state.login)

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
      await signIn({
        email: form.email,
        password: form.password,
        allowedRoles: ADMIN_ROLES,
      })

      toast.success(toastMessages.loginSuccess)
      const redirectTo = location.state?.from?.pathname || '/admin'
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
    <div className="min-h-screen bg-admin-bg flex flex-col items-center justify-center font-admin px-4">
      <div className="w-full max-w-[360px] bg-admin-bg-card border border-admin-line rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <ElayaLogo size="md" />
          <div className="text-center">
            <h1 className="text-admin-ivory font-bold text-xl m-0 leading-tight tracking-wide">
              {adminAuth.loginTitle}
            </h1>
            <p className="text-admin-dim text-[12px] mt-1 m-0 tracking-widest uppercase">
              {adminAuth.loginSubtitle}
            </p>
          </div>
        </div>

        <div className="h-px bg-admin-line" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" translate="no">
          <Field label={common.email}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@mail.ch"
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-admin-ivory text-[11px] font-semibold tracking-wide">
                {common.password}
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-admin-dim text-[11px] hover:text-admin-ivory transition-colors no-underline"
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

          {error && <p className="text-admin-carmine text-[12px] m-0">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[11px] rounded-[12px] border border-admin-emerald font-bold text-[13px]
              cursor-pointer transition-all bg-admin-emerald text-white hover:bg-admin-emerald-soft
              disabled:opacity-60 disabled:cursor-not-allowed mt-1 font-sans tracking-wide"
          >
            {loading ? common.loading : common.login}
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 text-admin-dim text-[12px] bg-transparent border-0 cursor-pointer hover:text-admin-ivory transition-colors font-sans"
      >
        ← {common.back}
      </button>
    </div>
  )
}

export default AdminLogin
