import { AMPEL_LABELS, PENDING_AMPEL } from '../../utils/anamnesisAmpel'

const SIZE_CLASS = {
  sm: 'text-[12px]',
  md: 'text-[14px]',
}

const LABEL_CLASS = {
  sm: 'text-[9px]',
  md: 'text-[10px]',
}

/**
 * Compact medical ampel indicator for lists and CRM cards.
 * @param {'gruen'|'orange'|'rot'|null} level
 * @param {boolean} pending — show neutral dot when anamnesis not yet complete
 * @param {number} [count] — open medical flags (tooltip only)
 * @param {'stacked'|'inline'|'none'} labelMode — stacked = label under dot (tables)
 */
const MedicalAmpelDot = ({
  level,
  pending = false,
  count = 0,
  labelMode = 'stacked',
  size = 'md',
}) => {
  const sizeClass = SIZE_CLASS[size] ?? SIZE_CLASS.md
  const labelClass = LABEL_CLASS[size] ?? LABEL_CLASS.md

  if (!level) {
    if (!pending) return null
    const meta = PENDING_AMPEL
    return (
      <AmpelDisplay
        meta={meta}
        title={meta.label}
        sizeClass={sizeClass}
        labelClass={labelClass}
        labelMode={labelMode}
      />
    )
  }

  const meta = AMPEL_LABELS[level]
  if (!meta) return null

  const title = count > 0 ? `${meta.label} (${count} offen)` : meta.label

  return (
    <AmpelDisplay
      meta={meta}
      title={title}
      sizeClass={sizeClass}
      labelClass={labelClass}
      labelMode={labelMode}
      colored
    />
  )
}

const AmpelDisplay = ({ meta, title, sizeClass, labelClass, labelMode, colored = false }) => {
  const textColor = colored
    ? meta.className.split(' ').find((c) => c.startsWith('text-')) ?? 'text-studio-w2'
    : 'text-studio-w3'

  if (labelMode === 'none') {
    return (
      <span className={`${sizeClass} inline-block leading-none`} title={title}>
        {meta.emoji}
      </span>
    )
  }

  if (labelMode === 'inline') {
    return (
      <span
        className={`${sizeClass} inline-flex items-center gap-1 leading-none`}
        title={title}
      >
        <span aria-hidden>{meta.emoji}</span>
        <span className={`${labelClass} font-semibold ${textColor}`}>{meta.shortLabel}</span>
      </span>
    )
  }

  return (
    <span
      className="inline-flex flex-col items-center gap-0.5 leading-none min-w-[52px]"
      title={title}
    >
      <span className={sizeClass} aria-hidden>{meta.emoji}</span>
      <span className={`${labelClass} font-medium ${textColor} text-center leading-tight`}>
        {meta.shortLabel}
      </span>
    </span>
  )
}

export default MedicalAmpelDot
