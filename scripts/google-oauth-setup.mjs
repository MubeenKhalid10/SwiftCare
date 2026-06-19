import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(filename) {
  const filePath = resolve(process.cwd(), filename)
  if (!existsSync(filePath)) return

  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^"|"$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const backendUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '').replace(/\/+$/, '')
const webClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '(not set)'
const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/+$/, '')

console.log('\nSwiftCare environment setup\n')
console.log('Backend URL (NEXT_PUBLIC_API_URL):')
console.log(`  ${backendUrl || '(not set — add to .env.local)'}`)
console.log('\nGoogle web client ID:')
console.log(`  ${webClientId}`)
console.log('\nIf using backend Google OAuth redirect, register this URI in Google Cloud Console:')
if (backendUrl) {
  console.log(`  ${backendUrl}/auth/google/web/callback`)
}
console.log('\nLocal frontend:')
console.log(`  ${appOrigin}/auth/login`)
console.log('\nTo change the backend everywhere, update only:')
console.log('  NEXT_PUBLIC_API_URL in .env.local')
console.log('Then restart: npm run dev')
console.log('')
