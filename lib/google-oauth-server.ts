import crypto from 'crypto'

const STATE_TTL_MS = 10 * 60 * 1000

function trimQuotes(value?: string | null): string {
  return String(value || '').replace(/^"|"$/g, '').trim()
}

export function getGoogleClientId(): string {
  return trimQuotes(
    process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '911635912176-io7eeq8vr81m3j23thic57pcn1s4lj6t.apps.googleusercontent.com'
  )
}

export function getGoogleClientSecret(): string {
  return trimQuotes(
    process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_WEB_CLIENT_SECRET
  )
}

export function getAppOrigin(): string {
  const explicit = trimQuotes(process.env.NEXT_PUBLIC_APP_URL)
  if (explicit) {
    return explicit.replace(/\/+$/, '')
  }

  const vercelUrl = trimQuotes(process.env.VERCEL_URL)
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, '')}`
  }

  const port = trimQuotes(process.env.PORT) || '3001'
  return `http://localhost:${port}`
}

export function getGoogleRedirectUri(): string {
  const override = trimQuotes(process.env.GOOGLE_OAUTH_REDIRECT_URI)
  if (override) {
    return override.replace(/\/+$/, '')
  }

  return `${getAppOrigin()}/api/auth/google/callback`
}

function getStateSecret(): string {
  return getGoogleClientSecret() || 'swiftcare-google-oauth-state'
}

export function signOAuthState(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', getStateSecret())
    .update(encoded)
    .digest('base64url')

  return `${encoded}.${signature}`
}

export function parseOAuthState(state: string | null): Record<string, unknown> | null {
  if (!state) return null

  const [encoded, signature] = state.split('.')
  if (!encoded || !signature) return null

  const expected = crypto
    .createHmac('sha256', getStateSecret())
    .update(encoded)
    .digest('base64url')

  if (signature !== expected) return null

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      ts?: number
      roleHint?: string
    }

    if (!payload?.ts || Date.now() - payload.ts > STATE_TTL_MS) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function buildGoogleAuthUrl(roleHint: 'patient' | 'doctor'): string {
  const state = signOAuthState({
    roleHint,
    ts: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  })

  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    access_type: 'online',
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGoogleCode(code: string): Promise<{ idToken: string }> {
  const clientId = getGoogleClientId()
  const clientSecret = getGoogleClientSecret()
  const redirectUri = getGoogleRedirectUri()

  if (!clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET is missing in .env.local')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof data?.error_description === 'string'
        ? data.error_description
        : typeof data?.error === 'string'
          ? data.error
          : 'Failed to exchange Google authorization code'

    throw new Error(message)
  }

  if (!data?.id_token || typeof data.id_token !== 'string') {
    throw new Error('Google did not return an ID token')
  }

  return { idToken: data.id_token }
}

export function getGoogleOAuthConfig() {
  return {
    clientId: getGoogleClientId(),
    redirectUri: getGoogleRedirectUri(),
    appOrigin: getAppOrigin(),
    hasClientSecret: Boolean(getGoogleClientSecret()),
  }
}
