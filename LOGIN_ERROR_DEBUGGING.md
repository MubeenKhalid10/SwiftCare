# Login "Failed to Fetch" Error - Debugging Guide

## Error Description
When attempting to login, you see: `Login error: Failed to fetch`

This error indicates that the frontend cannot connect to the backend server.

## Root Causes

### 1. Backend Server is Not Running
The most common cause - the Express server at `https://swiftcare.up.railway.app/` is offline or not responding.

**Check Backend Status:**
```bash
# From your terminal, test if backend is reachable:
curl -X POST https://swiftcare.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

If you get a connection refused or timeout error, the backend is down.

### 2. CORS Issues
The backend might not have proper CORS headers to accept requests from your frontend domain.

**Solution:**
The backend Express server needs to have CORS enabled:
```javascript
// In your Express server:
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'your-production-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Network Connectivity
Your machine cannot reach the internet or the Railway.app domain is blocked.

**Test:**
```bash
# Check if you can reach the server
ping swiftcare.up.railway.app
# or
curl -I https://swiftcare.up.railway.app/
```

### 4. Wrong Backend URL
The backend URL in the code is incorrect.

**Current URL:**
```typescript
const BASE_URL = "https://swiftcare.up.railway.app";
```

**If your backend is elsewhere, update `/lib/auth.service.ts`:**
```typescript
const BASE_URL = "http://localhost:5000"; // For local development
// or
const BASE_URL = "https://your-actual-backend-url.com";
```

## Solutions

### Solution 1: Verify Backend is Running (LOCAL DEVELOPMENT)

If running backend locally:
```bash
cd /path/to/backend
npm install
npm start
# Should print: "Server running on port 5000"
```

Then update the URL in `/lib/auth.service.ts`:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
```

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Solution 2: Enable CORS on Backend

Add CORS middleware to your Express server:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// ... rest of your routes
```

### Solution 3: Check Environment Variables

Ensure you have proper error logging. The updated code now shows:
- Network connectivity errors
- Invalid credentials errors
- Specific backend response errors

**Check browser console (F12 -> Console tab)** for detailed error messages like:
```
[AUTH] Login attempt for: user@example.com
[AUTH] Login error: Network error - backend may be unavailable
```

### Solution 4: Test with Sample Credentials

Before debugging, ensure your test credentials exist in the database:
```sql
-- Check if user exists
SELECT * FROM patients WHERE email = 'patient@example.com';
SELECT * FROM doctors WHERE email = 'doctor@example.com';
```

## Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for `[AUTH]` prefixed logs
4. These will show you exactly where it's failing

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the POST request to `/auth/login`
5. Check if it fails with:
   - **Status 0** = Network/CORS error
   - **Status 401** = Invalid credentials (good! Backend is reachable)
   - **Status 500** = Backend server error

### Step 3: Test Backend Directly
Use Postman, Insomnia, or curl to test:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123"
  }'
```

Expected Response (Success):
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "role": "patient",
  "userId": "123"
}
```

Expected Response (Invalid Credentials):
```json
{
  "error": "Invalid credentials"
}
```

## Quick Checklist

- [ ] Backend server is running and accessible
- [ ] CORS is enabled on backend
- [ ] Backend URL in `/lib/auth.service.ts` is correct
- [ ] Valid email and password are entered
- [ ] No network/firewall issues blocking the connection
- [ ] Backend database has the user record
- [ ] User password is correct (case-sensitive)

## Error Messages After Fix

After the fix, you should see specific error messages:

1. **Network Error:**
   ```
   Network error: Cannot connect to server. 
   Please check your connection and try again.
   ```
   → Backend is not reachable

2. **Invalid Credentials:**
   ```
   Invalid email or password
   ```
   → Backend is reachable but credentials don't match

3. **Other Errors:**
   ```
   Login failed: [specific error message]
   ```
   → Backend returned a specific error

## Testing the Fix

Once you've fixed the backend:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Go to `http://localhost:3000/auth/login`
3. Enter valid credentials
4. Check browser console for `[AUTH] Login successful`
5. Should redirect to appropriate dashboard

## Still Not Working?

Check the following in order:
1. Backend server status (is it running?)
2. Backend URL correctness
3. CORS configuration
4. User exists in database with correct password
5. Network connectivity (try mobile hotspot if WiFi blocked)
6. Browser cache (clear and restart)
7. Check backend logs for errors
