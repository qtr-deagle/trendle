# Admin Backend Quick Reference

## File Structure

```
backend/
├── src/
│   ├── Services/
│   │   ├── AdminUserService.php          ← User management
│   │   ├── AdminTagService.php           ← Tag management
│   │   ├── AdminCategoryService.php      ← Category management
│   │   ├── AdminReportService.php        ← Report moderation
│   │   ├── AdminContactMessageService.php← Support messages
│   │   └── AdminLogService.php           ← Activity logging
│   ├── Routes/
│   │   └── AdminRoutes.php               ← All admin endpoints
│   ├── Middleware/
│   │   └── Auth.php                      ← JWT authentication
│   └── Config/
│       └── Database.php                  ← DB connection
└── index.php                             ← Main router
```

---

## Core Concepts

### 1. Authentication Pattern
```php
// All endpoints must pass this check
if (!self::checkAdminAuth()) return;

// This extracts admin ID when needed
$adminId = self::getAdminId();
```

### 2. Database Interaction Pattern
```php
// Always use prepared statements
$stmt = $db->execute('SELECT * FROM table WHERE id = ?', [$id]);
$result = $stmt->get_result();
$row = $result->fetch_assoc();

// For inserts
$stmt = $db->execute('INSERT INTO table (...) VALUES (?, ?, ?)', [$v1, $v2, $v3]);
$id = $db->getConnection()->insert_id;
```

### 3. Service Usage Pattern
```php
$service = new AdminUserService();
$result = $service->methodName($param1, $param2);

// Services handle:
// - Database queries
// - Validation
// - Error handling
// - Logging actions
```

---

## All Services at a Glance

| Service | Main Tables | Key Actions |
|---------|-------------|------------|
| **AdminUserService** | users, posts, comments | List, Detail, Ban, Activate, Promote, Demote |
| **AdminTagService** | tags, category_tags | List, Create, Update, Delete |
| **AdminCategoryService** | categories, category_tags | List, Detail, Create, Update, Delete, Add/Remove Tags |
| **AdminReportService** | reports, users, posts, comments | List, Detail, Update Status, Approve, Dismiss, Stats |
| **AdminContactMessageService** | contact_messages, users | List, Detail, Mark Read, Send Reply, Stats |
| **AdminLogService** | admin_logs, users | List, Detail, Activity Stats, Audit Trail |

---

## API Endpoint Patterns

### Pattern 1: List/Fetch
```
GET /api/admin/{resource}?page=1&limit=20&search=query&filter=value
Response: { resource: [], total: int, page: int, limit: int }
```

### Pattern 2: Get Detail
```
GET /api/admin/{resource}/{id}
Response: { resource: {...} }
```

### Pattern 3: Create
```
POST /api/admin/{resource}
Body: { ...properties }
Response: { resource: {...} }  [HTTP 201]
```

### Pattern 4: Update
```
PUT /api/admin/{resource}/{id}
Body: { ...properties to update }
Response: { resource: {...} }
```

### Pattern 5: Delete
```
DELETE /api/admin/{resource}/{id}
Response: { success: true, message: "..." }
```

### Pattern 6: Action
```
POST /api/admin/{resource}/{id}/{action}
Body: { ...params }
Response: { success: true, message: "..." }
```

---

## Common Response Formats

