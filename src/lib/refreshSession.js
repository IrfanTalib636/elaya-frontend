import axios from 'axios'
import { TOKEN_KEY } from './session'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

/** Exchange HttpOnly refresh cookie for a new access token (no Bearer required). */
export const trySilentRefresh = async () => {
  const res = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
  const accessToken = res.data.data.accessToken
  localStorage.setItem(TOKEN_KEY, accessToken)
  return accessToken
}
