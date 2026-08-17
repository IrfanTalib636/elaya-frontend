const JS_DAY_TO_KEY = ['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa']

export const resolveHoursForDate = (weekly = {}, exceptions = [], iso) => {
  const key = String(iso || '').slice(0, 10)
  const exception = exceptions.find((item) => item.datum === key)
  if (exception) {
    return {
      offen: exception.offen !== false,
      von: exception.von || '10:00',
      bis: exception.bis || '19:00',
      notiz: exception.notiz || '',
      source: 'exception',
    }
  }

  const date = new Date(`${key}T12:00:00`)
  const weekday = weekly[JS_DAY_TO_KEY[date.getDay()]] ?? { offen: true, von: '10:00', bis: '19:00' }
  return {
    offen: weekday.offen !== false,
    von: weekday.von || '10:00',
    bis: weekday.bis || '19:00',
    notiz: '',
    source: 'weekly',
  }
}
