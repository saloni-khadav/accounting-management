# Accounting Management Backend

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   - Update `.env` file with your actual MongoDB password
   - Replace `<db_password>` in MONGODB_URI with your actual password
   - Update JWT_SECRET with a secure secret key

3. **Start Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Request Examples

**Register:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "ABC Corp",
  "password": "password123"
}
```

**Login:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

## Frontend Integration

Add these to your React app for API calls:

```javascript
const API_URL = 'http://localhost:5000/api';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Register
const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```