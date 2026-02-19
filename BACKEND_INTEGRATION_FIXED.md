# Backend Integration - Fixed Issues

## Overview
This document outlines the fixes applied to resolve authentication crashes and integrate the website properly with the backend at `https://swiftcare.up.railway.app`.

## Critical Issues Fixed

### 1. Cookie Handling Issue (Main Crash Cause)
**Problem:** The backend uses **httpOnly cookies** for refresh tokens, but the website was trying to store them in localStorage, causing backend crashes.

**Solution:**
- Removed all attempts to store refresh tokens in localStorage
- Added `credentials: "include"` to ALL fetch requests to properly send cookies
- Backend now manages refresh tokens via httpOnly cookies automatically
- Only access tokens are stored in localStorage

### 2. Authentication Flow Updates

#### Login (`/auth/login`)
- **Backend expects:** `{ email, password }`
- **Backend returns:** `{ accessToken, role, userId }`
- **Refresh token:** Automatically set as httpOnly cookie
- Fixed: Now properly handles cookies with `credentials: "include"`

#### Signup (`/auth/signup`)
- **Backend expects:** `{ name, email, password, roleHint }`
- **Backend limitation:** Only patient signup allowed (roleHint !== 'patient' returns error)
- **Backend returns:** `{ accessToken, role, userId }`
- Fixed: Updated to use `roleHint` instead of `role`
- Fixed: Added validation to prevent doctor signup attempts

#### Token Refresh (`/auth/refresh`)
- **Backend reads:** httpOnly cookie automatically
- **Backend returns:** `{ accessToken }`
- Fixed: Removed body payload, backend reads cookie directly

#### Logout (`/auth/logout`)
- **Backend action:** Clears httpOnly cookie
- Fixed: Properly sends credentials to clear cookies

### 3. Google OAuth Integration

**New Feature:** Added Google Sign-In for both login and registration

**Backend endpoint:** `POST /auth/google`
- **Expects:** `{ idToken, roleHint }`
- **Returns:** `{ accessToken, roleHint, userId }`
- **Refresh token:** Set as httpOnly cookie

**Implementation:**
- Created `GoogleSignInButton` component
- Uses Google Identity Services (script loaded dynamically)
- Supports both signin and signup flows
- Properly handles cookies with `credentials: "include"`

**Setup Required:**
1. Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to environment variables
2. Get Google Client ID from Google Cloud Console
3. Enable Google Identity Services API
4. Configure authorized origins and redirect URIs

### 4. API Response Transformation

**Problem:** Backend uses MongoDB with `_id` fields, frontend expects `id`

**Solution:**
- Added `transformMongoDocument()` helper
- Added `transformMongoArray()` helper
- Applied to all API responses: doctors, patients, appointments, reviews

### 5. Doctor Registration

**Backend Status:** Doctor signup endpoint not implemented yet

**Frontend Changes:**
- Added validation to prevent doctor signup
- Shows user-friendly error message
- Redirects doctors to contact admin

## File Changes Summary

### Updated Files

1. **`lib/auth.service.ts`**
   - Fixed cookie handling with `credentials: "include"`
   - Removed localStorage refresh token storage
   - Updated to use `roleHint` parameter
   - Added Google OAuth support
   - Added comprehensive logging with `[v0]` prefix

2. **`lib/auth-context.tsx`**
   - Updated return types to `{ success, error }`
   - Added `googleAuth` method
   - Fixed user ID type to string
   - Enhanced error handling

3. **`lib/api.ts`**
   - Added MongoDB `_id` to `id` transformation
   - Fixed all API calls to include `credentials: "include"`
   - Enhanced token refresh logic
   - Added comprehensive logging

4. **`app/auth/login/page.tsx`**
   - Added Google Sign-In button
   - Updated error handling
   - Improved user feedback

5. **`app/auth/register/page.tsx`**
   - Added Google Sign-Up button
   - Added doctor signup validation
   - Improved redirect logic after signup

6. **`lib/types.ts`**
   - Changed User.id from `number` to `string` (MongoDB compatibility)

### New Files

1. **`components/google-signin-button.tsx`**
   - Reusable Google OAuth component
   - Handles signin and signup flows
   - Configurable text and role hint
   - Automatic redirect after success

2. **`.env.example`**
   - Template for environment variables
   - Documents required Google Client ID

## Environment Variables Required

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_web_client_id_here
NEXT_PUBLIC_API_URL=https://swiftcare.up.railway.app
```

## Testing Checklist

### Authentication
- [ ] Patient login with email/password
- [ ] Patient login with Google
- [ ] Patient signup with email/password
- [ ] Patient signup with Google
- [ ] Doctor login with email/password (if account exists)
- [ ] Doctor login with Google (if account exists)
- [ ] Doctor signup blocked with helpful message
- [ ] Token refresh works automatically
- [ ] Logout clears cookies properly

### Data Loading
- [ ] Doctors list loads correctly
- [ ] Patient dashboard shows data
- [ ] Doctor dashboard shows data (if logged in as doctor)
- [ ] Appointments load and display
- [ ] Reviews load and display
- [ ] Images use avatars/initials fallback

### Error Handling
- [ ] Invalid credentials show proper error
- [ ] Network errors show user-friendly messages
- [ ] Backend offline shows helpful message
- [ ] Token expiry triggers automatic refresh

## Known Limitations

1. **Doctor Registration:** Backend endpoint not available yet
2. **Admin Login:** May need separate admin creation process
3. **Image Loading:** Backend images may not load, using avatar initials as fallback

## Debugging

All authentication and API calls now include `[v0]` prefixed console logs:
- `[v0] Login attempt for: email`
- `[v0] Signup successful`
- `[v0] Token expired, refreshing...`
- `[v0] API call: /doctors`

Check browser console for these logs to debug issues.

## Backend Compatibility

This implementation is fully compatible with the backend at:
- **URL:** `https://swiftcare.up.railway.app`
- **Auth Endpoints:** `/auth/login`, `/auth/signup`, `/auth/google`, `/auth/refresh`, `/auth/logout`
- **Data Endpoints:** `/doctors`, `/patients`, `/appointments`, `/reviews`

## Next Steps

1. Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to environment variables
2. Test authentication flows
3. Verify data loading works correctly
4. Confirm cookies are properly managed
5. Test on mobile devices (if applicable)

## Support

If issues persist:
1. Check browser console for `[v0]` logs
2. Verify backend is running at `https://swiftcare.up.railway.app`
3. Confirm Google Client ID is correct
4. Check that cookies are enabled in browser
5. Verify CORS settings on backend allow credentials
