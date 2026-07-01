import logoMark from '../assets/elaya-logo.svg'

const SIZES = {
  sm: { img: 'h-6',  text: 'text-[14px] tracking-[0.2em]',  gap: 'gap-2'   },
  md: { img: 'h-8',  text: 'text-[17px] tracking-[0.22em]', gap: 'gap-2.5' },
  lg: { img: 'h-10', text: 'text-[20px] tracking-[0.24em]', gap: 'gap-3'   },
}

const ElayaLogo = ({ size = 'md', className = '', markOnly = false }) => {
  const s = SIZES[size] ?? SIZES.md

  if (markOnly) {
    return <img src={logoMark} alt="Elaya" className={`${s.img} ${className}`} />
  }

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <img src={logoMark} alt="Elaya" className={s.img} />
      <span className={`text-studio-white font-bold ${s.text} leading-none`}>
        ELAYA
      </span>
    </div>
  )
}

export default ElayaLogo
