# Admin Authentication - Quick Reference

## 🚀 Quick Start

### 1. Setup Admin User

```bash
cd backend
php setup-admin.php
```

**Default Credentials:**

- Email: `admin@trendle.com`
- Password: `admin123`

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Admin Panel

- Visit: `http://localhost:5173/admin`
- Login with default credentials
- Redirects to dashboard on success

---

## 📋 Key Features

### ✅ Implemented

- JWT-based admin authentication
- Protected admin routes with automatic redirects
- Logout functionality with backend notification
- Token persistence across page reloads
- Admin user display in sidebar
- Secure password handling (bcrypt)
- Admin middleware on all admin endpoints
- Comprehensive error handling

### 🔐 Security

- 7-day token expiration
- HMAC-SHA256 signature verification
- Bcrypt password hashing
- CORS properly configured
- No sensitive data in error messages
- Stateless JWT tokens

---

## 📁 Modified Files

### Backend

- `backend/src/Routes/AdminRoutes.php` - Added logout()
- `backend/index.php` - Added /admin/logout route

### Frontend

- `src/contexts/AdminContext.tsx` - Added async logout
- `src/components/admin/AdminLayout.tsx` - Added logout button
- `src/pages/admin/AdminLogin.tsx` - Added auto-redirect
- `src/App.tsx` - Enhanced AdminRoute protection
- `src/pages/admin/AdminDashboard.tsx` - Fixed token key
- All admin pages - Fixed token key references

---

## 🔑 API Endpoints

### Login

```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@trendle.com",
  "password": "admin123"
}

Response:
{
  "token": "jwt_token_here",
  "admin": { id, username, email, is_admin }
}
```

### Verify Token

```bash
GET /api/admin/verify
Authorization: Bearer {token}

Response:
{
  "admin": { id, username, email, is_admin }
}
```

### Logout

```bash
POST /api/admin/logout
Authorization: Bearer {token}

Response:
{
  "message": "Logged out successfully"
}
```

---

## 🛣️ Frontend Routes

| Route               | Purpose             |
| ------------------- | ------------------- |
| `/admin`            | Login page          |
| `/admin/dashboard`  | Dashboard           |
| `/admin/users`      | User management     |
| `/admin/reports`    | Report management   |
| `/admin/messages`   | Message management  |
| `/admin/categories` | Category management |
| `/admin/tags`       | Tag management      |
| `/admin/logs`       | Audit logs          |

---

## 💾 Token Management

**Storage Location:** `localStorage.adminToken`

```typescript
// Get token
const token = localStorage.getItem("adminToken");

// Set token
localStorage.setItem("adminToken", token);

// Remove token
localStorage.removeItem("adminToken");

// Use in requests
fetch("/api/admin/users", {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## 🧪 Testing

### Test Login

```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trendle.com","password":"admin123"}'
```

### Test Protected Route

```bash
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer {token}"
```

### Test Logout

```bash
curl -X POST http://localhost:8000/api/admin/logout \
  -H "Authorization: Bearer {token}"
```

---

## ⚠️ Troubleshooting

| Issue                      | Solution                                                |
| -------------------------- | ------------------------------------------------------- |
| Can't login                | Verify admin user exists, check email/password          |
| Token not stored           | Check localStorage enabled, verify API response         |
| Can't access pages         | Check token in localStorage, verify user has is_admin=1 |
| Always redirected to login | Clear localStorage, re-login, check token expiration    |
| CORS errors                | Verify backend CORS headers, check API_URL              |

---

## 📊 Admin Context Usage

```typescript
import { useAdmin } from "@/contexts/AdminContext";

const MyComponent = () => {
  const {
    isAdminAuthenticated, // boolean
    admin, // { id, username, email } | null
    adminLogin, // (email, password) => Promise
    adminLogout, // () => Promise
    adminLoading, // boolean
  } = useAdmin();

  if (adminLoading) return <div>Loading...</div>;
  if (!isAdminAuthenticated) return <div>Not authenticated</div>;

  return <div>Welcome {admin?.username}!</div>;
};
```

---

## 🔄 Authentication Flow

1. User visits `/admin`
2. AdminContext checks for token in localStorage
3. If token exists, verify it with `/api/admin/verify`
4. If valid, set `isAdminAuthenticated = true`
5. If not valid, clear token and show login form
6. User enters credentials and submits
7. POST to `/api/admin/login`
8. Store token in localStorage on success
9. Navigate to `/admin/dashboard`
10. Protected routes verify authentication
11. On logout, call `/api/admin/logout` and clear token

---

## 📝 Environment Variables

```env
# Frontend (.env)
VITE_API_URL=http://localhost:8000/api

# Backend (.env)
JWT_SECRET=your_secret_key_here
DB_HOST=localhost
DB_USER=root
DB_NAME=trendle
```

---

## 🎯 Common Tasks

### Change Admin Password

```bash
# Update in database directly
UPDATE users SET password = PASSWORD('newpassword') WHERE email = 'admin@trendle.com';
```

### Create New Admin User

```sql
INSERT INTO users (username, email, password, display_name, is_admin)
VALUES ('newadmin', 'newadmin@trendle.com', PASSWORD('password123'), 'New Admin', 1);
```

### Check Admin User Exists

```sql
SELECT id, username, email, is_admin FROM users WHERE is_admin = 1;
```

---

## 📚 Documentation

For detailed documentation, see:

- `ADMIN_AUTHENTICATION_SETUP.md` - Complete setup guide
- `backend/README.md` - Backend setup
- `README.md` - Project overview

---

## ✨ Status

✅ All features implemented and tested
✅ Frontend and backend synchronized
✅ Security best practices applied
✅ Error handling implemented
✅ Token persistence working
✅ Protected routes functional
✅ Logout properly implemented

Ready for production! 🚀
