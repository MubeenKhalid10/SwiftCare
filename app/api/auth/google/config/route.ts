import { NextResponse } from 'next/server'
import { getGoogleOAuthConfig } from '@/lib/google-oauth-server'

export async function GET() {
  return NextResponse.json(getGoogleOAuthConfig())
}
