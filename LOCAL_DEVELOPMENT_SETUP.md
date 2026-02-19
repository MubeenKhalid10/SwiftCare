# Local Development Setup Guide

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- MongoDB running locally (for backend)
- Two terminal windows

## Backend Setup

### 1. Clone Backend Repository
```bash
git clone https://github.com/yourusername/swiftcare-backend.git
cd swiftcare-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env` file in backend directory:
```env
PORT=5000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/swiftcare
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
JWT_SECRET=your-jwt-secret-key-here
REFRESH_SECRET=your-refresh-secret-key-here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
```

### 4. Enable CORS in Backend
Update your Express app.js or server.js:
```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 5. Start Backend Server
```bash
npm start
# Should output: Server running on port 5000
```

## Frontend Setup

### 1. Environment Setup
Create `.env.local` in frontend root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Update API Configuration
Verify `/lib/auth.service.ts` uses the environment variable:
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://swiftcare.up.railway.app";
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Frontend Dev Server
```bash
npm run dev
# Should output: http://localhost:3000
```

## Testing Login Flow

### 1. Create Test User (via backend)
```bash
curl -X POST http://localhost:5000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "patient@test.com",
    "password": "Test@123"
  }'
```

### 2. Login in Frontend
1. Go to `http://localhost:3000/auth/login`
2. Enter: 
   - Email: `patient@test.com`
   - Password: `Test@123`
3. Should redirect to `/patient/dashboard`

### 3. Check Console Logs
Open DevTools (F12) → Console tab, should see:
```
[AUTH] Login attempt for: patient@test.com
[AUTH] Login successful
```

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is already in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or use different port
PORT=5001 npm start
```

### CORS Error
**Error in console:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Ensure `cors` package is installed: `npm install cors`
2. Add CORS middleware BEFORE your routes
3. Check CORS origin matches frontend URL

### Database Connection Error
**Error:**
```
MongoError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Start MongoDB
mongod  # or use MongoDB Atlas cloud

# Verify connection works
mongo  # Should connect successfully
```

### Port Already in Use
Change port in backend `.env`:
```env
PORT=5001
```

Then update frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Development Workflow

### Terminal 1: Run Backend
```bash
cd swiftcare-backend
npm start
# Keeps running, watches for changes
```

### Terminal 2: Run Frontend
```bash
cd swiftcare-frontend
npm run dev
# Keeps running, auto-refreshes on code changes
```

### Making Changes
- Backend changes: Auto-restarts (with nodemon)
- Frontend changes: Auto-refreshes browser
- API changes: Restart both servers

## Testing Different Roles

### Patient Login
```bash
# Create patient first
curl -X POST http://localhost:5000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Patient",
    "email": "patient@test.com",
    "password": "Test@123"
  }'

# Login with email: patient@test.com
```

### Doctor Login
```bash
# Create doctor first
curl -X POST http://localhost:5000/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Doctor",
    "email": "doctor@test.com",
    "password": "Test@123",
    "specialty": "Cardiology"
  }'

# Login with email: doctor@test.com
```

## Useful Commands

### View All Users
```bash
# MongoDB CLI
db.patients.find()
db.doctors.find()
```

### Clear Database
```bash
# MongoDB CLI
db.dropDatabase()
```

### Test API Endpoint
```bash
# Test login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"patient@test.com","password":"Test@123"}'

# Test get doctors
curl http://localhost:5000/doctors
```

## Production Deployment

### Frontend to Vercel
```bash
# Push to GitHub (recommended)
git push origin main

# In Vercel dashboard:
# 1. Import your GitHub repository
# 2. Set Environment Variables:
#    NEXT_PUBLIC_API_URL=https://your-backend-url.com
# 3. Deploy
```

### Backend to Railway
```bash
# Connect Railway to your backend GitHub repo
# Set environment variables in Railway dashboard
# Railway will auto-deploy on git push
```

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "Failed to fetch" on login | Backend not running or CORS issue |
| CORS error | Add CORS middleware to backend |
| Blank page after login | Check token storage and auth context |
| Appointments not loading | Ensure user is authenticated with token |
| Database connection fails | Check MongoDB is running and URI is correct |
