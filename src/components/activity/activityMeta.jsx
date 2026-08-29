import {
  Calendar,
  CalendarClock,
  XCircle,
  UserX,
  Ban,
  HeartPulse,
  UserRound,
  Building2,
  Coins,
  ClipboardList,
  CircleDot,
} from 'lucide-react'
import useContent from '../../i18n/useContent'

const TAG_CLASS = {
  BUCHUNG: 'bg-elaya-success/15 text-elaya-success',
  STORNIERUNG: 'bg-elaya-error/15 text-elaya-error',
  'NEU ANGESETZT': 'bg-sky-400/15 text-sky-300',
  'NICHT ERSCHIENEN': 'bg-[#ff9a3c]/15 text-[#ff9a3c]',
  SPERRFRIST: 'bg-elaya-warning/15 text-elaya-warning',
  MEDIZIN: 'bg-violet-400/15 text-violet-300',
  STATUS: 'bg-elaya-success/15 text-elaya-success',
  PREIS: 'bg-studio-gold/15 text-studio-gold-2',
  SITZUNG: 'bg-studio-gold/15 text-studio-gold-2',
  PROFIL: 'bg-studio-w4 text-studio-w1',
  STUDIO: 'bg-studio-w4 text-studio-w1',
  SONSTIGES: 'bg-studio-w4 text-studio-w2',
}

const ICON_CLASS = {
  bookings: { Icon: Calendar, className: 'text-elaya-success' },
  cancellations: { Icon: XCircle, className: 'text-elaya-error' },
  reschedules: { Icon: CalendarClock, className: 'text-sky-300' },
  no_shows: { Icon: UserX, className: 'text-[#ff9a3c]' },
  lockouts: { Icon: Ban, className: 'text-elaya-warning' },
  medical: { Icon: HeartPulse, className: 'text-violet-300' },
  profile: { Icon: UserRound, className: 'text-studio-w1' },
  studio: { Icon: Building2, className: 'text-studio-w1' },
  prices: { Icon: Coins, className: 'text-studio-gold-2' },
  sessions: { Icon: ClipboardList, className: 'text-studio-gold-2' },
  other: { Icon: CircleDot, className: 'text-studio-w2' },
}

export const ActivityTag = ({ tag }) => {
  const { components } = useContent()
  const key = tag || 'SONSTIGES'
  const label = components.activityTags?.[key] || components.activityTags?.SONSTIGES || key
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wide uppercase ${
        TAG_CLASS[key] || TAG_CLASS.SONSTIGES
      }`}
    >
      {label}
    </span>
  )
}

export const ActivityIcon = ({ category }) => {
  const meta = ICON_CLASS[category] || ICON_CLASS.other
  const Icon = meta.Icon
  return (
    <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-studio-bg-4 shrink-0 ${meta.className}`}>
      <Icon size={15} />
    </span>
  )
}
