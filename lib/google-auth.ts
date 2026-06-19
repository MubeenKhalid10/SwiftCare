import { buildApiUrl, API_ENDPOINTS } from '@/lib/api-config'

export function getGoogleOAuthStartUrl(roleHint: 'patient' | 'doctor', returnUrl?: string): string {
  const params = new URLSearchParams({ roleHint })
  if (returnUrl) {
    params.set('returnUrl', returnUrl)
  }
  return buildApiUrl(`${API_ENDPOINTS.AUTH.GOOGLE_WEB_START}?${params.toString()}`)
}

export type GoogleRedirectSession = {
  accessToken: string
  refreshToken: string
  userId: string
  role: 'patient' | 'doctor' | 'admin'
  name?: string
  email?: string
}

export type GoogleIdTokenSession = {
  idToken: string
  roleHint: 'patient' | 'doctor'
}

export function parseGoogleRedirectHash(
  hash: string
): GoogleRedirectSession | GoogleIdTokenSession | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw) return null

  const params = new URLSearchParams(raw)
  const idToken = params.get('idToken')
  const roleHint = params.get('roleHint')

  if (idToken && (roleHint === 'patient' || roleHint === 'doctor')) {
    return { idToken, roleHint }
  }

  const accessToken = params.get('accessToken')
  const refreshToken = params.get('refreshToken')
  const userId = params.get('userId')
  const role = params.get('role')

  if (!accessToken || !refreshToken || !userId || !role) {
    return null
  }

  if (!['patient', 'doctor', 'admin'].includes(role)) {
    return null
  }

  return {
    accessToken,
    refreshToken,
    userId,
    role: role as GoogleRedirectSession['role'],
    name: params.get('name') || undefined,
    email: params.get('email') || undefined,
  }
}

export function isGoogleIdTokenSession(
  session: GoogleRedirectSession | GoogleIdTokenSession
): session is GoogleIdTokenSession {
  return 'idToken' in session
}
