# Quick Setup Guide

## 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Google OAuth (Required for Google Sign-In)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Backend API (Already configured)
NEXT_PUBLIC_API_URL=https://swiftcare.up.railway.app
```

### Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google Identity Services" API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://yourapp.vercel.app`)
7. Copy the Client ID to your `.env.local` file

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## 4. Test Authentication

### Patient Login/Signup
- **URL:** `/auth/login` or `/auth/register`
- **Methods:** 
  - Email/Password
  - Google Sign-In
- **Test Account:** Create new patient account

### Doctor Login
- **URL:** `/auth/login`
- **Method:** Email/Password only
- **Note:** Doctor accounts must be created by admin (signup not available)

### Admin Login
- **URL:** `/admin/login`
- **Default Credentials:**
  - Email: `admin@swiftcare.com`
  - Password: `admin123`
- **Note:** Admin accounts are pre-created in backend

## 5. Features Available

### For Patients
- ✅ Sign up with email/password
- ✅ Sign up with Google
- ✅ Login with email/password
- ✅ Login with Google
- ✅ View doctors
- ✅ Book appointments
- ✅ View medical records
- ✅ View favorites

### For Doctors
- ✅ Login with email/password
- ✅ Login with Google (if account linked)
- ✅ View appointments
- ✅ Manage schedule
- ✅ View patients
- ✅ Update profile
- ❌ Sign up (not available - contact admin)

### For Admin
- ✅ Login with email/password
- ✅ Manage doctors
- ✅ Manage patients
- ✅ Manage appointments
- ✅ View analytics
- ✅ View transactions

## 6. Important Notes

### Cookie-Based Authentication
The backend uses **httpOnly cookies** for refresh tokens. This means:
- Refresh tokens are NOT accessible via JavaScript
- They are automatically sent with every request
- No manual token management needed
- More secure against XSS attacks

### Access Token Flow
1. Login → Get access token (stored in localStorage)
2. Access token expires after 15 minutes
3. System automatically refreshes using httpOnly cookie
4. New access token retrieved and stored
5. If refresh fails → User redirected to login

### CORS Requirements
The backend must have CORS configured to:
- Allow credentials: `credentials: true`
- Allow origin: Your frontend domain
- Allow cookies: `Access-Control-Allow-Credentials: true`

## 7. Troubleshooting

### "Network error" on login
- Check if backend is running at `https://swiftcare.up.railway.app`
- Open the URL in browser to verify
- Check browser console for CORS errors

### "Failed to refresh token"
- Check if cookies are enabled in browser
- Verify CORS allows credentials on backend
- Check browser dev tools → Application → Cookies

### Google Sign-In not showing
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Check browser console for errors
- Ensure authorized origins are correct in Google Console

### Images not loading
- The app uses avatar initials as fallback
- Backend image URLs may not be accessible
- This is expected behavior - initials will display

### Doctor signup blocked
- This is correct - backend doesn't support doctor signup yet
- Doctors must be created by admin
- Contact admin to create doctor account

## 8. Debugging

All auth operations log to console with `[v0]` prefix:

```
[v0] Login attempt for: user@example.com
[v0] Login successful, role: patient
[v0] Token expired, refreshing...
[v0] Token refresh successful
[v0] API call: /doctors
```

Check browser console for these logs when debugging issues.

## 9. Production Deployment

### Vercel Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_API_URL`
4. Deploy

### Update Google OAuth
1. Go to Google Cloud Console
2. Add production domain to authorized origins
3. Redeploy if needed

## 10. Security Checklist

- ✅ Refresh tokens in httpOnly cookies (secure)
- ✅ Access tokens in localStorage (15min expiry)
- ✅ Automatic token refresh
- ✅ CORS with credentials
- ✅ Input validation on forms
- ✅ Error messages don't leak sensitive info
- ✅ Password minimum length enforced
- ✅ Google OAuth for passwordless auth

## Need Help?

1. Check `BACKEND_INTEGRATION_FIXED.md` for detailed technical info
2. Review browser console for `[v0]` logs
3. Verify backend is accessible
4. Check environment variables are set correctly
