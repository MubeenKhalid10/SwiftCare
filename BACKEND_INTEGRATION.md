# SwiftCare Backend Integration Guide

## Overview
This document describes the integration between the SwiftCare frontend (Next.js) and the backend deployed at `https://swiftcare.up.railway.app/`.

## Backend API Overview

### Base URL
```
https://swiftcare.up.railway.app
```

### Authentication Flow

#### 1. Login (Patient/Doctor)
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGc...",
  "role": "patient" | "doctor",
  "userId": "user_id"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

#### 2. Token Refresh
**Endpoint:** `POST /auth/refresh`

**Request Headers:**
```
Authorization: Bearer {refreshToken}
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_value"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "new_access_token"
}
```

#### 3. Logout
**Endpoint:** `POST /auth/logout`

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

### Core API Endpoints

All authenticated endpoints require:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Doctors API

**Get All Doctors**
- `GET /doctors`
- Returns: Array of Doctor objects

**Get Doctor by ID**
- `GET /doctors/{id}`
- Returns: Single Doctor object

**Create Doctor** (via registration)
- `POST /doctors`
- Body includes credentials object with email and password

**Update Doctor**
- `PUT /doctors/{id}`
- Body: Partial Doctor object

#### Patients API

**Get All Patients**
- `GET /patients`
- Returns: Array of Patient objects

**Get Patient by ID**
- `GET /patients/{id}`
- Returns: Single Patient object

**Create Patient** (via registration)
- `POST /patients`
- Body includes credentials object with email and password

**Update Patient**
- `PUT /patients/{id}`
- Body: Partial Patient object

#### Appointments API

**Get All Appointments**
- `GET /appointments`
- Returns: Array of Appointment objects

**Get Appointment by ID**
- `GET /appointments/{id}`
- Returns: Single Appointment object

**Create Appointment**
- `POST /appointments`
- Body: Appointment object

**Update Appointment**
- `PUT /appointments/{id}`
- Body: Partial Appointment object

#### Reviews API

**Get All Reviews**
- `GET /reviews`
- Returns: Array of Review objects

**Create Review**
- `POST /reviews`
- Body: Review object

**Delete Review**
- `DELETE /reviews/{id}`

## Frontend Implementation

### Authentication Service (`/lib/auth.service.ts`)

Handles all authentication operations:
- `login(email, password)` - Patient and Doctor login
- `register(payload)` - Patient and Doctor registration
- `refreshAccessToken()` - Automatic token refresh
- `logout()` - Clear tokens and session
- `getAccessToken()` - Retrieve current access token

### Data Fetching Service (`/lib/api.ts`)

Provides typed API functions:
- `getDoctors()` - Fetch all doctors
- `getDoctorById(id)` - Fetch specific doctor
- `getPatients()` - Fetch all patients
- `getPatientById(id)` - Fetch specific patient
- `getAppointments()` - Fetch all appointments
- `getAppointmentsByPatientId(id)` - Patient appointments
- `getAppointmentsByDoctorId(id)` - Doctor appointments
- `getReviews()` - Fetch all reviews
- `getReviewsByDoctorId(id)` - Doctor reviews
- `getReviewsByPatientId(id)` - Patient reviews

### Auth Context (`/lib/auth-context.tsx`)

React context providing:
- `user` - Current logged-in user
- `isAuthenticated` - Authentication state
- `login(credentials)` - Login function
- `register(data)` - Registration function
- `logout()` - Logout function
- `getUser()` - Get current user

### Token Management

Tokens are stored in localStorage:
- `accessToken` - Short-lived token (15 minutes)
- `refreshToken` - Long-lived token (30 days)
- `swiftcare_auth` - User information object

Automatic refresh occurs when a 401 response is received.

## Registration Flow

### Patient Registration
1. User fills form with name, email, password, role='patient'
2. Frontend creates Patient object in database
3. Frontend attempts automatic login with same credentials
4. Access token and user info stored
5. Redirect to patient dashboard

