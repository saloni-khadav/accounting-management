# CORS and API URL Fix - Instructions

## Changes Made:

### 1. Backend (CORS Configuration)
✅ Updated `backend/server.js` to properly configure CORS:
- Now accepts requests from `http://localhost:3000`
- Credentials enabled for authentication

### 2. Frontend (API URL Configuration)
✅ Created `frontend/.env` with local API URL
✅ Created `frontend/src/utils/apiConfig.js` for centralized API configuration
✅ Updated `Login.js` and `Signup.js` to use the new API URL

### 3. Automated Script
✅ Created `frontend/update-api-urls.ps1` to update all remaining files

## How to Complete the Fix:

### Step 1: Update All Frontend Files
Run this command in PowerShell from the `frontend` directory:

```powershell
cd d:\accounting-management\frontend
.\update-api-urls.ps1
```

This will automatically update all API URLs in your frontend components.

### Step 2: Restart Backend Server
```bash
cd d:\accounting-management\backend
npm start
```

Make sure the backend is running on port 5001.

### Step 3: Restart Frontend Server
```bash
cd d:\accounting-management\frontend
npm start
```

The frontend should now connect to `http://localhost:5001` instead of the remote URL.

## What Was Fixed:

1. ❌ **502 Bad Gateway** - Backend server was not accessible
   ✅ Now using local backend at `http://localhost:5001`

2. ❌ **CORS Error** - Backend wasn't allowing frontend requests
   ✅ Backend now accepts requests from `http://localhost:3000`

3. ❌ **Wrong API URL** - Frontend was calling remote server
   ✅ Frontend now uses local API via environment variable

## Verify the Fix:

1. Open browser console (F12)
2. Try logging in
3. You should see requests going to `http://localhost:5001/api/auth/login`
4. No more CORS errors!

## For Production:

When deploying to production, update `frontend/.env`:
```
REACT_APP_API_URL=https://your-production-backend.com
```

And update `backend/.env`:
```
CLIENT_URL=https://your-production-frontend.com
```
