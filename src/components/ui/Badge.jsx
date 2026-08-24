/**
 * Pipeline stage + status badges.
 * variant: pipeline | status | source | default
 */
import useContent from '../../i18n/useContent'

const PIPELINE_COLORS = {
  'Neu':                'bg-studio-w4 text-studio-w1',
  'Beratung geplant':   'bg-studio-gold/15 text-studio-gold-2',
  'Behandlung aktiv':   'bg-elaya-success/15 text-elaya-success',
  'Beratung erledigt':  'bg-studio-w4 text-studio-w2',
}

const STATUS_COLORS = {
  pending:                   'bg-studio-gold/15 text-studio-gold-2',
  active:                    'bg-elaya-success/15 text-elaya-success',
  completed:                 'bg-studio-w4 text-studio-w2',
  loeschantrag_ausstehend:   'bg-elaya-error/15 text-elaya-error',
  aktiv:                     'bg-elaya-success/15 text-elaya-success',
  ausstehend:                'bg-studio-gold/15 text-studio-gold-2',
  gesperrt:                  'bg-elaya-error/15 text-elaya-error',
  gebucht:                   'bg-studio-gold/15 text-studio-gold-2',
  storniert:                 'bg-elaya-error/15 text-elaya-error',
}

const SOURCE_COLORS = {
  studio_eigen:         'bg-elaya-success/15 text-elaya-success',
  plattform_vermittelt: 'bg-studio-gold/15 text-studio-gold-2',
  studio_wechsel:       'bg-[#ff9a3c]/15 text-[#ff9a3c]',
}

const Badge = ({ children, variant = 'default', value, className = '' }) => {
  const { t } = useContent()
  let colorClass = 'bg-studio-w4 text-studio-w1'
  const raw = value ?? children

  if (variant === 'pipeline')  colorClass = PIPELINE_COLORS[raw] ?? colorClass
  if (variant === 'status')    colorClass = STATUS_COLORS[raw]   ?? colorClass
  if (variant === 'source')    colorClass = SOURCE_COLORS[raw]   ?? colorClass

  let label = children
  if (variant === 'status' && typeof raw === 'string') {
    label = t(`components.badge.${raw}`, { defaultValue: children ?? raw })
  } else if (variant === 'pipeline' && typeof raw === 'string') {
    label = t(`pipeline.${raw}`, { defaultValue: children ?? raw })
  }

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full
        text-[10px] font-semibold whitespace-nowrap
        ${colorClass} ${className}
      `}
    >
      {label}
    </span>
  )
}

export default Badge
