# Backend Integration Implementation Summary

## Overview
Complete integration between SwiftCare frontend (Next.js) and backend deployed at `https://swiftcare.up.railway.app/` with proper JWT authentication, token management, and data synchronization.

## Files Modified

### 1. Authentication Service (`/lib/auth.service.ts`)
**Changes:**
- Implemented JWT token management with access and refresh tokens
- Added `login()` function with proper credential validation
- Implemented `register()` function that creates user then auto-logs in
- Added `refreshAccessToken()` for automatic token renewal on 401 errors
- Added `logout()` function with proper cleanup
- Added `getAccessToken()` helper
- Stores tokens in localStorage with keys: `accessToken`, `refreshToken`
- Handles bcrypt password hashing on backend

**Key Features:**
- Automatic token refresh before expiration
- HTTP-only cookie support for web clients
- Bearer token support for API requests
- Error handling and user-friendly error messages

### 2. API Utility (`/lib/api.ts`)
**Changes:**
- Updated `fetchAPI()` wrapper with token injection
- Automatic retry with token refresh on 401 responses
- All endpoints now include Authorization header
- Updated all API functions to use correct endpoint structure
- Added error handling with fallback empty arrays/nulls
- String ID type conversions for ID matching

**API Functions Updated:**
- `getDoctors()` - Returns array of all doctors
- `getDoctorById(id)` - Fetch single doctor
- `getPatients()` - Returns array of all patients  
- `getPatientById(id)` - Fetch single patient
- `getAppointments()` - Returns array of all appointments
- `getAppointmentsByPatientId(id)` - Filter appointments by patient
- `getAppointmentsByDoctorId(id)` - Filter appointments by doctor
- `getReviews()` - Returns array of all reviews
- `getReviewsByDoctorId(id)` - Filter reviews by doctor
- `getReviewsByPatientId(id)` - Filter reviews by patient
- `getDashboardStats()` - Aggregated dashboard statistics

**Features:**
- Automatic token refresh on 401
- Credentials included in all requests
- Comprehensive error logging
- Type-safe responses

### 3. Auth Context (`/lib/auth-context.tsx`)
**Changes:**
- Integrated with backend authentication
- Automatic auth state restoration from tokens
- User information stored with auth state
- Proper loading states during auth operations

**Exported Functions:**
- `login()` - Backend login with email/password
- `register()` - Backend registration for patient/doctor
- `logout()` - Clear tokens and auth state
- `getUser()` - Get current authenticated user

**Features:**
- localStorage persistence
- Auto-initialization on app load
- Proper error handling
- State type safety

### 4. Login Page (`/app/auth/login/page.tsx`)
**Changes:**
- Updated to use new auth flow
- Proper error handling with try-catch
- Improved user feedback
- Role-based redirects:
  - Doctor → `/doctor/dashboard`
  - Patient → `/patient/dashboard`
  - Admin → `/admin/dashboard`

### 5. Register Page (`/app/auth/register/page.tsx`)
**Changes:**
- Role selection (patient vs doctor)
- Form validation including:
  - Password length (min 6 chars)
  - Password confirmation match
  - All fields required
- Proper error handling
- Delay before redirect for UX feedback

## New Files Created

### 1. API Configuration (`/lib/api-config.ts`)
Contains centralized configuration:
- `API_BASE_URL` - Backend URL
- `TOKEN_KEYS` - localStorage key constants
- `API_ENDPOINTS` - Endpoint path constants
- `TOKEN_TTL` - Token expiration times

### 2. Protected Route Hook (`/hooks/use-protected-route.ts`)
Custom React hook for route protection:
- Checks authentication status
- Enforces role-based access
- Automatic redirects to login
- Used on protected pages (dashboards, appointments, etc.)

**Usage:**
```tsx
export default function ProtectedPage() {
  const { user, isAuthenticated, isLoading } = useProtectedRoute("patient");
  
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return null;
  
  return <Dashboard />;
}
```

### 3. API Fetch Hook (`/hooks/use-api-fetch.ts`)
Custom hooks for data fetching:
- `useAPIFetch()` - Automatic data fetching on mount
- `useAPIRefresh()` - Manual refresh capability
- Handles loading/error states
- Integrates with token refresh

**Usage:**
```tsx
const { data: doctors, loading, error } = useAPIFetch(() => getDoctors());
```

### 4. Backend Integration Guide (`/BACKEND_INTEGRATION.md`)
Comprehensive documentation including:
- Authentication flow documentation
- API endpoint specifications
- Response format examples
- Error handling guide
- Deployment notes
- Testing procedures
- Troubleshooting guide

## Authentication Flow Diagram

```
User Visits App
    ↓
AuthProvider Checks localStorage
    ↓
Token Found? → Restore user state
    ↓
No Token? → Show Login/Register
    ↓
User Submits Credentials
    ↓
Frontend sends to /auth/login
    ↓
Backend validates with bcrypt
    ↓
Backend returns accessToken + role + userId
    ↓
Frontend stores tokens in localStorage
    ↓
Frontend redirects based on role
    ↓
Dashboard Page uses token in all API requests
    ↓
401 Received? → Auto-refresh token → Retry request
    ↓
Token Expired? → Refresh endpoint gets new token
    ↓
App Ready
```

