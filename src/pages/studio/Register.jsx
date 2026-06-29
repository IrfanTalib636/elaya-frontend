import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import elayadLogo from '../../assets/elaya-logo.png'
import { registerStudio } from '../../api/auth'
import { studioAuth, common, toast as toastMessages } from '../../content'
import { getApiErrorMessage } from '../../lib/apiError'

const INITIAL_FORM = {
  firma: '',
  studioCode: '',
  email: '',
  telefon: '',
  ort: '',
  password: '',
  confirmPassword: '',
}

export default function StudioRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const required = ['firma', 'studioCode', 'email', 'password', 'confirmPassword']
    if (required.some((key) => !form[key]?.trim())) {
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
      await registerStudio({
        firma: form.firma.trim(),
        studio_code: form.studioCode.trim().toUpperCase(),
        email: form.email.trim(),
        telefon: form.telefon.trim(),
        ort: form.ort.trim(),
        land: 'Schweiz',
        password: form.password,
      })

      toast.success(toastMessages.registerSuccess)
      navigate('/studio/login', { replace: true })
    } catch (err) {
      const message = getApiErrorMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col items-center justify-center font-sans px-4 py-10">
      <div className="w-full max-w-[420px] bg-studio-bg-3 border border-white/4 rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <img
            src={elayadLogo}
            alt="Elaya"
            className="w-[90px] mix-blend-screen bg-transparent"
          />
          <div className="text-center">
            <h1 className="text-studio-white font-bold text-xl m-0 leading-tight">
              {studioAuth.registerTitle}
            </h1>
            <p className="text-studio-w3 text-[13px] mt-1 m-0">
              {studioAuth.registerSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={studioAuth.studioName}>
            <Input name="firma" value={form.firma} onChange={handleChange} placeholder="Ink & Free Studio" />
          </Field>

          <Field label={studioAuth.studioCode}>
            <Input
              name="studioCode"
              value={form.studioCode}
              onChange={handleChange}
              placeholder="INKFREE"
              className="uppercase"
            />
          </Field>

          <Field label={common.email}>
            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="studio@beispiel.de" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={studioAuth.phone}>
              <Input name="telefon" type="tel" value={form.telefon} onChange={handleChange} placeholder="+41 78 000 00 00" />
            </Field>
            <Field label={studioAuth.city}>
              <Input name="ort" value={form.ort} onChange={handleChange} placeholder="Zürich" />
            </Field>
          </div>

          <Field label={common.password}>
            <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
          </Field>

          <Field label={common.confirmPassword}>
            <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
          </Field>

          {error && <p className="text-studio-red text-[12px] m-0">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[12px] rounded-[8px] border-0 font-bold text-[13px] cursor-pointer transition-all
              bg-linear-to-br from-studio-gold-2 to-studio-gold text-landing-bg
              disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? common.loading : studioAuth.registerButton}
          </button>
        </form>

        <p className="text-center text-studio-w4 text-[12px] m-0">
          {studioAuth.loginPrompt}{' '}
          <Link
            to="/studio/login"
            className="text-studio-gold hover:text-studio-gold-2 transition-colors no-underline font-semibold"
          >
            {common.login}
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
