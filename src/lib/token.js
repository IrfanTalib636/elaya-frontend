/** Decode JWT expiry without verifying signature (client-side hint only). */
export const isJwtExpired = (token, skewMs = 30_000) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return true
    return Date.now() >= payload.exp * 1000 - skewMs
  } catch {
    return true
  }
}