## Data Flow Examples

### Login Flow
1. User enters email/password
2. `login()` sends POST to `/auth/login`
3. Backend validates credentials with bcrypt
4. Backend returns `{accessToken, role, userId}`
5. Tokens stored in localStorage
6. User state updated in AuthContext
7. Page redirects to appropriate dashboard

### Appointment Fetching
1. Patient navigates to appointments page
2. `useProtectedRoute("patient")` verifies authentication
3. `useAPIFetch()` calls `getAppointmentsByPatientId(user.id)`
4. `fetchAPI()` adds Authorization header with token
5. Backend returns appointments array
6. Component renders appointments

### Token Refresh
1. API call receives 401 response
2. `fetchAPI()` detects 401
3. `refreshAccessToken()` called
4. POST to `/auth/refresh` with refresh token
5. Backend validates and returns new accessToken
6. localStorage updated with new token
7. Original request retried with new token
8. Success response returned

## Data Models

### User (in auth state)
```typescript
{
  id: number,
  name: string,
  email: string,
  role: "patient" | "doctor" | "admin"
}
```

### Doctor
```typescript
{
  id: string,
  name: string,
  email: string,
  specialty: string,
  location: string,
  rating: number,
  experience: string,
  fee: string,
  available: boolean
}
```

### Patient
```typescript
{
  id: string,
  name: string,
  email: string,
  age: number,
  gender: string,
  phone: string,
  address: string
}
```

### Appointment
```typescript
{
  id: string,
  patientId: string,
  doctorId: string,
  date: string,
  time: string,
  type: "Video Call" | "Audio Call" | "Chat" | "Direct Visit",
  status: "upcoming" | "completed" | "cancelled"
}
```

### Review
```typescript
{
  id: string,
  patientId: string,
  doctorId: string,
  rating: number,
  text: string,
  date: string
}
```

## Security Features

1. **JWT Token Authentication**
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (30 days)
   - Automatic refresh on 401

2. **Password Security**
   - Bcrypt hashing on backend
   - No plain text passwords sent/stored
   - Secure password transmission over HTTPS

3. **Token Storage**
   - localStorage for web clients
   - HTTP-only cookies for backward compat
   - Credentials included in requests

4. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes enforce authentication
   - Backend validates every request

## Error Handling

### Authentication Errors
- Invalid credentials → User feedback + redirect to login
- Token expired → Auto-refresh + retry request
- Refresh failed → Clear tokens + redirect to login

### Data Fetch Errors
- Network errors → Toast notification + empty state
- 401 → Auto-refresh → Retry
- 4xx/5xx → Error message + retry option

### Validation Errors
- Missing fields → Form validation feedback
- Invalid formats → Input validation
- Password mismatch → Clear error message

## Testing Scenarios

### 1. Patient Login
```
1. Go to /auth/login
2. Enter patient email/password
3. See "Login successful!" toast
4. Redirected to /patient/dashboard
5. Can view appointments, favorites, records
```

### 2. Doctor Login
```
1. Go to /auth/login
2. Enter doctor email/password
3. See "Login successful!" toast
4. Redirected to /doctor/dashboard
5. Can view appointments, patients, stats
```

### 3. Patient Registration
```
1. Go to /auth/register
2. Select "Patient" role
3. Enter name, email, password
4. Submit form
5. Auto-logged in
6. Redirected to /patient/dashboard
7. Patient visible in database
```

### 4. Data Synchronization
```
1. Login as doctor
2. Open appointments
3. Create new appointment
4. Refresh page
5. New appointment still there
6. Login as patient
7. See appointment in patient appointments
8. Data synced across roles
```

## Deployment Checklist

- [ ] Backend running at `https://swiftcare.up.railway.app/`
- [ ] CORS configured to allow frontend origin
- [ ] Database populated with test data
- [ ] JWT secrets configured in backend
- [ ] Bcrypt dependency installed in backend
- [ ] Frontend environment variables set (if any)
- [ ] SSL/HTTPS enabled on both frontend and backend
- [ ] API documentation updated
- [ ] Error logging configured
- [ ] Rate limiting configured (optional)

## Known Limitations & Future Improvements

1. **Current Limitations**
   - Registration auto-logs in immediately (consider email verification)
   - No password reset flow yet
   - No two-factor authentication
   - No image upload support yet

2. **Future Enhancements**
   - Email verification for new accounts
   - Password reset via email
   - Social login (Google, Facebook)
   - Two-factor authentication
   - User profile picture uploads
   - Appointment notifications
   - Real-time appointment updates with WebSocket
   - Advanced search and filtering

## Support & Debugging

### Check if Backend is Running
```bash
curl https://swiftcare.up.railway.app/health
```

### View Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Try login/fetch operation
4. Check request/response headers and body

### Check Stored Tokens
```javascript
// In browser console
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
localStorage.getItem('swiftcare_auth')
```

### Monitor API Errors
```javascript
// Console will show error details
console.error() calls in catch blocks
```

## Contact & Support

For issues with:
- **Frontend Integration**: Check `/lib/auth.service.ts` and `/lib/api.ts`
- **Backend Connection**: Check `BACKEND_INTEGRATION.md`
- **Data Display**: Check specific page components
- **Authentication Flow**: Review login/register pages
