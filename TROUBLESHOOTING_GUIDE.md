# Troubleshooting Guide - "Failed to fetch" Error

## Problem
When navigating to `/patient/appointments`, you see the error:
```
Error fetching doctors: Failed to fetch
```

## Root Causes

### 1. NOT LOGGED IN (Most Common)
The `/patient/appointments` page requires authentication. If you're not logged in:
- The page will redirect to `/auth/login`
- API calls will fail because there's no JWT token
- Error message: "Failed to fetch" or "Authentication failed"

**Solution:**
1. Go to `/auth/login`
2. Login with valid credentials
3. Then navigate to `/patient/appointments`

### 2. Backend Not Running or Unreachable
If the backend at `https://swiftcare.up.railway.app` is:
- Not deployed or offline
- Having network issues
- CORS not properly configured

**Solution:**
1. Check if the backend is running: `curl https://swiftcare.up.railway.app/doctors`
2. Check Railway deployment status
3. Verify CORS headers are configured in backend

### 3. Invalid or Expired Token
If you're logged in but your JWT token is:
- Expired (access token expired)
- Invalid (corrupted)
- Not being sent with requests

**Solution:**
1. Logout (go to `/logout`)
2. Login again to get fresh tokens
3. Check browser DevTools → Application → LocalStorage for `accessToken`

### 4. Wrong User Role
The page checks if your role is "patient":
```typescript
if (!isAuthenticated || user?.role !== "patient") {
  router.push("/auth/login")
}
```

**Solution:**
- Use a patient account (not doctor/admin)
- If you registered as a doctor, create a patient account

## How to Debug

### Check Browser Console
The app now logs detailed errors:
```
[API] Error fetching /doctors: Failed to fetch
```

### Check Network Tab
1. Open DevTools → Network
2. Reload page
3. Look for failed API requests:
   - `/doctors` → Check response status (401 = auth issue, 500 = server error)
   - `/appointments` → Similar checks

### Check LocalStorage
1. Open DevTools → Application → LocalStorage
2. Look for:
   - `accessToken` - Should exist if logged in
   - `swiftcare_auth` - Should contain user object

### Check Backend
Test the backend directly:
```bash
# Get all doctors (no auth required)
curl https://swiftcare.up.railway.app/doctors

# Get doctors with auth token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://swiftcare.up.railway.app/doctors
```

## Step-by-Step Testing

### 1. Test Login First
```
a) Go to /auth/login
b) Enter email and password
c) Should see "Login successful!" toast
d) Should redirect to /patient/dashboard
e) Check localStorage for accessToken
```

### 2. Test Patient Dashboard
```
a) Go to /patient/dashboard (from /patient/appointments via sidebar)
b) Should show your name in sidebar (not sample data)
c) Should display your appointments
d) Check for error messages
```

### 3. Test Appointments Page
```
a) From dashboard, click "Appointments" in sidebar
b) Should see loading spinner briefly
c) Should display your appointments with doctors' info
d) If empty, you have no appointments yet (create one)
e) Check browser console for any errors
```

## Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | Network error or no token | Login first, check backend |
| "Authentication failed" | Invalid token | Logout and login again |
| "API Error: 401" | Unauthorized | Token expired or invalid |
| "API Error: 404" | Endpoint not found | Check backend has the route |
| "API Error: 500" | Server error | Check backend logs |

## Database Connection Check

Make sure the backend has:

1. **Database tables:**
   - `doctors` table with columns: id, name, email, specialty, location, rating, experience, fee, image, available
   - `patients` table with columns: id, name, email, age, gender, phone, address
   - `appointments` table with columns: id, patientId, doctorId, date, time, status
   - `reviews` table with columns: id, patientId, doctorId, rating, comment

2. **Sample data:**
   - At least one doctor entry
   - At least one patient entry
   - Test data in appointments and reviews

## Network Debugging Script

Add this to your browser console to debug API calls:

```javascript
// Test if backend is reachable
fetch('https://swiftcare.up.railway.app/doctors')
  .then(r => console.log('Backend OK:', r.status))
  .catch(e => console.log('Backend Error:', e.message))

// Test with token
const token = localStorage.getItem('accessToken')
fetch('https://swiftcare.up.railway.app/appointments', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => console.log('With token:', r.status))
  .catch(e => console.log('Token Error:', e.message))
```

## Common Mistakes

1. **Trying to access before logging in**
   - Always login first at `/auth/login`

2. **Using browser back button after logout**
   - Cache might show old page, refresh with F5

3. **Database not synced with new schema**
   - Clear old data and migrate fresh

4. **CORS issues with backend**
   - Backend must have `Access-Control-Allow-Origin: *` or specific origin

5. **Localhost vs deployed URL**
   - Use exact backend URL from Railway deployment

## Contact & More Help

If the error persists after checking above:
1. Verify backend is running: `https://swiftcare.up.railway.app/`
2. Check railway deployment logs
3. Ensure all environment variables are set
4. Clear browser cache and localStorage, then login again
