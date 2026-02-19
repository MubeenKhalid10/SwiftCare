# Environment Variables Setup

## Overview

The SwiftCare frontend requires minimal environment configuration as the backend URL is built into the code. However, this guide covers all environment-related setup.

## Current Configuration

### Backend URL
**Location**: Hardcoded in multiple files
- `/lib/auth.service.ts` - Line 1: `const BASE_URL = "https://swiftcare.up.railway.app";`
- `/lib/api.ts` - Line 4: `const API_BASE_URL = "https://swiftcare.up.railway.app"`
- `/lib/api-config.ts` - Centralized config

**No environment variable needed** - URL is hardcoded.

### Changing Backend URL

If you need to use a different backend URL:

#### Option 1: Update Hardcoded Values (Quick)
```bash
# Edit these files:
# /lib/auth.service.ts
const BASE_URL = "https://your-backend-url.com";

# /lib/api.ts  
const API_BASE_URL = "https://your-backend-url.com";

# /lib/api-config.ts
export const API_BASE_URL = "https://your-backend-url.com";
```

#### Option 2: Add Environment Variable (Recommended)

Create `.env.local` file in project root:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

Then update `/lib/auth.service.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://swiftcare.up.railway.app";
```

And `/lib/api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://swiftcare.up.railway.app"
```

## Environment Variables Reference

### Frontend Environment Variables

| Variable | Value | Required | Purpose |
|----------|-------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://swiftcare.up.railway.app` | No | Backend API URL |

### Notes on NEXT_PUBLIC_ Prefix

In Next.js, only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. 

- ✅ `NEXT_PUBLIC_API_BASE_URL` - Accessible in browser
- ❌ `API_SECRET_KEY` - NOT accessible in browser (secure)

## Local Development Setup

### 1. Create `.env.local`

```bash
# Navigate to project root
cd /path/to/swiftcare

# Create .env.local file
touch .env.local
```

### 2. Add Variables

```
# Optional: Override default backend URL
NEXT_PUBLIC_API_BASE_URL=https://swiftcare.up.railway.app

# Optional: For development/debugging
NEXT_PUBLIC_DEBUG=false
```

### 3. Restart Dev Server

```bash
npm run dev
# Stop server (Ctrl+C) if already running
# It will auto-detect .env.local changes
```

## Production Deployment

### Vercel Deployment

1. **Push code to GitHub**
```bash
git add .
git commit -m "Backend integration"
git push origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import project from GitHub
   - Select repository

3. **Set Environment Variables**
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_BASE_URL` = `https://swiftcare.up.railway.app`
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit deployment URL

### Other Platforms

#### Netlify
```bash
# Create netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[env]
  NEXT_PUBLIC_API_BASE_URL = "https://swiftcare.up.railway.app"
```

#### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_PUBLIC_API_BASE_URL=https://swiftcare.up.railway.app

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Backend Environment Variables

The backend at `https://swiftcare.up.railway.app/` should have:

| Variable | Purpose | Status |
|----------|---------|--------|
| `NODE_ENV` | Environment (production) | Required |
| `MONGODB_URI` | Database connection | Required |
| `ACCESS_TOKEN_SECRET` | JWT signing key | Required |
| `REFRESH_TOKEN_SECRET` | JWT refresh key | Required |
| `PORT` | Server port | Optional (default 5000) |
| `CORS_ORIGIN` | Allowed frontend URLs | Required |

**Note**: These are configured on the backend. Frontend doesn't need them.

## Debugging Environment Variables

### Check Loaded Variables

Add temporary debug code to `/app/page.tsx`:

```typescript
'use client'

export default function Home() {
  // Only for development/debugging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] API URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
  }

  return (
    // ... rest of component
  )
}
```

### In Browser Console

```javascript
// Check if API URL is accessible
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL)

// Check if fetch works
fetch('https://swiftcare.up.railway.app/doctors')
  .then(r => r.json())
  .then(d => console.log('Backend accessible:', d))
  .catch(e => console.error('Backend error:', e))
```

## Common Issues & Solutions

### Issue: Backend URL Not Recognized
**Solution**: 
1. Verify `.env.local` exists in project root
2. Restart dev server
3. Check file format (no extra spaces/quotes)

### Issue: 404 from Backend
**Solution**:
1. Verify backend URL is correct
2. Check backend is running: `curl https://swiftcare.up.railway.app/health`
3. Check endpoint path is correct

### Issue: CORS Error
**Solution**:
1. Check backend CORS configuration
2. Verify frontend origin is allowed
3. Ensure credentials included in requests

### Issue: Environment Variable Not Loading
**Solution**:
1. Check file named `.env.local` (not `.env`)
2. Verify format: `KEY=VALUE` (no spaces)
3. Restart dev server after changes
4. Check for typos in variable names

## Security Best Practices

1. **Never commit `.env.local`**
   ```bash
   # Add to .gitignore
   .env.local
   .env.*.local
   ```

2. **Don't store secrets on frontend**
   - Only use `NEXT_PUBLIC_` for non-sensitive data
   - Backend keeps API keys secure

3. **Use HTTPS in production**
   - Backend must use HTTPS
   - Frontend must use HTTPS
   - Mixed content will fail

4. **Rotate tokens regularly**
   - Backend handles token expiration
   - Frontend auto-refreshes tokens

## Default Configuration

If no `.env.local` file exists, the application uses:

```
API_BASE_URL = https://swiftcare.up.railway.app
```

This is the default production backend.

## Checklist

- [ ] Backend deployed and running at `https://swiftcare.up.railway.app/`
- [ ] CORS enabled on backend for frontend origin
- [ ] Frontend can reach backend (test with curl)
- [ ] Local development works without `.env.local`
- [ ] Production deployment has correct backend URL
- [ ] All tokens configured on backend
- [ ] SSL/HTTPS enabled on both frontend and backend
- [ ] Error logging configured
- [ ] Database connection verified

## Support

If you have issues:
1. Check this file first
2. See `/BACKEND_SETUP_GUIDE.md` for setup help
3. Check `/BACKEND_INTEGRATION.md` for API details
4. View browser console for error messages
5. Check network requests in DevTools
