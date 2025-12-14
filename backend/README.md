# Trendle Backend

Node.js/Express backend API for the Trendle social platform with MySQL database and JWT authentication.

## Quick Start

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update database credentials in .env
# DATABASE_URL=mysql://root:password@localhost:3306/trendle
# JWT_SECRET=your_secret_key

# Setup database
mysql -u root -p < database/schema.sql

# Start server (dev mode)
npm run dev

# Server runs on http://localhost:5000
```

## Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/
│   └── auth.js              # Auth endpoints (register, login, me)
├── database/
│   └── schema.sql           # Database schema
├── server.js                # Main server file
├── package.json
├── .env.example             # Environment template
└── README.md
```

## Features

- ✅ User registration with password hashing
- ✅ Email/password login with JWT tokens
- ✅ Protected routes with authentication middleware
- ✅ MySQL database with optimized schema
- ✅ CORS enabled for frontend
- ✅ Error handling and validation
- ✅ Token persistence

## API Endpoints

### Public Routes
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/health` - Health check

### Protected Routes (require token)
- `GET /api/auth/me` - Get current user profile

## Environment Variables

```
DATABASE_URL=mysql://root:password@localhost:3306/trendle
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=5000
NODE_ENV=development
```

## Database Tables

- `users` - User accounts with profiles
- `posts` - User posts/content
- `communities` - Groups/communities
- `user_communities` - Community membership
- `follows` - User relationships
- `comments` - Post comments
- `likes` - Post/comment likes
- `messages` - Direct messages
- `sessions` - Active sessions

## Dependencies

- **express** - Web framework
- **mysql2** - MySQL database driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

## Development

```bash
# Start with auto-reload
npm run dev

# Start production server
npm start
```

## Future Enhancements

- [ ] Email verification
- [ ] Password reset flow
- [ ] Refresh token rotation
- [ ] Rate limiting
- [ ] User profile updates
- [ ] Post management
- [ ] Community management
- [ ] Follow/unfollow system
- [ ] Messaging system
- [ ] Notifications

## See Also

- [Backend Setup Guide](../BACKEND_SETUP.md) - Detailed setup instructions
- [Database Schema](database/schema.sql) - Full database schema
- Frontend: ../README.md

## Support

For issues, see BACKEND_SETUP.md troubleshooting section.
