import { useNavigate } from 'react-router-dom'
import elayadLogo from '../assets/elaya-logo.png'
import { landing } from '../content'

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-landing-bg flex flex-col items-center justify-center font-sans gap-8">

      <img
        src={elayadLogo}
        alt="Elaya"
        className="block w-[220px] mx-auto mb-4 mix-blend-screen bg-transparent"
      />

      <p className="text-studio-w3 text-lg m-0">
        {landing.tagline}
      </p>

      <div className="flex gap-4">
        {/* Customer → mobile only, external link placeholder */}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="bg-studio-teal text-landing-bg py-3 px-8 rounded-xl font-bold text-base cursor-pointer font-sans no-underline"
        >
          {landing.customerLabel}
        </a>

        <button
          onClick={() => navigate('/studio/login')}
          className="bg-studio-gold text-landing-bg py-3 px-8 rounded-xl font-bold text-base border-0 cursor-pointer font-sans"
        >
          {landing.studioLabel}
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5 mt-2">
        <button
          onClick={() => navigate('/admin/login')}
          className="bg-landing-btn-dark text-studio-white border border-admin-emerald py-2 px-5 rounded-[10px] font-semibold text-[13px] cursor-pointer font-sans"
        >
          {landing.adminLabel}
        </button>
        <span className="text-studio-w4 text-[11px]">{landing.adminSub}</span>
      </div>

    </div>
  )
}

export default LandingPage
