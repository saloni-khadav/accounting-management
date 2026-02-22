# ✅ Verification Checklist

## Before Starting:

- [ ] Node.js is installed
- [ ] MongoDB is accessible (cloud or local)
- [ ] All dependencies are installed:
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```

## Files to Verify:

### Backend:
- [ ] `backend/.env` exists with:
  - MONGODB_URI
  - PORT=5001
  - JWT_SECRET
  - CLIENT_URL=http://localhost:3000

- [ ] `backend/server.js` has CORS configured:
  ```javascript
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  ```

### Frontend:
- [ ] `frontend/.env` exists with:
  ```
  REACT_APP_API_URL=http://localhost:5001
  ```

- [ ] `frontend/src/utils/apiConfig.js` exists with:
  ```javascript
  export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  ```

- [ ] Sample component check (Login.js):
  ```javascript
  import { API_URL } from '../utils/apiConfig';
  // ...
  fetch(`${API_URL}/api/auth/login`, {
  ```

## Running the Application:

### Option 1: Use the Batch File
- [ ] Double-click `START-APP.bat`
- [ ] Wait for both servers to start

### Option 2: Manual Start
- [ ] Terminal 1: `cd backend && npm start`
- [ ] Terminal 2: `cd frontend && npm start`

## Testing:

- [ ] Backend responds at: http://localhost:5001
  - Visit http://localhost:5001 - should see "Accounting Backend API is Running 🚀"

- [ ] Frontend loads at: http://localhost:3000
  - Should see the landing page

- [ ] Open Browser DevTools (F12) → Network tab

- [ ] Try to login:
  - [ ] Request goes to `http://localhost:5001/api/auth/login`
  - [ ] No CORS errors in console
  - [ ] No 502 errors
  - [ ] Response is 200 (success) or 401 (wrong credentials)

## Common Issues:

### Port Already in Use:
```bash
# Windows - Kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Failed:
- Check MONGODB_URI in backend/.env
- Verify MongoDB Atlas credentials
- Check network connection

### Module Not Found:
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### CORS Still Not Working:
- Clear browser cache
- Hard refresh (Ctrl + Shift + R)
- Check backend console for CORS logs
- Verify CLIENT_URL in backend/.env

## Success Indicators:

✅ Backend console shows:
```
✅ MongoDB Atlas connected
Server running on port 5001
```

✅ Frontend console shows:
```
Compiled successfully!
webpack compiled with 0 warnings
```

✅ Browser console shows:
- No red errors
- API calls to localhost:5001
- Successful responses

---

## Need Help?

If all checks pass but you still have issues:
1. Restart both servers
2. Clear browser cache completely
3. Try incognito/private browsing mode
4. Check firewall settings
5. Verify .env files are not in .gitignore and are being read

---

**All checks passed?** 🎉 Your application is ready to use!
