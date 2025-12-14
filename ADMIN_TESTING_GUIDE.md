# Admin Panel Integration Testing Guide

This guide covers comprehensive testing of the Admin Panel implementation across all features and endpoints.

## Overview
The Admin Panel consists of 7 major pages with backend API endpoints:
1. **Dashboard** - System metrics and overview
2. **User Management** - View, search, filter, and manage users
3. **Reports & Moderation** - Review and moderate user reports
4. **Messages Management** - Handle contact messages and replies
5. **Categories Management** - CRUD operations for categories
6. **Tags Management** - CRUD and merge operations for tags
7. **Audit Logs** - Track all admin actions

## Backend Endpoints Reference

### Dashboard Metrics
- **GET** `/api/admin/dashboard` - Get system metrics and recent activities
  - Returns: 10 metrics, recent activities, alerts

### User Management
- **GET** `/api/admin/users?search=&status=&page=&limit=` - List all users
- **GET** `/api/admin/users/:userId` - Get detailed user info
- **PUT** `/api/admin/users/:userId/status` - Update user status (activate/deactivate)

### Reports Management
- **GET** `/api/admin/reports?status=&reason=&page=&limit=` - List reports
- **GET** `/api/admin/reports/:reportId` - Get report details
- **PUT** `/api/admin/reports/:reportId/status` - Update report status
- **POST** `/api/admin/reports/:reportId/action` - Take moderation action

### Messages Management
- **GET** `/api/admin/messages?status=&page=&limit=` - List contact messages
- **PUT** `/api/admin/messages/:messageId/reply` - Reply to message
- **PUT** `/api/admin/messages/:messageId/status` - Update message status

### Categories Management
- **GET** `/api/admin/categories` - List all categories
- **POST** `/api/admin/categories` - Create new category
- **PUT** `/api/admin/categories/:categoryId` - Update category
- **DELETE** `/api/admin/categories/:categoryId` - Delete category

### Tags Management
- **GET** `/api/admin/tags` - List all tags
- **POST** `/api/admin/tags` - Create new tag
- **PUT** `/api/admin/tags/:tagId` - Update tag
- **DELETE** `/api/admin/tags/:tagId` - Delete tag
- **POST** `/api/admin/tags/:tagId/merge` - Merge tags
- **POST** `/api/admin/categories/:categoryId/assign-tag` - Assign tag to category

### Audit Logs
- **GET** `/api/admin/logs?action=&search=&page=&limit=` - Get admin action logs

## Testing Checklist

### 1. Authentication & Authorization
- [ ] Admin user can login with valid credentials
- [ ] Non-admin users cannot access `/admin/*` routes
- [ ] JWT token is properly sent with all requests (Authorization header)
- [ ] Expired tokens are rejected with 401 status
- [ ] Missing auth header returns 401 Unauthorized

### 2. Dashboard Testing
- [ ] Metrics load correctly (total users, posts, reports, etc.)
- [ ] Recent activities display with timestamps
- [ ] Alert panel shows pending reports and unread messages
- [ ] Quick action buttons navigate to correct pages
- [ ] Error handling shows toast when API fails
- [ ] Page loads within 2 seconds

### 3. User Management Testing
- [ ] List all users displays correctly with pagination
- [ ] Search functionality filters users by name/email in real-time
- [ ] Filter dropdown changes active/inactive status display
- [ ] User detail modal shows all info (username, email, posts, followers, following)
- [ ] Ban action shows confirmation dialog and updates user status
- [ ] Activate action restores user account
- [ ] Pagination shows correct number of pages
- [ ] Each page shows 20 users by default
- [ ] Toast notifications appear after actions

### 4. Reports Management Testing
- [ ] List displays all reports with proper formatting
- [ ] Status filter works: All/Pending/Resolved/Dismissed
- [ ] Reason filter works with all 10 reason types
- [ ] Report detail modal shows reported content
- [ ] Moderation actions appear correctly (Warn, Suspend, Remove, Dismiss)
- [ ] Action dialog collects notes from admin
- [ ] Status updates after taking action
- [ ] Reported content snippet displays correctly
- [ ] Pagination works with filtered results

