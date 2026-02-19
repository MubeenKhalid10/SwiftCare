# Quick Fix Reference - Login "Failed to Fetch" Error

## TL;DR - The Problem
Backend server is not reachable from frontend.

## TL;DR - The Solution
Start your backend server on the correct port.

---

## 5-Minute Debugging Checklist

### 1. Is Backend Running?
```bash
# Test if backend responds
curl http://localhost:5000/doctors

# If "curl: (7) Failed to connect" → Backend is NOT running
# If you get JSON response → Backend is running ✓
```

### 2. Is Frontend Using Correct Backend URL?
Check `/lib/auth.service.ts`:
```typescript
const BASE_URL = "https://swiftcare.up.railway.app";
// Change to:
const BASE_URL = "http://localhost:5000"; // For local development
```

### 3. Check Browser Console
Press `F12` → Console tab

Look for messages starting with `[AUTH]`:
- `[AUTH] Login successful` = Everything works ✓
- `[AUTH] Login error: Network error` = Backend unreachable
- `[AUTH] Login error: Invalid credentials` = Backend works but wrong credentials

---

## What Changed in Code

### File 1: `/lib/auth.service.ts`
- Added try-catch wrapper around fetch
- Better error messages
- Console logging with `[AUTH]` prefix

### File 2: `/app/auth/login/page.tsx`
- Better error toast messages
- Console logging for debugging
- Added backend status alert on page

---

## Common Errors and Quick Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Failed to fetch" in console | Network error | Start backend server |
| "Network error: Cannot connect to server" | Backend offline | `npm start` in backend folder |
| "Invalid email or password" | Wrong credentials | Check your email/password |
| CORS error in console | Backend CORS not configured | Enable CORS in backend |

---

## For Local Development

### Terminal 1: Backend
```bash
cd backend-directory
npm install
npm start
# Should show: Server running on port 5000
```

### Terminal 2: Frontend
```bash
cd frontend-directory
npm install
NEXT_PUBLIC_API_URL=http://localhost:5000 npm run dev
# Should show: http://localhost:3000
```

### Test Login
1. Go to http://localhost:3000/auth/login
2. Enter valid credentials
3. Should redirect to dashboard

---

## What Does Each Console Log Mean?

```
[AUTH] Login attempt for: test@example.com
→ Login started, frontend is trying to reach backend

[AUTH] Login successful
→ Backend accepted login, tokens saved ✓

[AUTH] Login error: Network error - backend may be unavailable
→ Frontend cannot reach backend (backend not running or wrong URL)

[AUTH] Login error: Invalid credentials
→ Backend reached but email/password don't match
```

---

## Most Common Issue

**99% of the time:**
- You forgot to start the backend server
- Solution: Run `npm start` in your backend directory

---

## Still Stuck?

Read the full guides:
- Detailed debugging: `/LOGIN_ERROR_DEBUGGING.md`
- Setup local dev: `/LOCAL_DEVELOPMENT_SETUP.md`
- All changes: `/LOGIN_FIX_SUMMARY.md`

---

## Environment Variable Setup

### `.env.local` (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### `.env` (Backend)
```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

---

## Test Backend Directly

```bash
# Test if backend works (replace email/password)
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"Test@123"}'

# Success response:
# {"accessToken":"...", "role":"patient", "userId":"123"}

# Error response:
# {"error":"Invalid credentials"}
```

If this curl works but login page doesn't, it's a CORS issue.

---

## Done! ✓

After fixing:
1. Backend running
2. Correct backend URL in code
3. Valid credentials

You should see: "Login successful!" toast → Redirect to dashboard
