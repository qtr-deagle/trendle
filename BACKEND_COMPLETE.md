# Complete Authentication System - Backend & Frontend

## What Was Created

### Backend (Node.js/Express)
✅ Complete REST API with authentication
✅ MySQL database with 8 tables
✅ User registration with password hashing (bcryptjs)
✅ Login with JWT token generation
✅ Protected routes with authentication middleware
✅ Error handling and validation

### Frontend (React)
✅ Updated AuthContext to use real backend API
✅ Token storage in localStorage
✅ Automatic token validation on app startup
✅ Real error messages from backend
✅ Loading states during auth

### Database (MySQL)
✅ 8 production-ready tables with indexes
✅ Foreign key relationships
✅ Optimized for queries
✅ Ready for scaling

## Backend Setup Quick Steps

### 1. Create Database
```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure .env
```bash
cp .env.example .env
# Edit .env and update:
# - Database password
# - JWT_SECRET (use a strong random string)
```

### 4. Start Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

## Frontend Setup

Already configured! Frontend will automatically connect to backend at:
```
http://localhost:5000/api
```

Configured in: `c:\Users\cjala\trendle\.env.local`

## Test the Full Flow

### 1. Start Backend
```bash
cd backend
npm run dev
# Should see: "Server running on http://localhost:5000"
```

### 2. Start Frontend
```bash
npm run dev
# Should see: "Local: http://localhost:5173/"
```

### 3. Test Registration
1. Visit http://localhost:5173/
2. Click "Sign up"
3. Fill form with:
   - Username: testuser
   - Email: test@example.com
   - Birthday: Select any date
   - Password: testpassword123
4. Click "Next"
5. Select avatar
6. Click "Continue"
7. You should be at dashboard (authenticated)

### 4. Test Login
1. Click logout button
2. You're back at landing page
3. Click "Log in"
4. Enter: test@example.com / testpassword123
5. You're back at dashboard

### 5. Test Token Persistence
1. While logged in, refresh page (F5)
2. Auth state is restored from localStorage
3. You stay at dashboard (not logged out)

## File Locations

### Backend Files
```
backend/
├── server.js                 # Main server
├── config/database.js        # Database connection
├── middleware/auth.js        # JWT authentication
├── routes/auth.js            # Register/login endpoints
├── database/schema.sql       # Database setup
├── package.json              # Dependencies
├── .env.example              # Config template
└── README.md                 # Backend docs
```

### Frontend Files
```
src/
├── contexts/AuthContext.tsx  # Auth state (UPDATED)
├── pages/
│   ├── Login.tsx            # Login form (UPDATED)
│   ├── Signup.tsx           # Signup form
│   └── ...
└── .env.local               # API URL (NEW)
```

## How It Works

### Registration
```
User Form → Signup.tsx → AuthContext.signup()
→ POST /api/auth/register → Backend validates → Hashes password
→ Stores in database → Sends token back → localStorage
→ Updates auth state → Redirects to onboarding
```

### Login
```
User Form → Login.tsx → AuthContext.login()
→ POST /api/auth/login → Backend validates → Sends token
→ localStorage → Updates auth state → Redirects to dashboard
```

### Protected Requests
```
All API calls include: Authorization: Bearer <token>
Backend verifies token → Allows/denies access
```

### Auto-Login on Refresh
```
App starts → AuthContext useEffect runs
→ Checks localStorage for token
→ Calls GET /api/auth/me to validate
→ If valid, restores auth state
→ If invalid, clears token & logout
```

## Database Schema

### Users Table
- Stores username, email, password (hashed), profile info
- Indexes on username and email for fast lookups
- Timestamps for created_at and updated_at

### Posts Table
- Links to users (user_id)
- Stores content and images
- Has created_at index for sorting

### Communities Table
- Stores community info
- Has member_count

### Other Tables
- user_communities - Who joined what
- follows - User relationships
- comments - Post replies
- likes - Likes system
- messages - Direct messages
- sessions - Active tokens

## Environment Variables

### Backend (.env)
```
DATABASE_URL=mysql://root:password@localhost:3306/trendle
JWT_SECRET=generate_random_string_here
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

## Security Features

✅ Passwords hashed with bcryptjs (salt 10)
✅ JWT tokens with expiration (7 days)
✅ CORS enabled for frontend only
✅ Protected routes with auth middleware
✅ Input validation
✅ Error messages don't reveal sensitive info

## Future Enhancements

1. **Email Verification**
   - Send verification email on signup
   - Only allow login after verification

2. **Password Reset**
   - Forgot password flow
   - Email with reset link
   - Password reset validation

3. **Refresh Tokens**
   - Shorter lived access tokens
   - Refresh tokens for security
   - Token rotation

4. **Profile Updates**
   - Update display name, bio, avatar
   - Change email
   - Change password

5. **Post Management**
   - Create/read/update/delete posts
   - Upload images
   - Trending posts

6. **Social Features**
   - Follow/unfollow users
   - Create/join communities
   - Messaging system
   - Notifications

## Troubleshooting

### Can't connect to database?
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### "PORT 5000 already in use"
- Another process is using it
- Kill it: `lsof -ti:5000 | xargs kill -9` (Linux/Mac)
- Or change PORT in .env

### Frontend can't connect to backend?
- Verify backend is running on port 5000
- Check .env.local has correct API_URL
- Browser console should show network errors

### Passwords not hashing?
- bcryptjs is installed? `npm list bcryptjs` in backend
- Node version compatible? (need v14+)

### Token not working?
- Check token is in localStorage
- Verify JWT_SECRET matches backend
- Token might be expired (7 days)

## Testing API with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Get User (with token)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Production Deployment

1. Set NODE_ENV=production
2. Use environment variables (not .env)
3. Use HTTPS only
4. Set strong JWT_SECRET
5. Use database backups
6. Enable connection pooling
7. Add rate limiting
8. Use reverse proxy (Nginx)

## Support

- See `BACKEND_SETUP.md` for detailed setup
- See `backend/README.md` for API docs
- Frontend docs in `README_AUTH.md`

## Summary

You now have:
- ✅ Full authentication system
- ✅ Real database
- ✅ Secure login/register
- ✅ Token-based access control
- ✅ Production-ready backend
- ✅ Frontend integrated with backend
- ✅ Complete documentation

Ready to add more features!