### 5. Messages Management Testing
- [ ] Contact messages load and display in table
- [ ] Status filter works: All/Unread/Read/Resolved
- [ ] Detail modal shows full message and sender info
- [ ] Reply form allows admin to compose response
- [ ] Sending reply marks message as resolved
- [ ] Mark as read updates status without replying
- [ ] Admin reply text persists in detail view
- [ ] Toast shows success/error feedback

### 6. Categories Management Testing
- [ ] List shows all categories in grid format
- [ ] Create form validates name and slug are required
- [ ] Color picker allows selecting category color
- [ ] Toggle switches work for visibility and active status
- [ ] Create button saves new category
- [ ] Edit button populates form with category data
- [ ] Update button saves changes
- [ ] Delete button shows confirmation dialog
- [ ] Confirmed delete removes category
- [ ] Search filters categories by name or slug
- [ ] Icons display correctly for each category

### 7. Tags Management Testing
- [ ] List shows all tags in grid format
- [ ] Create form validates name and slug required
- [ ] NSFW toggle marks tag as NSFW
- [ ] Active toggle enables/disables tag
- [ ] Usage count displays for each tag
- [ ] Edit button loads tag data into form
- [ ] Update saves changes correctly
- [ ] Delete shows confirmation dialog
- [ ] Merge dialog allows selecting target tag
- [ ] Merge combines usage counts and deletes source
- [ ] Search filters by name and slug
- [ ] Description field displays in preview

### 8. Audit Logs Testing
- [ ] Logs display all admin actions chronologically
- [ ] Action filter shows unique actions
- [ ] Search finds logs by username or target type
- [ ] Pagination shows logs 20 per page
- [ ] Detail modal shows complete action info
- [ ] JSON details display formatted in modal
- [ ] Timestamps show correct date/time
- [ ] Action badges show correct colors

### 9. Error Handling Testing
- [ ] Network errors show friendly error toast
- [ ] Validation errors prevent submission
- [ ] 400 Bad Request shows error message
- [ ] 401 Unauthorized redirects to login
- [ ] 403 Forbidden shows access denied
- [ ] 404 Not Found shows item not found
- [ ] 500 Server error shows generic error message
- [ ] Loading states display while fetching

### 10. UI/UX Testing
- [ ] All pages are responsive on mobile (375px width)
- [ ] All pages are responsive on tablet (768px width)
- [ ] All pages are responsive on desktop (1920px width)
- [ ] Buttons have proper hover states
- [ ] Forms show validation feedback
- [ ] Tables are sortable where applicable
- [ ] Modals are scrollable for long content
- [ ] Navigation sidebar is accessible from all pages
- [ ] Colors meet accessibility contrast requirements
- [ ] Page titles update document title

## Manual Testing Workflow

### Setup
1. Start backend server: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Login to admin account at `/admin`
4. Note any initial API errors in browser console

### Test Each Feature
1. Navigate to page using sidebar
2. Test CRUD operations:
   - **Create**: Fill form → Submit → Verify in list
   - **Read**: Click edit/view → Check all fields load
   - **Update**: Edit → Change values → Submit → Verify changes
   - **Delete**: Click delete → Confirm → Verify removed
3. Test filters and search
4. Test pagination
5. Check console for errors

### Report Issues
If you find issues:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check backend logs for API errors
4. Verify token is present in request headers
5. Test with fresh page reload
6. Check database state directly if needed

## Performance Testing

### Metrics to Monitor
- Page load time (should be < 2s)
- Search response time (should be < 500ms)
- CRUD operation completion (should be < 1s)
- Pagination load time (should be < 500ms)

### Tools
- Chrome DevTools Performance tab
- Network tab to monitor API calls
- Console for JavaScript errors
- Application tab to check localStorage (token)

## Success Criteria
✅ All endpoints return expected data  
✅ All CRUD operations work end-to-end  
✅ All filters and searches work correctly  
✅ Pagination works with correct limits  
✅ All error states show proper messages  
✅ UI is responsive on all screen sizes  
✅ No console errors during normal usage  
✅ Toast notifications appear for all actions  
✅ Confirmation dialogs prevent accidental deletions  
✅ Admin audit logs track all actions  

## Testing Tools
- **Browser**: Chrome/Edge with DevTools
- **API Testing**: Postman or Thunder Client
- **Database**: MySQL Workbench
- **Network**: Chrome DevTools Network tab
