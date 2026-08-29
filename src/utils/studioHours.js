const JS_DAY_TO_KEY = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa']

export const resolveHoursForDate = (weekly = {}, exceptions = [], iso) => {
  const key = String(iso || '').slice(0, 10)
  const exception = exceptions.find((item) => item.datum === key)
  if (exception) {
    return {
      offen: exception.offen !== false,
      von: exception.von,
      bis: exception.bis,
      notiz: exception.notiz || '',
      source: 'exception',
    }
  }

  const date = new Date(`${key}T12:00:00`)
  const weekday = weekly[JS_DAY_TO_KEY[date.getDay()]]
  // Hours always come from the studio; a missing weekday means closed.
  if (!weekday) {
    return { offen: false, von: undefined, bis: undefined, notiz: '', source: 'weekly' }
  }
  return {
    offen: weekday.offen !== false,
    von: weekday.von,
    bis: weekday.bis,
    notiz: '',
    source: 'weekly',
  }
}
