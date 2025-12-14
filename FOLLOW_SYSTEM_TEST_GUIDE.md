# Follow System - Complete Testing Guide

## Quick Test Workflow

### Part 1: Authentication State Management

#### Test 1.1: Token Validation on Page Load
1. Open application → should load "Loading..." briefly
2. If no token: "Please log in..." message appears
3. If valid token: Dashboard loads with user authenticated
4. Open DevTools Console → should see:
   ```
   [AuthContext] Initializing - checking for persisted token
   [AuthContext] No token found, setting unauthenticated state
   ```

#### Test 1.2: Auth State After Login
1. Go to Login page
2. Enter valid credentials and submit
3. Should redirect to Dashboard (authenticated)
4. Refresh page
5. Should still be authenticated (token persisted)
6. Open DevTools Console → should see:
   ```
   [AuthContext] Token found in localStorage, verifying with backend
   [AuthContext] Token verified, user authenticated: [username]
   ```

#### Test 1.3: Auth State Invalidation
1. Be logged in with valid token
2. Manually delete token from localStorage:
   ```javascript
   // In DevTools Console:
   localStorage.removeItem("token");
   location.reload();
   ```
3. Page should refresh and show "Please log in..."
4. Verify ProtectedRoute prevents access to /dashboard/home

#### Test 1.4: Logout Clears Auth
1. Login to application
2. Click logout/Profile → Logout
3. Should redirect to home (/)
4. Try accessing /dashboard/home → redirected to /
5. localStorage should not contain token

### Part 2: Follow Button State Management

#### Test 2.1: Follow/Unfollow Toggle
1. Login as User A
2. Navigate to Explore page
3. Find another user (User B)
4. Click "Follow" button
5. Button should:
   - Show loading spinner
   - After ~1-2 seconds, show "Following"
6. Click "Following" button
7. Button should:
   - Show loading spinner
   - After ~1-2 seconds, show "Follow"
8. Check DevTools Console for:
   ```
   [FollowButton] Attempting to follow username
   [FollowButton] API success for /user/username/follow
   [FollowButton] Refetching follow status from backend...
   [FollowButton] Follow status response: {isFollowing: true, userId: 123}
   ```

#### Test 2.2: State Persists After Refresh
1. Follow User B (see Test 2.1)
2. Verify button shows "Following"
3. Refresh page (F5)
4. Button should still show "Following" (not reset to "Follow")
5. Check DevTools Console to verify `checkFollowStatus()` was called

#### Test 2.3: Disabled for Own Account
1. Navigate to own profile
2. Follow button should not appear
3. Go to another user's profile while logged in
4. Follow button should be visible
5. Go to own profile
6. Follow button should not be visible

#### Test 2.4: Disabled When Not Authenticated
1. Logout completely
2. Navigate to Explore (landing page)
3. Follow buttons should not appear
4. Try accessing /explore authenticated
5. Follow buttons should appear

### Part 3: Backend State Synchronization

#### Test 3.1: Follow Count Updates
1. User A's profile shows "Following: 0"
2. User A follows User B
3. User A's profile now shows "Following: 1"
4. Refresh page
5. Still shows "Following: 1"
6. User B's profile shows "Followers: +1"

#### Test 3.2: Multiple Users Following
1. User A follows User B (Follow count: 1)
2. User C follows User B
3. User B's follower count should be 2
4. Verify each user's state is independent

#### Test 3.3: Follow Status API Response
1. Open DevTools Network tab
2. Click Follow button
3. Watch requests:
   - POST /api/user/[username]/follow → 200 OK
   - GET /api/user/[username]/follow-status → 200 OK with `{"isFollowing": true}`
4. Click Unfollow:
   - POST /api/user/[username]/unfollow → 200 OK
   - GET /api/user/[username]/follow-status → 200 OK with `{"isFollowing": false}`

### Part 4: Error Handling

#### Test 4.1: Already Following Error
1. User A follows User B successfully
2. Somehow bypass frontend state (unlikely, but test the backend):
   ```bash
   curl -X POST http://localhost:8000/api/user/userB/follow \
     -H "Authorization: Bearer [token]"
   ```
3. Should return 400: "Already following this user"
4. Frontend state should sync to "Following"

#### Test 4.2: Invalid Token Error
1. Login with valid credentials
2. Manually corrupt token in localStorage:
   ```javascript
   localStorage.setItem("token", "invalid.token.here");
   location.reload();
   ```
3. App should clear auth state (isAuthenticated = false)
4. Follow buttons should not render
5. Protected pages should redirect

#### Test 4.3: Non-Existent User
1. Attempt to follow non-existent user via API:
   ```bash
   curl -X POST http://localhost:8000/api/user/nonexistent/follow \
     -H "Authorization: Bearer [token]"
   ```
2. Should return 404: "User not found"
3. Frontend should show error toast

