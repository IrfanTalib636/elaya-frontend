import { useNavigate } from 'react-router-dom'
import ElayaLogo from '../components/ElayaLogo'
import { notFound } from '../content'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-landing-bg flex flex-col items-center justify-center font-sans px-4 text-center gap-6">
      <ElayaLogo size="lg" />

      <div className="flex flex-col gap-2">
        <p className="text-studio-gold text-6xl font-bold m-0 leading-none">{notFound.title}</p>
        <h1 className="text-studio-white text-xl font-semibold m-0">{notFound.heading}</h1>
        <p className="text-studio-w3 text-sm m-0 max-w-sm">{notFound.message}</p>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="bg-studio-gold text-landing-bg py-3 px-8 rounded-xl font-bold text-base border-0 cursor-pointer font-sans"
      >
        {notFound.homeButton}
      </button>
    </div>
  )
}

export default NotFoundPage
