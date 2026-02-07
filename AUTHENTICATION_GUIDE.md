# Authentication System - Troubleshooting Guide

## Issues Fixed

I've identified and fixed the following issues in your authentication system:

### 1. Frontend Issues Fixed
- ✅ Fixed React hook dependency warning in `AuthContext.js`
- ✅ Improved async handling in token verification
- ✅ Enhanced `ProtectedRoute` to check both user and token

### 2. Code Quality Improvements
- Better error handling in authentication context
- Proper async/await usage in useEffect hooks

## How to Start and Test

### Step 1: Start MongoDB
MongoDB needs to be running for the backend to work.

**Option A: Start as a Windows Service**
```powershell
net start MongoDB
```

**Option B: Start manually**
```powershell
# Open a new terminal window
mongod --dbpath C:\data\db
```

**Verify MongoDB is running:**
```powershell
mongosh --eval "db.version()"
```

### Step 2: Start the Backend Server

Open a new terminal in the project root and run:

```powershell
cd backend
python -m uvicorn server:app --reload --port 8000
```

You should see output like:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test the backend:**
```powershell
# In another terminal
python test_auth.py
```

### Step 3: Start the Frontend Server

Open another terminal and run:

```powershell
cd frontend
npm start
```

The React app should open in your browser at `http://localhost:3000`

### Step 4: Test Authentication

1. **Navigate to Register Page**
   - Go to `http://localhost:3000/register`
   - Fill in the form:
     - Full Name: Your Name
     - Email: test@example.com
     - Password: test123456 (minimum 6 characters)
     - Confirm Password: test123456
   - Click "Create Account"

2. **Expected Behavior:**
   - ✅ Success toast notification appears
   - ✅ Redirects to `/upload` page
   - ✅ You're now logged in

3. **Test Login:**
   - Navigate to `http://localhost:3000/login`
   - Enter the same email and password
   - Click "Sign In"
   - Should redirect to `/upload` page

## Common Issues and Solutions

### Issue 1: "Network Error" or "Failed to fetch"

**Cause:** Backend server is not running

**Solution:**
```powershell
# Start backend
cd backend
python -m uvicorn server:app --reload --port 8000
```

### Issue 2: Backend crashes with MongoDB connection error

**Error:** `ServerSelectionTimeoutError: localhost:27017`

**Cause:** MongoDB is not running

**Solution:**
```powershell
# Start MongoDB service
net start MongoDB

# OR start manually
mongod --dbpath C:\data\db
```

### Issue 3: "Email already registered"

**Cause:** User already exists in database

**Solution 1: Use login instead of register**
- Go to login page and use existing credentials

**Solution 2: Delete the user from MongoDB**
```powershell
mongosh
use resume_builder
db.users.deleteOne({email: "test@example.com"})
```

### Issue 4: CORS errors in browser console

**Error:** `Access to fetch at 'http://localhost:8000' ... has been blocked by CORS policy`

**Cause:** CORS configuration issue

**Solution:** The backend should already have CORS configured. Check `backend/.env`:
```
CORS_ORIGINS=*
```

### Issue 5: Token verification fails

**Symptoms:** 
- Can register/login successfully
- But immediately redirected back to login
- Console shows 401 Unauthorized error

**Solution:** Clear localStorage and try again
```javascript
// In browser console (F12)
localStorage.clear()
location.reload()
```

## Testing Checklist

Use this checklist to verify everything works:

- [ ] MongoDB is running
- [ ] Backend server is running (http://localhost:8000)
- [ ] Frontend server is running (http://localhost:3000)
- [ ] Can access landing page (/)
- [ ] Can access register page (/register)
- [ ] Can register a new user
- [ ] Redirects to /upload after registration
- [ ] Can logout
- [ ] Can login with registered credentials
- [ ] Can access protected routes when logged in
- [ ] Redirects to /login when not authenticated

## Quick Start Commands

Run these in separate terminal windows:

```powershell
# Terminal 1: MongoDB (if not running as service)
net start MongoDB

# Terminal 2: Backend
cd backend
python -m uvicorn server:app --reload --port 8000

# Terminal 3: Frontend
cd frontend
npm start

# Terminal 4: Test authentication (optional)
python test_auth.py
```

## Backend API Endpoints

Your authentication endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current user (requires token)

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=resume_builder
CORS_ORIGINS=*
SECRET_KEY=qK-BDdZYpYkAarkWW11PwOP3B6_37NdL4KliKUV73Qs
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8000
SKIP_PREFLIGHT_CHECK=true
```

## Debug Tips

### Check if servers are running:
```powershell
# Check backend (port 8000)
netstat -ano | findstr :8000

# Check frontend (port 3000)
netstat -ano | findstr :3000

# Check MongoDB (port 27017)
netstat -ano | findstr :27017
```

### View MongoDB data:
```powershell
mongosh
use resume_builder
db.users.find().pretty()
```

### Check backend logs:
Look at the terminal where you ran `uvicorn` - all requests and errors are logged there.

### Check frontend logs:
Open browser DevTools (F12) and check the Console tab for errors.

## Next Steps

Once authentication is working:

1. Test the resume upload functionality
2. Test the ATS scoring feature
3. Test the resume enhancement features
4. Deploy to production (if needed)

## Need More Help?

If you're still experiencing issues:

1. Check the browser console (F12) for JavaScript errors
2. Check the backend terminal for Python errors
3. Run the test script: `python test_auth.py`
4. Verify all environment variables are set correctly
