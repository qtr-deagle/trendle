# Admin Panel - Quick Reference Guide

## 🚀 Quick Start

### Access Admin Panel
1. Navigate to `/admin` 
2. Enter admin credentials to login
3. You'll see the admin dashboard with sidebar navigation

### Navigation
Click sidebar items to access:
- **Dashboard** - System overview and metrics
- **User** - User management and account controls
- **Reports** - Content moderation and report handling
- **Messages** - Contact form management
- **Categories** - Content category management
- **Tags** - Tag management and merging
- **Audit Logs** - Admin action tracking

## 📊 Dashboard Features

### Key Metrics
- **Total Users** - Complete user count
- **Total Posts** - All posts in system
- **Pending Reports** - Active reports awaiting action
- **Unread Messages** - New contact submissions
- **Content Stats** - Flagged items, categories, tags
- **Banned Users** - Suspended accounts

### Quick Actions
- Direct links to all admin modules
- Content management summary
- Recent activities timeline
- Alerts and notifications panel

## 👥 User Management

### Find Users
- Use search bar to find by username/email
- Filter by active/inactive status
- Paginate through results (20 per page)

### User Actions
1. Click "View Details" to see user profile
2. See posts count, followers, following
3. Use "Ban" to suspend account
4. Use "Activate" to restore account

## 📋 Reports Management

### Filter Reports
- **Status**: Pending, Resolved, Dismissed
- **Reason**: Select from 10 categories
  - Spam, Harassment, Abusive Language, Misinformation, Hate Speech, Sexual Content, Violence, Scam, Other

### Take Action
1. View report details
2. Click "View Reported Content"
3. Choose action: Warn, Suspend, Remove, Dismiss
4. Add notes explaining decision
5. Click confirm

## 💬 Messages Management

### Handle Messages
1. View contact messages from users
2. Filter by status: Unread, Read, Resolved
3. Click message to read full content
4. Reply with "Message" button
5. Send response (auto-marks as resolved)

## 📁 Categories Management

### Create Category
1. Click "New Category"
2. Fill in: Name (required), Slug (required), Description
3. Pick color using color picker
4. Set icon name
5. Configure visibility and active status
6. Click "Create Category"

### Edit/Delete
- Click "Edit" to modify category
- Click delete icon to remove (with confirmation)
- Search to find categories quickly

## 🏷️ Tags Management

### Create Tags
1. Click "New Tag"
2. Enter: Name (required), Slug (required), Description
3. Toggle NSFW if applicable
4. Toggle Active status
5. Click "Create Tag"

### Merge Tags
1. Click merge icon on source tag
2. Select target tag from dropdown
3. Usage counts combine automatically
4. Source tag is deleted
5. Click "Merge" to confirm

## 📝 Audit Logs

### View Admin Actions
- Complete history of all admin activities
- Filter by action type (create, update, delete, ban, etc.)
- Search by username or target type
- Click "Details" to see full action information

### What's Logged
- Who performed the action (admin name)
- When it happened (timestamp)
- What action was taken
- What was affected (target type/ID)
- Additional details in JSON format

## ✅ Common Tasks

### Ban a User
1. Go to Users
2. Search/find user
3. Click "View Details"
4. Click "Ban User"
5. Confirm action

### Respond to Message
1. Go to Messages
2. Find message
3. Click to open detail modal
4. Type response in reply field
5. Click "Send Reply"

### Create New Category
1. Go to Categories
2. Click "New Category"
3. Fill form (name + slug required)
4. Set color and visibility
5. Click "Create Category"

### Merge Duplicate Tags
1. Go to Tags
2. Find tag to merge
3. Click merge icon
4. Select target tag
5. Click "Merge"

### Moderate Report
1. Go to Reports
2. Filter by "Pending" status
3. Click report
4. Review reported content
5. Choose action (warn/suspend/remove/dismiss)
6. Add notes
7. Click confirm

## 🔒 Security Notes

- Admin credentials are required to access
- All actions are logged in Audit Logs
- Confirmation dialogs prevent accidental deletions
- JWT tokens expire (check login if session ends)
- Always check audit logs for suspicious activity

## ⚠️ Important

### Destructive Actions
- **Delete Category** - Cannot be undone, removes category
- **Delete Tag** - Removes tag from system
- **Ban User** - Suspends user account
- **Remove Content** - Permanently deletes reported post/comment

All destructive actions require confirmation.

### Before Taking Action
1. Review all information carefully
2. Double-check user/content details
3. Read reporter notes
4. Add your own notes for audit trail
5. Confirm the action

## 📱 Mobile Access

Admin panel is responsive:
- **Mobile (375px)** - Single column, touch-friendly
- **Tablet (768px)** - 2 column layout
- **Desktop (1920px)** - Full multi-column layout

## 🆘 Troubleshooting

### Can't Login?
- Check admin credentials
- Verify user has is_admin = 1 in database
- Clear browser cache and try again

### Can't See Data?
- Verify user is logged in
- Check browser console for errors
- Ensure API backend is running
- Check network tab for 401/403 errors

### Missing Data?
- Refresh page (F5)
- Check pagination - you might be on wrong page
- Use search/filter to find specific items

### Action Not Working?
- Check form validation (required fields)
- See if confirmation dialog appeared
- Check browser console for errors
- Look in Audit Logs to verify action succeeded

## 📞 Support

For issues:
1. Check [ADMIN_TESTING_GUIDE.md](ADMIN_TESTING_GUIDE.md) for detailed tests
2. Review [ADMIN_PANEL_COMPLETE.md](ADMIN_PANEL_COMPLETE.md) for full documentation
3. Check browser console (F12) for errors
4. Review backend server logs
5. Check database for data consistency

## 📊 Key Stats

| Feature | Details |
|---------|---------|
| Admin Pages | 7 modules |
| API Endpoints | 23+ routes |
| Users Manageable | Unlimited |
| Reports Trackable | Unlimited |
| Audit Log Entries | Unlimited |
| Response Time | < 1 second |
| Pagination Size | 20 items/page |

## ✨ Latest Features

### AdminTags (Version 1.0)
- Full CRUD operations
- Tag merging with usage consolidation
- NSFW content flagging
- Search and filtering
- Active/Inactive status toggle

### AdminLogs (Version 1.0)
- Complete audit trail
- Action filtering
- Username search
- Detailed JSON view
- Chronological sorting

### Dashboard (Version 2.0)
- 10 system metrics
- Recent activities timeline
- Alert notifications
- Quick navigation
- Content management summary

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: December 2024

For full feature documentation, see [ADMIN_PANEL_COMPLETE.md](ADMIN_PANEL_COMPLETE.md)