### Success (200)
```json
{
  "users": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Created (201)
```json
{
  "tag": {
    "id": 42,
    "name": "JavaScript",
    "slug": "javascript",
    "created_at": "2025-12-14T10:30:00Z"
  }
}
```

### Error (400/401/403/500)
```json
{
  "error": "Descriptive error message"
}
```

---

## Database Tables Reference

### users
```
id, username, email, display_name, password_hash, avatar_url,
is_active, is_admin, followers_count, following_count, created_at
```

### tags
```
id, name, slug, description, usage_count, is_active, is_nsfw, created_at, updated_at
```

### categories
```
id, name, slug, description, icon, color, display_order,
is_visible, is_active, created_by, created_at, updated_at
```

### category_tags
```
id, category_id, tag_id
```

### reports
```
id, reporter_id, reported_user_id, post_id, comment_id,
reason, description, status, assigned_admin_id,
resolution_notes, created_at, resolved_at
```

### contact_messages
```
id, user_id, email, name, subject, message, status,
assigned_admin_id, admin_reply, created_at, replied_at
```

### admin_logs
```
id, admin_id, action, target_type, target_id,
details (JSON), created_at
```

---

## Validation Rules

### Tags
- **name**: Required, non-empty string
- **slug**: Must be unique (auto-generated if not provided)
- **description**: Optional text
- **is_nsfw**: Boolean (default: false)
- **is_active**: Boolean (default: true)

### Categories
- **name**: Required, non-empty string
- **slug**: Must be unique (auto-generated if not provided)
- **display_order**: Integer (default: 0)
- **color**: Valid hex code (default: #000000)
- **icon**: String identifier (optional)
- **is_visible**: Boolean (default: true)
- **is_active**: Boolean (default: true)

### Users
- All status changes logged to admin_logs
- Cannot ban/promote user that doesn't exist
- Admin status changes require admin privileges

### Reports
- **status**: Must be 'pending', 'resolved', or 'dismissed'
- Approved reports trigger content removal or user suspension
- All actions logged with detailed notes

---

## Common Tasks

### Ban a User
```php
$service = new AdminUserService();
$result = $service->banUser(
    $userId,
    $adminId,
    "Reason for ban"
);
```

### Create a Tag
```php
$service = new AdminTagService();
$tag = $service->createTag(
    "JavaScript",
    "", // slug auto-generated
    "Posts about JavaScript programming",
    false, // is_nsfw
    true, // is_active
    $adminId
);
```

### Update a Category
```php
$service = new AdminCategoryService();
$updated = $service->updateCategory(
    $categoryId,
    ['display_order' => 5, 'color' => '#FF0000'],
    $adminId
);
```

### Approve a Report
```php
$service = new AdminReportService();
$service->approveReport(
    $reportId,
    $adminId,
    'remove_content', // or 'suspend_user'
    'Post violated terms of service'
);
```

### Send Message Reply
```php
$service = new AdminContactMessageService();
$service->sendReply(
    $messageId,
    "Thank you for your message. We appreciate your feedback.",
    $adminId
);
```

### Get Audit Trail
```php
$service = new AdminLogService();
$trail = $service->getAuditTrail('user', $userId);
// Shows all changes made to this user
```

---

## Error Handling

All services throw exceptions with descriptive messages:

```php
try {
    $service->createTag("name", "slug", "", false, true, $adminId);
} catch (Exception $e) {
    // Log or handle: "Tag slug must be unique"
    error_log("Tag creation failed: " . $e->getMessage());
}
```

All endpoints catch exceptions and return proper HTTP status codes:
- **400**: Validation error
- **401**: Missing authentication
- **403**: Insufficient permissions
- **404**: Resource not found
- **500**: Server error

---

## Testing Checklist

- [ ] All endpoints return correct HTTP status codes
- [ ] All endpoints require valid JWT token
- [ ] All endpoints verify is_admin = 1
- [ ] All modifications are logged to admin_logs
- [ ] All queries use prepared statements
- [ ] All email validations pass
- [ ] All slug generations are unique
- [ ] Pagination works with correct totals
- [ ] Filtering by status/type works
- [ ] Search functionality works across multiple fields
- [ ] Date filtering works for logs
- [ ] Audit trails show complete change history
- [ ] Report statistics are accurate
- [ ] Message status transitions work correctly

---

## Debugging Tips

### 1. Check Logs
```bash
tail -f /var/log/trendle-admin.log
```

### 2. Verify Token
```php
$decoded = Auth::verifyToken($token);
if ($decoded === null) {
    echo "Token is invalid or expired";
}
```

### 3. Test DB Connection
```php
$db = Database::getInstance();
$result = $db->query('SELECT 1');
echo $result ? "Connected" : "Failed";
```

### 4. Verify Admin Status
```php
$stmt = $db->execute(
    'SELECT is_admin FROM users WHERE id = ?',
    [$userId]
);
$user = $stmt->get_result()->fetch_assoc();
echo $user['is_admin'] ? "Is admin" : "Not admin";
```

---

## Performance Considerations

1. **Pagination**: Always use LIMIT/OFFSET for large result sets
2. **Indexing**: Key database columns are indexed (name, slug, status, created_at)
3. **JSON Details**: Details are stored as JSON in admin_logs for flexibility
4. **Counts**: Use COUNT(*) for statistics, not full result sets
5. **Lazy Loading**: Get associated data only when needed

---

## Security Checklist

- ✅ All queries use prepared statements
- ✅ All endpoints verify JWT token
- ✅ All endpoints verify admin status (is_admin = 1)
- ✅ All modifications logged with admin ID
- ✅ Error messages don't expose system details
- ✅ Database errors logged but not returned to client
- ✅ Timestamps use server timezone (UTC)
- ✅ Slug generation prevents directory traversal
- ✅ JSON data is properly escaped

---

## Related Documentation

- Main documentation: [ADMIN_BACKEND_IMPLEMENTATION.md](./ADMIN_BACKEND_IMPLEMENTATION.md)
- Database schema: [database_schema.sql](./database_schema.sql)
- Frontend admin pages: `/src/pages/admin/`
- Authentication: `/backend/src/Middleware/Auth.php`

