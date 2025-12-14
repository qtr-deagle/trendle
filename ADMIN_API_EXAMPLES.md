# Admin API Examples & Testing Guide

## Base URL
```
http://localhost:8000/api
```

## Getting Started

### Step 1: Admin Login
```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trendle.com",
    "password": "password"
  }'
```

**Response** (HTTP 200):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@trendle.com",
    "is_admin": true
  }
}
```

Save the `token` value - you'll need it for all subsequent requests.

### Step 2: Verify Admin Status
```bash
curl -X GET http://localhost:8000/api/admin/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response** (HTTP 200):
```json
{
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@trendle.com",
    "is_admin": true
  }
}
```

---

## Users Management

### Get All Users (Paginated)
```bash
curl "http://localhost:8000/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `page` (int): Page number, default 1
- `limit` (int): Items per page, default 20
- `search` (string): Search by username, email, or display_name
- `status` (string): Filter by 'active', 'inactive', 'admin', or 'all'

**Response** (HTTP 200):
```json
{
  "users": [
    {
      "id": 42,
      "username": "john_doe",
      "email": "john@example.com",
      "display_name": "John Doe",
      "avatar_url": "https://...",
      "bio": "Software developer",
      "followers_count": 150,
      "following_count": 80,
      "is_active": true,
      "is_admin": false,
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-10T15:30:00Z"
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 20
}
```

### Search Users
```bash
curl "http://localhost:8000/api/admin/users?search=john&status=active&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get User Details
```bash
curl http://localhost:8000/api/admin/users/42 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "user": {
    "id": 42,
    "username": "john_doe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Software developer",
    "followers_count": 150,
    "following_count": 80,
    "is_active": true,
    "is_admin": false,
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-10T15:30:00Z",
    "posts_count": 45,
    "comments_count": 120,
    "communities_count": 8
  }
}
```

### Ban User
```bash
curl -X POST http://localhost:8000/api/admin/users/42/ban \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Repeated harassment and abusive behavior"
  }'
```

**Response** (HTTP 200):
```json
{
  "success": true,
  "message": "User banned successfully"
}
```

### Activate User
```bash
curl -X POST http://localhost:8000/api/admin/users/42/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Promote User to Admin
```bash
curl -X POST http://localhost:8000/api/admin/users/42/promote \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Demote Admin to User
```bash
curl -X POST http://localhost:8000/api/admin/users/42/demote \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Tags Management

### Get All Tags
```bash
curl "http://localhost:8000/api/admin/tags?page=1&limit=20&filter=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `page` (int): Page number
- `limit` (int): Items per page
- `search` (string): Search by name or slug
- `filter` (string): 'active', 'inactive', or 'all'

**Response** (HTTP 200):
```json
{
  "tags": [
    {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript",
      "description": "Posts about JavaScript programming",
      "usage_count": 342,
      "is_active": true,
      "is_nsfw": false,
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-10T15:30:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20
}
```

### Create Tag
```bash
curl -X POST http://localhost:8000/api/admin/tags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python",
    "description": "Python programming language",
    "is_nsfw": false,
    "is_active": true
  }'
```

**Notes**:
- `slug` is optional - auto-generated from name if not provided
- `slug` must be unique
- `is_nsfw` and `is_active` default to false/true respectively

**Response** (HTTP 201):
```json
{
  "tag": {
    "id": 157,
    "name": "Python",
    "slug": "python",
    "description": "Python programming language",
    "usage_count": 0,
    "is_active": true,
    "is_nsfw": false,
    "created_at": "2025-12-14T10:30:00Z"
  }
}
```

### Update Tag
```bash
curl -X PUT http://localhost:8000/api/admin/tags/157 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description for Python",
    "is_nsfw": false,
    "is_active": true
  }'
```

**Response** (HTTP 200):
```json
{
  "tag": {
    "id": 157,
    "name": "Python",
    "slug": "python",
    "description": "Updated description for Python",
    "is_active": true,
    "is_nsfw": false
  }
}
```

### Delete Tag
```bash
curl -X DELETE http://localhost:8000/api/admin/tags/157 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

---

## Categories Management

### Get All Categories
```bash
curl "http://localhost:8000/api/admin/categories?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `page` (int): Page number
- `limit` (int): Items per page
- `search` (string): Search by name or slug
- `filter` (string): 'active', 'inactive', 'visible', 'hidden', or 'all'

**Response** (HTTP 200):
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Tech and innovation posts",
      "icon": "zap",
      "color": "#FF6B6B",
      "display_order": 1,
      "is_visible": true,
      "is_active": true,
      "created_by": 1,
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-10T15:30:00Z",
      "tag_count": 42
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

### Get Category Detail
```bash
curl http://localhost:8000/api/admin/categories/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "category": {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "description": "Tech and innovation posts",
    "icon": "zap",
    "color": "#FF6B6B",
    "display_order": 1,
    "is_visible": true,
    "is_active": true,
    "created_by": 1,
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-10T15:30:00Z",
    "tags": [
      {
        "id": 5,
        "name": "JavaScript",
        "slug": "javascript"
      },
      {
        "id": 6,
        "name": "Python",
        "slug": "python"
      }
    ]
  }
}
```

### Create Category
```bash
curl -X POST http://localhost:8000/api/admin/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Design",
    "slug": "design",
    "description": "UI/UX and graphic design",
    "icon": "palette",
    "color": "#4ECDC4",
    "display_order": 5,
    "is_visible": true,
    "is_active": true
  }'
```

**Response** (HTTP 201):
```json
{
  "category": {
    "id": 13,
    "name": "Design",
    "slug": "design",
    "description": "UI/UX and graphic design",
    "icon": "palette",
    "color": "#4ECDC4",
    "display_order": 5,
    "is_visible": true,
    "is_active": true,
    "created_at": "2025-12-14T10:30:00Z"
  }
}
```

### Update Category
```bash
curl -X PUT http://localhost:8000/api/admin/categories/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_order": 2,
    "color": "#FF0000"
  }'
```

### Delete Category
```bash
curl -X DELETE http://localhost:8000/api/admin/categories/13 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Reports Management

### Get All Reports
```bash
curl "http://localhost:8000/api/admin/reports?status=pending&reason=spam&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `page` (int): Page number
- `limit` (int): Items per page, default 20
- `status` (string): 'pending', 'resolved', 'dismissed', or 'all'
- `reason` (string): Filter by report reason
- `search` (string): Search in description

**Reasons**: spam, harassment, abusive_language, misinformation, hate_speech, sexual_content, violence, scam, other

**Response** (HTTP 200):
```json
{
  "reports": [
    {
      "id": 101,
      "reporter_username": "jane_smith",
      "reporter_avatar": "https://...",
      "reported_username": "bad_user",
      "reported_avatar": "https://...",
      "reason": "harassment",
      "description": "This user sent me threatening messages",
      "status": "pending",
      "assigned_admin_username": null,
      "created_at": "2025-12-14T08:00:00Z",
      "resolved_at": null
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### Get Report Details
```bash
curl http://localhost:8000/api/admin/reports/101 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "report": {
    "id": 101,
    "reporter_username": "jane_smith",
    "reported_username": "bad_user",
    "reason": "harassment",
    "description": "This user sent me threatening messages",
    "status": "pending",
    "assigned_admin_username": null,
    "resolution_notes": null,
    "created_at": "2025-12-14T08:00:00Z",
    "resolved_at": null,
    "reported_content": {
      "type": "post",
      "data": {
        "id": 456,
        "content": "The threatening post content here...",
        "image_url": null,
        "created_at": "2025-12-13T20:00:00Z",
        "username": "bad_user",
        "avatar_url": "https://..."
      }
    }
  }
}
```

### Update Report Status
```bash
curl -X PUT http://localhost:8000/api/admin/reports/101/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "notes": "Content was removed and user warned"
  }'
