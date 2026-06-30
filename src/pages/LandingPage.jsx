import { useNavigate } from 'react-router-dom'
import { Smartphone, Monitor, ArrowRight, Settings } from 'lucide-react'
import elayadLogo from '../assets/elaya-logo.png'
import { landing } from '../content'

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="h-screen bg-landing-bg flex flex-col font-sans overflow-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 shrink-0">
        <img
          src={elayadLogo}
          alt="Elaya"
          className="h-14 mix-blend-screen bg-transparent"
        />
      </nav>

      {/* Hero — fills remaining height */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl text-center">

          {/* Badge */}
          <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-elaya-border bg-studio-bg-3 text-studio-gold-2 text-[10px] font-semibold tracking-widest uppercase">
            {landing.badge}
          </span>

          {/* Headline + subtitle */}
          <div className="flex flex-col gap-2">
            <h1 className="text-studio-white text-3xl font-bold m-0 leading-tight tracking-tight">
              {landing.tagline}
            </h1>
            <p className="text-studio-w2 text-[13px] m-0 leading-relaxed max-w-md mx-auto">
              {landing.subtitle}
            </p>
          </div>

          {/* Portal label */}
          <p className="text-studio-w3 text-[11px] tracking-widest uppercase m-0">
            {landing.portalHeading}
          </p>

          {/* Portal Cards */}
          <div className="grid grid-cols-2 gap-4 w-full">

            {/* Customer App */}
            <div className="flex flex-col gap-3 p-5 rounded-[16px] border border-elaya-border bg-studio-bg-3 text-left">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-[10px] bg-studio-bg-4 flex items-center justify-center shrink-0">
                  <Smartphone size={16} className="text-studio-w2" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide text-studio-w3 border border-elaya-border rounded-full px-2.5 py-0.5 shrink-0">
                  {landing.customerBadge}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-studio-white text-[14px] font-bold m-0">{landing.customerLabel}</h2>
                <p className="text-studio-w3 text-[11px] m-0 leading-relaxed">{landing.customerSub}</p>
              </div>
              <button
                type="button"
                disabled
                className="flex items-center gap-1.5 text-studio-w3 text-[11px] font-semibold bg-transparent border-0 p-0 opacity-40 cursor-not-allowed"
              >
                {landing.customerCta} <ArrowRight size={12} />
              </button>
            </div>

            {/* Studio Dashboard */}
            <div
              className="flex flex-col gap-3 p-5 rounded-[16px] border border-studio-gold/30 bg-studio-bg-3 text-left cursor-pointer transition-all hover:border-studio-gold/60 hover:bg-studio-bg-4"
              onClick={() => navigate('/studio/login')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/studio/login')}
            >
              <div className="w-9 h-9 rounded-[10px] bg-studio-gold/10 flex items-center justify-center shrink-0">
                <Monitor size={16} className="text-studio-gold-2" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-studio-white text-[14px] font-bold m-0">{landing.studioLabel}</h2>
                <p className="text-studio-w3 text-[11px] m-0 leading-relaxed">{landing.studioSub}</p>
              </div>
              <span className="flex items-center gap-1.5 text-studio-gold-2 text-[11px] font-semibold">
                {landing.studioCta} <ArrowRight size={12} />
              </span>
            </div>

          </div>

          {/* Admin */}
          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-1.5 text-studio-w3 text-[11px] bg-transparent border-0 cursor-pointer hover:text-studio-w2 transition-colors"
          >
            <Settings size={12} />
            <span>{landing.adminCta}</span>
            <span className="text-studio-w4 mx-0.5">·</span>
            <span>{landing.adminSub}</span>
          </button>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center px-8 py-3 shrink-0">
        <p className="text-studio-w4 text-[11px] m-0">{landing.footer}</p>
      </footer>

    </div>
  )
}

export default LandingPage
