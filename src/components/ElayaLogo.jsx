import bannerLogo from '../assets/bannerLogo.png'

const SIZES = {
  sm: { img: 'h-8 max-w-[160px]', mark: 'h-6 w-6' },
  md: { img: 'h-12 max-w-[220px]', mark: 'h-8 w-8' },
  lg: { img: 'h-16 max-w-[280px]', mark: 'h-10 w-10' },
}

const ElayaLogo = ({ size = 'md', className = '', markOnly = false }) => {
  const s = SIZES[size] ?? SIZES.md

  if (markOnly) {
    return (
      <img
        src={bannerLogo}
        alt="Elaya"
        className={`${s.mark} object-cover object-left ${className}`}
      />
    )
  }

  return (
    <img
      src={bannerLogo}
      alt="Elaya"
      className={`${s.img} w-auto object-contain ${className}`}
    />
  )
}

export default ElayaLogo