```

**Response** (HTTP 200):
```json
{
  "success": true,
  "message": "Report status updated"
}
```

### Approve Report (Remove Content)
```bash
curl -X POST http://localhost:8000/api/admin/reports/101/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "remove_content",
    "notes": "Post violated harassment policy"
  }'
```

**Actions**:
- `remove_content`: Mark post/comment as deleted
- `suspend_user`: Deactivate reported user
- `warn_user`: Send warning to user (reserved for future)

### Approve Report (Suspend User)
```bash
curl -X POST http://localhost:8000/api/admin/reports/101/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "suspend_user",
    "notes": "User account suspended for 30 days"
  }'
```

### Dismiss Report
```bash
curl -X POST http://localhost:8000/api/admin/reports/101/dismiss \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Report does not violate community guidelines"
  }'
```

### Get Report Statistics
```bash
curl http://localhost:8000/api/admin/reports/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "stats": {
    "total": 150,
    "pending": 23,
    "resolved": 127,
    "by_reason": {
      "spam": 8,
      "harassment": 12,
      "hate_speech": 3
    }
  }
}
```

---

## Messages (Contact/Support)

### Get All Messages
```bash
curl "http://localhost:8000/api/admin/messages?status=unread&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `page` (int): Page number
- `limit` (int): Items per page, default 20
- `status` (string): 'unread', 'read', 'resolved', or 'all'
- `search` (string): Search by sender name or email

**Response** (HTTP 200):
```json
{
  "messages": [
    {
      "id": 5,
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "subject": "Bug in comment system",
      "status": "unread",
      "username": "sarah_j",
      "user_username": null,
      "admin_username": null,
      "created_at": "2025-12-14T09:15:00Z",
      "replied_at": null
    }
  ],
  "total": 18,
  "page": 1,
  "limit": 20
}
```

