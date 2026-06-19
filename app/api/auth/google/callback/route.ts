import { NextResponse } from 'next/server'
import {
  exchangeGoogleCode,
  getAppOrigin,
  parseOAuthState,
} from '@/lib/google-oauth-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const appOrigin = getAppOrigin()
  const fallback = `${appOrigin}/auth/google/callback`

  const oauthError = searchParams.get('error')
  if (oauthError) {
    const target = new URL(fallback)
    target.searchParams.set('googleError', oauthError)
    return NextResponse.redirect(target)
  }

  const code = searchParams.get('code')
  const state = parseOAuthState(searchParams.get('state'))

  if (!code || !state) {
    const target = new URL(fallback)
    target.searchParams.set('googleError', 'Invalid Google OAuth state')
    return NextResponse.redirect(target)
  }

  try {
    const { idToken } = await exchangeGoogleCode(code)
    const roleHint = state.roleHint === 'doctor' ? 'doctor' : 'patient'
    const target = new URL(fallback)

    target.hash = new URLSearchParams({
      idToken,
      roleHint,
    }).toString()

    return NextResponse.redirect(target)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google authentication failed'
    const target = new URL(fallback)
    target.searchParams.set('googleError', message)
    return NextResponse.redirect(target)
  }
}
