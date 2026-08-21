import i18n from '../i18n/i18n.config'

export function getApiErrorMessage(error, fallback) {
  const resolvedFallback = fallback ?? i18n.t('common.serverError')
  const data = error?.response?.data

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.message).join(', ')
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }

  return resolvedFallback
}