### Get Message Details
```bash
curl http://localhost:8000/api/admin/messages/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "message": {
    "id": 5,
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "subject": "Bug in comment system",
    "message": "I found a bug where comments aren't loading properly...",
    "status": "unread",
    "admin_reply": null,
    "user_username": "sarah_j",
    "admin_username": null,
    "created_at": "2025-12-14T09:15:00Z",
    "replied_at": null
  }
}
```

### Mark Message as Read
```bash
curl -X POST http://localhost:8000/api/admin/messages/5/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

### Send Reply
```bash
curl -X POST http://localhost:8000/api/admin/messages/5/reply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reply": "Thank you for reporting this bug. Our team is investigating and will have a fix in the next release."
  }'
```

**Response** (HTTP 200):
```json
{
  "success": true,
  "message": "Reply sent successfully"
}
```

### Get Message Statistics
```bash
curl http://localhost:8000/api/admin/messages/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "stats": {
    "total": 48,
    "unread": 5,
    "read": 18,
    "resolved": 25
  }
}
```

---

## Admin Logs (Activity & Audit)

### Get All Logs
```bash
curl "http://localhost:8000/api/admin/logs?page=1&limit=50&action=ban_user" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `page` (int): Page number
- `limit` (int): Items per page, default 50
- `admin_id` (int): Filter by specific admin
- `action` (string): Filter by action type
- `target_type` (string): Filter by target type (user, tag, category, etc.)
- `start_date` (string): Start date YYYY-MM-DD
- `end_date` (string): End date YYYY-MM-DD

**Response** (HTTP 200):
```json
{
  "logs": [
    {
      "id": 1001,
      "admin_id": 1,
      "username": "admin",
      "avatar_url": "https://...",
      "action": "ban_user",
      "target_type": "user",
      "target_id": 42,
      "details": {
        "reason": "Repeated harassment",
        "target_user_id": 42
      },
      "created_at": "2025-12-14T10:30:00Z"
    }
  ],
  "total": 2456,
  "page": 1,
  "limit": 50
}
```

### Get Log Details
```bash
curl http://localhost:8000/api/admin/logs/1001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Activity Statistics
```bash
curl "http://localhost:8000/api/admin/logs/stats?start_date=2025-12-01&end_date=2025-12-14" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "stats": {
    "total_logs": 542,
    "by_action": {
      "ban_user": 12,
      "create_tag": 8,
      "update_category": 15,
      "approve_report": 24
    },
    "by_target_type": {
      "user": 156,
      "tag": 89,
      "category": 124,
      "report": 173
    },
    "top_admins": [
      {
        "id": 1,
        "username": "admin",
        "action_count": 234
      },
      {
        "id": 2,
        "username": "moderator",
        "action_count": 156
      }
    ]
  }
}
```

### Get Audit Trail for Specific Resource
```bash
curl "http://localhost:8000/api/admin/logs/audit-trail?target_type=user&target_id=42" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 200):
```json
{
  "audit_trail": [
    {
      "id": 1001,
      "admin_id": 1,
      "username": "admin",
      "avatar_url": "https://...",
      "action": "ban_user",
      "details": {
        "reason": "Repeated harassment"
      },
      "created_at": "2025-12-14T10:30:00Z"
    },
    {
      "id": 998,
      "admin_id": 2,
      "username": "moderator",
      "avatar_url": "https://...",
      "action": "promote_to_admin",
      "details": null,
      "created_at": "2025-12-01T09:00:00Z"
    }
  ]
}
```

---

## Error Handling Examples

### Missing Required Field (400)
```bash
curl -X POST http://localhost:8000/api/admin/tags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Missing name field"}'
```

**Response** (HTTP 400):
```json
{
  "error": "Tag name is required"
}
```

### Invalid Token (401)
```bash
curl http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer INVALID_TOKEN"
```

**Response** (HTTP 401):
```json
{
  "error": "Invalid or expired token"
}
```

### Non-Admin User (403)
```bash
curl http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer TOKEN_OF_REGULAR_USER"
```

**Response** (HTTP 403):
```json
{
  "error": "Unauthorized - admin access required"
}
```

### Resource Not Found (404)
```bash
curl http://localhost:8000/api/admin/users/999999 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (HTTP 500):
```json
{
  "error": "Failed to fetch user detail"
}
```

---

## Testing with PowerShell

### Login and Save Token
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/admin/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{"email"="admin@trendle.com"; "password"="password"} | ConvertTo-Json)

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

### Use Token in Subsequent Requests
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$users = Invoke-WebRequest -Uri "http://localhost:8000/api/admin/users?page=1" `
  -Headers $headers

$users.Content | ConvertFrom-Json | ConvertTo-Json
```

---

## Testing with JavaScript/Node.js

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@trendle.com',
    password: 'password'
  })
});

const { token } = await loginResponse.json();

// Get users
const usersResponse = await fetch('http://localhost:8000/api/admin/users?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { users, total } = await usersResponse.json();
console.log(`Total users: ${total}`);
console.log(users);
```

