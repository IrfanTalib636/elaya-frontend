/** First + last initial for customer avatars (ignores leading spaces). */
export const customerInitials = (vorname, nachname) => {
  const first = vorname?.trim()?.[0] ?? ''
  const last = nachname?.trim()?.[0] ?? ''
  const initials = `${first}${last}`.toUpperCase()
  return initials || '?'
}

const SIZES = {
  sm: 'w-7 h-7 text-[11px]',
  lg: 'w-14 h-14 text-[18px]',
}

/**
 * Circle avatar with initials — translate="no" avoids Chrome auto-translate
 * replacing short text (e.g. seed names like PagTest) with garbage.
 */
const CustomerAvatar = ({ vorname, nachname, size = 'sm', className = '' }) => (
  <div
    translate="no"
    className={`rounded-full bg-studio-gold/15 flex items-center justify-center text-studio-gold-2 font-bold shrink-0 ${SIZES[size]} ${className}`}
    aria-hidden="true"
  >
    {customerInitials(vorname, nachname)}
  </div>
)

export default CustomerAvatar
