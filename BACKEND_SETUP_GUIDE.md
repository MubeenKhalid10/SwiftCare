# Backend Setup & Quick Start Guide

## Prerequisites

Before starting, ensure the backend is deployed at:
```
https://swiftcare.up.railway.app/
```

The backend should have these endpoints available:
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Logout
- `GET /doctors` - List all doctors
- `POST /doctors` - Create doctor
- `GET /patients` - List all patients
- `POST /patients` - Create patient
- `GET /appointments` - List all appointments
- `POST /appointments` - Create appointment
- `GET /reviews` - List all reviews
- `POST /reviews` - Create review

## Environment Setup

### 1. No Environment Variables Needed

The frontend is configured to use:
- **API Base URL**: `https://swiftcare.up.railway.app/`

This is hardcoded in:
- `/lib/auth.service.ts`
- `/lib/api.ts`
- `/lib/api-config.ts`

If you need to change the backend URL, update `API_BASE_URL` in these files.

### 2. Test Data Setup

To test the application, you need sample data in the backend:

#### Test Patient
```json
{
  "name": "John Patient",
  "credentials": {
    "email": "patient@example.com",
    "password": "password123"
  },
  "age": 28,
  "gender": "Male",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

#### Test Doctor
```json
{
  "name": "Dr. Sarah Doctor",
  "credentials": {
    "email": "doctor@example.com",
    "password": "password123"
  },
  "specialty": "Cardiologist",
  "location": "New York, NY",
  "rating": 4.8,
  "experience": "10 years",
  "fee": "$100",
  "available": true
}
```

## Running the Frontend

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Visit: `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
npm start
```

## Testing the Integration

### Test 1: Patient Login
1. Navigate to `http://localhost:3000/auth/login`
2. Enter:
   - Email: `patient@example.com`
   - Password: `password123`
3. Click "Sign in"
4. Should redirect to `/patient/dashboard`
5. Check browser console for success message

### Test 2: Doctor Login
1. Navigate to `http://localhost:3000/auth/login`
2. Enter:
   - Email: `doctor@example.com`
   - Password: `password123`
3. Click "Sign in"
4. Should redirect to `/doctor/dashboard`
5. Check browser console for success message

### Test 3: Patient Registration
1. Navigate to `http://localhost:3000/auth/register`
2. Select "Patient" role
3. Fill in form:
   - Name: `New Patient`
   - Email: `newpatient@example.com`
   - Password: `password123`
   - Confirm: `password123`
4. Click "Register as Patient"
5. Should auto-login and redirect to dashboard
6. Verify in backend that patient was created

### Test 4: Doctor Registration
1. Navigate to `http://localhost:3000/auth/register`
2. Select "Doctor" role
3. Fill in form:
   - Name: `Dr. New Doctor`
   - Email: `newdoctor@example.com`
   - Password: `password123`
   - Confirm: `password123`
4. Click "Register as Doctor"
5. Should auto-login and redirect to dashboard
6. Verify in backend that doctor was created

### Test 5: View Doctors List
1. Navigate to `http://localhost:3000/doctors`
2. Should display all doctors from backend
3. Can search by name/specialty
4. Can filter by location

### Test 6: View Appointments (Patient)
1. Login as patient
2. Navigate to `/patient/appointments`
3. Should show appointments for that patient
4. Data comes from `/appointments` filtered by patient ID

### Test 7: Data Synchronization
1. Login as doctor
2. Note an appointment
3. Logout
4. Login as patient
5. Should see same appointment
6. Verify data comes from same backend

## API Documentation

### Login Endpoint
```
POST https://swiftcare.up.railway.app/auth/login

Headers:
  Content-Type: application/json

Body:
{
  "email": "patient@example.com",
  "password": "password123"
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "role": "patient",
  "userId": "123"
}

Response (401):
{
  "error": "Invalid credentials"
}
```

### Get Doctors Endpoint
```
GET https://swiftcare.up.railway.app/doctors

Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json

Response (200):
[
  {
    "id": "1",
    "name": "Dr. Sarah Doctor",
    "specialty": "Cardiologist",
    "rating": 4.8,
    "location": "New York, NY"
  },
  ...
]
```

### Create Appointment Endpoint
```
POST https://swiftcare.up.railway.app/appointments

Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json

Body:
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "date": "2024-03-21",
  "time": "10:30",
  "type": "Video Call"
}

Response (201):
{
  "id": "appointment_id",
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "date": "2024-03-21",
  "time": "10:30",
  "type": "Video Call",
  "status": "upcoming"
}
```

## Debugging

