import { NextResponse } from 'next/server'
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api-config'

/**
 * Legacy entry point kept for old links/bookmarks.
 * Delegates to the backend OAuth flow instead of returning JSON config errors.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const roleHint = searchParams.get('roleHint') === 'doctor' ? 'doctor' : 'patient'
  const returnUrl = searchParams.get('returnUrl') || `${new URL(request.url).origin}/auth/google/callback`

  const target = new URL(buildApiUrl(API_ENDPOINTS.AUTH.GOOGLE_WEB_START))
  target.searchParams.set('roleHint', roleHint)
  target.searchParams.set('returnUrl', returnUrl)

  return NextResponse.redirect(target.toString())
}
