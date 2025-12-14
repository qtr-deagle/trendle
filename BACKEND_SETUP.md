# Backend Setup Guide

## Prerequisites
- Node.js (v16+)
- MySQL Server (v8.0+)
- npm

## Installation Steps

### 1. Setup MySQL Database

```bash
# Open MySQL client
mysql -u root -p

# Then run the schema.sql file:
source backend/database/schema.sql
```

Or manually:
```sql
CREATE DATABASE trendle;
USE trendle;
-- Copy and paste contents from backend/database/schema.sql
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=mysql://root:password@localhost:3306/trendle
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
NODE_ENV=development
```

**Important:** 
- Change `PASSWORD` to your MySQL root password
- Change `JWT_SECRET` to a strong random string
- Make sure database credentials are correct

### 4. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Server will start on `http://localhost:5000`

Verify with:
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

## API Endpoints

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "bio": "...",
    "avatar_url": "...",
    "followers": 0,
    "following": 0
  }
}
```

## Frontend Configuration

The frontend is already configured to connect to the backend.

Frontend `.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

## How Authentication Works

### Registration Flow
1. User fills signup form (username, email, password)
2. Frontend sends POST request to `/api/auth/register`
3. Backend:
   - Validates input
   - Checks if user exists
   - Hashes password with bcrypt
   - Creates user in database
   - Generates JWT token
4. Frontend:
   - Stores token in localStorage
   - Updates auth context
   - Redirects to onboarding

### Login Flow
1. User fills login form (email, password)
2. Frontend sends POST request to `/api/auth/login`
3. Backend:
   - Finds user by email
   - Compares password with hash
   - Generates JWT token
4. Frontend:
   - Stores token in localStorage
   - Updates auth context
   - Redirects to dashboard

### Authenticated Requests
All protected API calls include token in header:
```
Authorization: Bearer <token>
```

Backend verifies token and allows access.

### Logout
1. Frontend deletes token from localStorage
2. Updates auth context
3. Clears user data
4. Redirects to landing page

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `display_name` - Display name
- `bio` - User biography
- `avatar_url` - Profile picture URL
- `followers` - Follower count
- `following` - Following count
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

### Other Tables
- `posts` - User posts
- `communities` - Communities
- `user_communities` - Community membership
- `follows` - User relationships
- `comments` - Post comments
- `likes` - Post/comment likes
- `messages` - Direct messages
- `sessions` - Active sessions/tokens

## Troubleshooting

### "Cannot find module" errors
```bash
cd backend
npm install
```

### "Cannot connect to database"
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database `trendle` exists
- Run schema.sql again

### "JWT_SECRET is required"
- Create `.env` file from `.env.example`
- Add a random JWT_SECRET

### CORS errors in frontend
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend `.env.local`
- Backend has CORS enabled

### Token expired
- Frontend automatically clears invalid tokens
- User is redirected to login
- Login again to get new token

## Next Steps

### Add More Features
1. Update profile endpoint
2. Create post endpoints
3. Follow/unfollow endpoints
4. Community management endpoints
5. Messaging endpoints

### Security Improvements
1. Add rate limiting
2. Implement email verification
3. Add password reset flow
4. Use refresh tokens
5. Add HTTPS in production

### Deployment
1. Use environment variables for all secrets
2. Set NODE_ENV=production
3. Use database backups
4. Enable HTTPS
5. Use a reverse proxy (Nginx)

## Running Both Frontend & Backend

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

Both servers should now be running:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Testing with Postman/cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