### View Network Requests
1. Open DevTools: Press `F12` or Right-click → Inspect
2. Go to "Network" tab
3. Perform login/data action
4. Check request/response:
   - URL should be `https://swiftcare.up.railway.app/...`
   - Response should be 200
   - Authorization header should be present

### View Stored Tokens
1. Open DevTools Console: `F12` → "Console"
2. Run:
```javascript
console.log(localStorage.getItem('accessToken'))
console.log(localStorage.getItem('refreshToken'))
console.log(JSON.parse(localStorage.getItem('swiftcare_auth')))
```

### Check Authentication Status
1. Open DevTools Console: `F12` → "Console"
2. Run:
```javascript
// Check if token exists
if (localStorage.getItem('accessToken')) {
  console.log('✓ User is logged in')
  console.log('Token:', localStorage.getItem('accessToken').substring(0, 20) + '...')
} else {
  console.log('✗ User is not logged in')
}
```

### Monitor Error Logs
1. Open DevTools Console: `F12` → "Console"
2. Perform action that fails
3. Check for error messages
4. Common errors:
   - "Invalid credentials" → Wrong email/password
   - "Unauthorized" → Token expired/missing
   - "Network error" → Backend not running

## Troubleshooting

### "Cannot connect to backend"
- [ ] Check backend is running: `curl https://swiftcare.up.railway.app/health`
- [ ] Verify URL in `/lib/auth.service.ts`
- [ ] Check internet connection
- [ ] Check CORS settings on backend

### "Invalid credentials"
- [ ] Verify user exists in backend database
- [ ] Check email is correct (case-sensitive)
- [ ] Check password is correct
- [ ] Verify bcrypt is working on backend

### "Token expired"
- [ ] Should auto-refresh automatically
- [ ] Check `/auth/refresh` endpoint working
- [ ] Verify refresh token exists in localStorage
- [ ] Check token expiration times in backend

### "No data displayed"
- [ ] Login first (verify in localStorage)
- [ ] Check Authorization header in network requests
- [ ] Verify response status is 200
- [ ] Check API endpoint exists on backend
- [ ] Check data exists in backend database

### "Redirect to login keeps happening"
- [ ] Clear browser cache and localStorage
- [ ] Check token is valid in localStorage
- [ ] Verify `/auth/refresh` endpoint working
- [ ] Check role-based access control

## File Structure

```
/
├── /lib
│   ├── auth.service.ts         # Auth API calls
│   ├── api.ts                  # Data API calls
│   ├── api-config.ts           # Configuration
│   ├── auth-context.tsx        # Auth state management
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utilities
├── /hooks
│   ├── use-protected-route.ts   # Route protection
│   └── use-api-fetch.ts         # Data fetching
├── /app
│   ├── /auth
│   │   ├── /login
│   │   │   └── page.tsx
│   │   └── /register
│   │       └── page.tsx
│   ├── /patient
│   │   ├── /dashboard
│   │   ├── /appointments
│   │   └── /...
│   ├── /doctor
│   │   ├── /dashboard
│   │   └── /...
│   └── /doctors
│       └── page.tsx
├── BACKEND_INTEGRATION.md       # Integration docs
├── IMPLEMENTATION_CHANGES.md    # Change summary
└── BACKEND_SETUP_GUIDE.md       # This file
```

## Common Tasks

### Change Backend URL
1. Open `/lib/auth.service.ts`
2. Update `BASE_URL` constant
3. Open `/lib/api.ts`
4. Update `API_BASE_URL` constant
5. Restart dev server

### Add New API Endpoint
1. Open `/lib/api.ts`
2. Add new function:
```typescript
export async function getNewData(): Promise<Data[]> {
  return fetchAPI<Data[]>("/new-endpoint")
}
```
3. Add type to `/lib/types.ts`
4. Use in components with `useAPIFetch(getNewData)`

### Add Protected Route
1. Create page component
2. Add hook at top:
```typescript
const { user, isAuthenticated, isLoading } = useProtectedRoute("patient")
```
3. Show loading state
4. Component will auto-redirect if not authenticated

## Next Steps

1. ✅ Backend deployed at `https://swiftcare.up.railway.app/`
2. ✅ Frontend initialized with auth integration
3. ⏭️ Populate backend with test data
4. ⏭️ Test login/registration flows
5. ⏭️ Verify data display on pages
6. ⏭️ Deploy frontend to production
7. ⏭️ Monitor for errors in production
8. ⏭️ Optimize performance if needed

## Support

For issues or questions:
1. Check the error logs in browser DevTools
2. Review `/BACKEND_INTEGRATION.md` for API details
3. Review `/IMPLEMENTATION_CHANGES.md` for code structure
4. Check backend logs for server errors
5. Verify backend is running and accessible