### Doctor Registration
1. User fills form with name, email, password, role='doctor'
2. Frontend creates Doctor object in database with default specialty
3. Frontend attempts automatic login with same credentials
4. Access token and user info stored
5. Redirect to doctor dashboard

## Data Display Pages

### Patient Dashboard (`/app/patient/dashboard`)
- Displays upcoming appointments
- Shows favorite doctors
- Medical stats (heart rate, blood pressure)
- Past appointment history

### Doctor Dashboard (`/app/doctor/dashboard`)
- Shows upcoming appointments
- Patient statistics
- Revenue charts
- Recent patient list

### Doctors List (`/app/doctors`)
- Fetches all doctors from `/doctors`
- Filters by specialty, location, price range
- Shows doctor ratings and reviews

### Appointments (`/app/patient/appointments`)
- Lists appointments for current patient
- Fetches using `getAppointmentsByPatientId(user.id)`
- Shows appointment details and doctor info

### Reviews
- Displays doctor reviews
- Fetches using `getReviewsByDoctorId(id)`
- Patient can create reviews

## Error Handling

### 401 Unauthorized
- Automatic token refresh attempted
- If refresh fails, user redirected to login
- User sessions cleared

### Network Errors
- Catch blocks return empty arrays/null
- Toast notifications display to user
- Graceful degradation of UI

### Validation
- Frontend validates all inputs
- Backend returns descriptive error messages
- Errors displayed to user via toast notifications

## Deployment Notes

1. **Backend URL:** Update `API_BASE_URL` in `/lib/auth.service.ts` and `/lib/api.ts` if backend URL changes
2. **CORS:** Backend must allow requests from frontend origin
3. **SSL:** All API calls use HTTPS
4. **Credentials:** Cookies set to `sameSite: none` for cross-origin requests in production

## Testing

### Login Test
1. Navigate to `/auth/login`
2. Enter test credentials (patient or doctor)
3. Verify redirect to correct dashboard
4. Check token stored in localStorage

### Data Fetching Test
1. Login as patient
2. Navigate to appointments page
3. Verify appointments displayed
4. Check network tab for successful API calls

### Registration Test
1. Navigate to `/auth/register`
2. Select role (patient or doctor)
3. Fill form and submit
4. Verify automatic login and redirect
5. Check user appears in database

## Troubleshooting

### "Invalid credentials" on login
- Verify user exists in backend database
- Check email matches exactly (case-sensitive)
- Verify password is correct
- Check backend is running

### No data displayed
- Check network requests in DevTools
- Verify access token present in Authorization header
- Check response from backend (200 vs 4xx/5xx)
- Verify user has permission to access data

### Token refresh failing
- Check refresh token in localStorage
- Verify backend `/auth/refresh` endpoint working
- Check token expiration times match backend

### CORS errors
- Verify frontend origin allowed in backend
- Check `credentials: 'include'` in fetch requests
- Verify response headers include required CORS headers

## API Response Examples

### Doctor Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dr. John Smith",
  "credentials": {
    "email": "john@example.com",
    "provider": "email"
  },
  "specialty": "Cardiologist",
  "location": "New York",
  "rating": 4.8,
  "experience": "10 years",
  "fee": "$100",
  "available": true
}
```

### Patient Object
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Doe",
  "credentials": {
    "email": "jane@example.com",
    "provider": "email"
  },
  "age": 28,
  "gender": "Female",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### Appointment Object
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "patientId": "507f1f77bcf86cd799439012",
  "doctorId": "507f1f77bcf86cd799439011",
  "date": "2024-03-21",
  "time": "10:30",
  "type": "Video Call",
  "status": "upcoming"
}
```

### Review Object
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "patientId": "507f1f77bcf86cd799439012",
  "doctorId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "text": "Excellent service!",
  "date": "2024-03-20"
}
```
