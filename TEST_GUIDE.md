# Quick Test Guide - Trendle Authentication

## Test Scenarios

### Scenario 1: Fresh User (No Auth)
**Steps:**
1. Open app → lands on `/` (Index page)
2. Click "Sign up" button → goes to `/signup`
3. See LandingSidebar on left with: Home, Explore, Communities, Log in, Register, Admin Login
4. Fill signup form and click "Next"
5. On `/onboarding`, select avatar and continue
6. Redirected to `/dashboard/home`
7. See MainLayout with full Sidebar (all 6 items + logout)
8. localStorage now has: `auth=true`, `user={...}`

### Scenario 2: Returning User
**Steps:**
1. User was logged in, closed browser
2. Open app again
3. AuthContext checks localStorage on mount
4. User still authenticated (state restored)
5. Can immediately see `/dashboard` routes

### Scenario 3: Logout & Re-Login
**Steps:**
1. Logged in, at `/dashboard/home`
2. Click "Log out" button in sidebar
3. Gets redirected to `/home` (Landing page)
4. localStorage cleared (`auth` and `user` deleted)
5. See LandingSidebar again
6. Click "Log in" in sidebar
7. Goes to `/login`
8. Fill form, click "Log in"
9. Redirected to `/dashboard/home`
10. Full navigation restored

### Scenario 4: Landing Page Navigation
**Steps:**
1. Not logged in
2. At `/home` (Landing component)
3. Click "Explore" in sidebar
4. URL changes to `/explore`
5. See LandingExplore component with categories
6. Click "Communities" in sidebar
7. URL changes to `/communities`
8. See LandingCommunities component with community grid
9. Each click changes the page (normal routing)

### Scenario 5: Dashboard Navigation (View Switching)
**Steps:**
1. Logged in at `/dashboard/home`
2. **Check URL bar** - should show `/dashboard/home`
3. Click "Explore" in sidebar
4. **Check URL bar** - still shows `/dashboard/home` ✓
5. Content changes to Explore component
6. Sidebar, header, right sidebar never flash or remount
7. Click "Communities"
8. **Check URL bar** - still shows `/dashboard/home` ✓
9. Click "Inbox"
10. **Check URL bar** - still shows `/dashboard/home` ✓
11. Click "Account"
12. **Check URL bar** - still shows `/dashboard/home` ✓
13. This is the key feature - smooth view switching without routing

### Scenario 6: Direct URL Navigation
**Steps:**
1. Logged in
2. Type `/dashboard/explore` in address bar, press Enter
3. Route changes, content updates to Explore
4. Click "Communities" in sidebar
5. URL still shows `/dashboard/explore` (or changes to `/dashboard/communities` - check implementation)
6. Click "Home"
7. URL updates if needed, Explore button becomes inactive

### Scenario 7: Protected Routes (Not Logged In)
**Steps:**
1. Not logged in
2. Type `/dashboard/home` in address bar
3. Gets redirected to `/home` (Landing page)
4. Type `/dashboard/inbox` in address bar
5. Gets redirected to `/home`
6. Cannot access protected routes without login

### Scenario 8: Landing Routes (Logged In)
**Steps:**
1. Logged in
2. Type `/home` in address bar
3. Gets redirected to `/dashboard/home`
4. Type `/explore` in address bar
5. Gets redirected to `/dashboard/home`
6. Cannot access landing pages when authenticated

## URL Mapping Reference

### While Logged OUT:
```
/          → Index (trending preview)
/login     → Login form
/signup    → Registration form
/home      → Landing page (home feed)
/explore   → LandingExplore (categories & tags)
/communities → LandingCommunities (community grid)
/admin     → Admin login
```

### While Logged IN:
```
/dashboard/home      → Home feed
/dashboard/explore   → Explore (view switch)
/dashboard/communities → Communities (view switch)
/dashboard/inbox     → Inbox
/dashboard/account   → Account/Profile
/dashboard/settings  → Settings
/onboarding         → Avatar selection (after signup)
/admin              → Admin login
```

## Browser DevTools Tips

### Check Authentication State
Open Console and run:
```javascript
console.log('Auth:', localStorage.getItem('auth'))
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'))
```

### Clear All Auth (Hard Logout)
```javascript
localStorage.clear()
location.reload()
```

### Monitor Route Changes
1. Open DevTools → Network tab
2. In Address bar, type a new URL
3. You'll see if page reloads or just navigates
4. Dashboard view switching should NOT show any network request

## Expected Behavior

### ✓ Correct Behavior
- [ ] Login redirects to `/dashboard/home`
- [ ] Logout clears localStorage and shows landing pages
- [ ] Dashboard navigation doesn't change URL
- [ ] Landing navigation does change URL
- [ ] Can't access `/dashboard/*` without login
- [ ] Can't access `/home` while logged in
- [ ] Refresh preserves auth state (localStorage)
- [ ] Sidebar changes based on auth status
- [ ] Create button goes to `/signup`
- [ ] Logo links to home page for current user type

### ✗ Unexpected Behavior
- [ ] URL changes when clicking dashboard sidebar items (it shouldn't)
- [ ] Landing pages accessible while logged in
- [ ] Dashboard pages accessible while logged out
- [ ] localStorage not persisting auth
- [ ] Sidebar showing wrong navigation items
- [ ] Layout remounting on view switches

## Files to Verify

After changes, these files should be consistent:

1. **App.tsx** - Routes and ProtectedRoute/LandingRoute logic
2. **AuthContext.tsx** - login/logout/signup methods
3. **Sidebar.tsx** - Uses `/dashboard/*` paths
4. **LandingSidebar.tsx** - Uses `/home`, `/explore`, `/communities`
5. **DashboardPage.tsx** - Calls `useAuth().logout`
6. **Login.tsx** - Calls `useAuth().login()`
7. **Signup.tsx** - Calls `useAuth().signup()`

## Common Issues & Fixes

### Issue: Dashboard routes not updating in Sidebar
**Fix:** Ensure Sidebar imports from updated paths (`/dashboard/*`)

### Issue: Landing routes not working
**Fix:** Check LandingSidebar paths point to `/home`, `/explore`, `/communities`

### Issue: Logout not clearing state
**Fix:** Verify `useAuth().logout` is being called and localStorage is cleared

### Issue: View switching changes URL
**Fix:** Check that DashboardPage uses ViewContext, not Link routing

### Issue: Auth state not persisting
**Fix:** Check localStorage in console, verify AuthContext useEffect runs on mount

## Performance Checklist

✓ Dashboard navigation should be instant (no loading spinners)
✓ View switching should be smooth (no flashing)
✓ Layout should never remount (sidebar stays in place)
✓ Logout should be instant
✓ No extra network requests for view switching