#### Test 4.4: Self-Follow Prevention
1. Try to follow own account (shouldn't be possible via UI)
2. Backend should return 400: "Cannot follow yourself"
3. If you manage to call API, error should be handled

### Part 5: Cross-Page State Synchronization

#### Test 5.1: RightSidebar to Explore
1. Open Dashboard with RightSidebar visible
2. Follow User B from RightSidebar
3. Navigate to Explore page
4. Find same User B
5. Button should show "Following" (not "Follow")

#### Test 5.2: Profile to Account Tab
1. Navigate to User B's profile
2. Click Follow
3. Navigate to Account page → Following tab
4. User B should appear in the list
5. Click Unfollow from Account
6. Go back to User B's profile
7. Button should show "Follow" (not "Following")

#### Test 5.3: Explore to Account Following Tab
1. Open Explore page
2. Follow 3-4 users
3. Go to Account page → Following tab
4. All 4 users should appear in list
5. Click Unfollow on one
6. List updates immediately
7. Go back to Explore
8. That user should show "Follow" again

### Part 6: Performance & Loading States

#### Test 6.1: Rapid Click Prevention
1. Click Follow button rapidly (spam)
2. Button should only make ONE API call
3. After completion, button shows "Following"
4. Not multiple overlapping requests

#### Test 6.2: Loading Spinner Visibility
1. Add artificial network delay (DevTools Network → Slow 3G)
2. Click Follow button
3. Spinner should be visible for 2-3 seconds
4. Then button shows "Following"
5. No spinner flicker or loading issues

#### Test 6.3: Auth Check Loading State
1. Add artificial network delay (DevTools Network → Slow 3G)
2. Refresh page while authenticated
3. Should see loading spinner briefly
4. App loads after auth check completes

## Browser Console Monitoring

Throughout testing, monitor browser DevTools Console for these log patterns:

### Auth Logs
```
[AuthContext] Initializing - checking for persisted token
[AuthContext] Token found in localStorage, verifying with backend
[AuthContext] Token verified, user authenticated: testuser
[AuthContext] No token found, setting unauthenticated state
[AuthContext] Token verification failed with status 401, clearing auth state
```

### Follow Button Logs
```
[FollowButton] Checking follow status for targetuser
[FollowButton] Follow status response: {isFollowing: false, userId: 123}
[FollowButton] Attempting to follow targetuser
[FollowButton] API success for /user/targetuser/follow
[FollowButton] Refetching follow status from backend...
```

### Error Logs
```
[FollowButton] API error: 400 Already following this user
[FollowButton] No token found, setting isFollowing to false
[AuthContext] Failed to verify token: Network error
```

## PHP Error Log Monitoring

Watch `backend/error_log` for backend logs:

```
[FollowUser] User 1 attempting to follow targetuser
[FollowUser] Successfully followed: User 1 now follows 2
[UnfollowUser] User 1 attempting to unfollow targetuser
[UnfollowUser] Successfully unfollowed: User 1 unfollowed 2
[CheckFollowStatus] User 1 checking follow status for targetuser
[CheckFollowStatus] User 1 isFollowing 2: true
```

## Test Environment Setup

### Before Starting Tests
```bash
# 1. Clear all auth state
# In browser DevTools Console:
localStorage.clear();
sessionStorage.clear();

# 2. Restart PHP server
cd c:\Users\cjala\trendle\backend
php -S localhost:8000 router.php

# 3. Hard refresh frontend
# Press: Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (Mac)
```

### Database Reset (if needed)
```bash
cd c:\Users\cjala\trendle\backend
php migrate.php
```

## Success Criteria

✅ All tests pass when:
1. Follow button toggles correctly (Follow ↔ Following)
2. State persists after page refresh
3. Unauthenticated users cannot follow
4. Protected pages redirect to home
5. Follow counts update correctly
6. No console errors
7. Backend logs show correct operation flow
8. "Already following" error only appears for genuine duplicates

## Known Issues & Workarounds

### Fast Refresh Issue
- Vite Fast Refresh may not work after AuthContext changes
- Workaround: Hard refresh (Ctrl+Shift+R)

### localStorage Persistence
- Token persists in localStorage even after logout sometimes
- Clear with: `localStorage.removeItem("token")`

## Debugging Commands

### Browser Console
```javascript
// Check auth state
localStorage.getItem("token")

// Clear all auth
localStorage.clear()

// Check current URL
window.location.pathname

// Force logout
localStorage.removeItem("token"); location.reload();
```

### Network Tab (DevTools)
- Filter by "api" to see only API calls
- Sort by time to see request order
- Check Response tab for API return values

### PHP Error Log
```bash
# Watch error log in real-time
tail -f c:\Users\cjala\trendle\backend\error_log
# Or in PowerShell:
Get-Content c:\Users\cjala\trendle\backend\error_log -Wait
```

