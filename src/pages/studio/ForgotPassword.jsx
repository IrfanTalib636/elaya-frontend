import { Link } from 'react-router-dom'
import elayadLogo from '../../assets/elaya-logo.png'

const StudioForgotPassword = () => (
  <div className="min-h-screen bg-studio-bg flex flex-col items-center justify-center font-sans px-4">
    <div className="w-full max-w-[380px] bg-studio-bg-3 border border-elaya-border rounded-2xl p-8 flex flex-col gap-4 text-center">
      <img
        src={elayadLogo}
        alt="Elaya"
        className="w-[90px] mix-blend-screen bg-transparent mx-auto"
      />
      <h1 className="text-studio-white font-bold text-xl m-0">Passwort Vergessen</h1>
      <p className="text-studio-w2 text-[13px] m-0 leading-relaxed">
        Diese Funktion ist noch nicht verfügbar.
      </p>
      <Link
        to="/studio/login"
        className="text-studio-gold hover:text-studio-gold-2 transition-colors no-underline font-semibold text-[12px] mt-2"
      >
        ← Zurück zur Anmeldung
      </Link>
    </div>
  </div>
)

export default StudioForgotPassword
