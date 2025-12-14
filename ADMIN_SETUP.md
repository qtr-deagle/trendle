# Admin Setup Instructions

## Create Admin Account

1. **Run the setup script** from the backend folder:

```bash
cd backend
php setup-admin.php
```

You should see:
```
🔐 Creating admin user...
✓ Admin user created successfully!
📧 Email: admin@trendle.com
🔑 Password: admin123

✅ Admin setup complete!
```

## Admin Login

1. Navigate to `http://localhost:8080/admin`
2. Enter credentials:
   - **Email**: `admin@trendle.com`
   - **Password**: `admin123`
3. Click "Sign in to Admin"
4. Access the admin dashboard at `/admin/dashboard`

## Admin Features

- **Dashboard**: View system metrics (users, posts, communities, active sessions)
- **Users**: Manage all users, update admin status
- **Reports**: Review and moderate user reports
- **Messages**: View and respond to user messages
- **Categories**: Manage post categories
- **Tags**: Manage system tags and merge tags
- **Logs**: View system activity logs

## API Endpoints

### Admin Auth
- `POST /api/admin/login` - Login as admin
- `GET /api/admin/verify` - Verify admin token

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard metrics
- `GET /api/admin/users` - Get all users (paginated)
- `PUT /api/admin/users/:id/status` - Update user status

## Security Notes

⚠️ **Important for Production:**
1. Change the default admin password immediately
2. Use environment variables for sensitive data
3. Implement rate limiting on admin endpoints
4. Add two-factor authentication
5. Log all admin actions
6. Use HTTPS in production

## Database

The admin user is stored in the `users` table with `is_admin = 1`.

All admin endpoints verify the token and check `is_admin` status before allowing access.
