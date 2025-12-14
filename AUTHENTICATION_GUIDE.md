# Authentication & Routing Guide - Trendle

## Overview

The application now supports two distinct user experiences:

1. **Unauthenticated Users** - See landing pages with limited navigation (Home, Explore, Communities) and auth buttons (Log in, Register, Admin Login)
2. **Authenticated Users** - See full dashboard with all features (Home, Explore, Communities, Inbox, Account, Settings)

## Architecture

### Context Providers

#### 1. AuthContext (`src/contexts/AuthContext.tsx`)
Manages global authentication state and provides authentication methods.

**State:**
- `isAuthenticated: boolean` - Whether user is logged in
- `user: { id, username, email } | null` - Current user info

**Methods:**
- `login(username: string, password: string)` - Authenticate user
- `logout()` - Clear authentication
- `signup(username: string, email: string, password: string)` - Create account

**Persistence:**
- Uses localStorage to persist auth state across page reloads
- Keys: `auth` (boolean flag), `user` (JSON object)

#### 2. ViewContext (`src/contexts/ViewContext.tsx`)
Manages the active view in the dashboard without changing routes.

**State:**
- `activeView: ViewType` - Current view (home | explore | communities | inbox | account | settings)

**Methods:**
- `setView(view: ViewType)` - Change the active view

## Routes

### Public Routes (No Auth Required)
```
/                  → Index page (trending content preview)
/login             → Login form
/signup            → Registration form
/admin             → Admin login portal
```

### Landing Routes (Unauthenticated Only)
When `isAuthenticated = false`, users can access:
```
/home              → Landing page with home feed
/explore           → LandingExplore - Discovery with categories & tags
/communities       → LandingCommunities - Browse communities
```

If authenticated, attempting these routes redirects to `/dashboard/home`

### Dashboard Routes (Authenticated Only)
When `isAuthenticated = true`, users access:
```
/dashboard/home     → Home feed with create post
/dashboard/explore  → Explore with view switching
/dashboard/communities → Communities with view switching
/dashboard/inbox    → Inbox & messaging
/dashboard/account  → User profile & stats
/dashboard/settings → User settings & preferences
```

If not authenticated, attempting these routes redirects to `/home`

### Protected Routes
```
/onboarding        → Avatar selection (after signup)
/profile/:username → User profile page
/communities/create → Create community form
/communities/:handle → Community detail page
```

## Component Structure

### Layouts

#### MainLayout (Authenticated)
- Shows full Sidebar with all 6 navigation items
- Includes logout button
- Uses Sidebar component

#### LandingLayout (Unauthenticated)
- Shows LandingSidebar with limited navigation
- Sidebar shows: Home, Explore, Communities + Auth section
- No logout functionality

### Sidebar Components

#### Sidebar (MainLayout)
- Items: Home, Explore, Communities, Inbox, Account, Settings
- All items use buttons for view switching (no page reload)
- Routes to: `/dashboard/home`, `/dashboard/explore`, etc.
- Includes logout button

#### LandingSidebar (LandingLayout)
- Items: Home, Explore, Communities
- Auth buttons: Log in, Register, Admin Login
- Routes to: `/home`, `/explore`, `/communities`, `/login`, `/signup`, `/admin`
- No logout functionality

## User Flows

### Login Flow
1. User visits `/login`
2. Enters credentials and submits form
3. `Login.tsx` calls `useAuth().login()`
4. `AuthContext.login()`:
   - Stores auth state in localStorage
   - Updates `isAuthenticated` to true
   - Sets user object
5. User redirected to `/dashboard/home`
6. `AppContent` renders DashboardPage (ProtectedRoute allows it)
7. MainLayout displays with full navigation

### Signup Flow
1. User visits `/signup`
2. Enters username, email, birthday
3. Agrees to terms
4. Submits form
5. `Signup.tsx` calls `useAuth().signup()`
6. `AuthContext.signup()`:
   - Stores auth state in localStorage
   - Updates `isAuthenticated` to true
   - Sets user object
7. User redirected to `/onboarding`
8. Selects avatar
9. After avatar selection, redirects to `/dashboard/home`

### Logout Flow
1. User clicks "Log out" button in sidebar
2. MainLayout calls `onLogout` callback
3. `DashboardPage` passes `useAuth().logout` as callback
4. `AuthContext.logout()`:
   - Clears localStorage
   - Sets `isAuthenticated` to false
   - Clears user object
5. App redirects to `/home` (ProtectedRoute component)
6. LandingLayout displays instead of MainLayout

### Landing Page Navigation (Unauthenticated)
1. User clicks "Home" in sidebar → `/home` → Landing component
2. User clicks "Explore" in sidebar → `/explore` → LandingExplore component
3. User clicks "Communities" in sidebar → `/communities` → LandingCommunities component
4. User clicks "Log in" → `/login`
5. User clicks "Register" → `/signup`
6. User clicks "Create" button → `/signup`

### Dashboard Navigation (Authenticated)
1. User clicks sidebar items
2. `Sidebar.handleNavClick()` calls `viewContext.setView()`
3. Route does NOT change (stays at `/dashboard/home` etc.)
4. DashboardPage renders different component based on `activeView`
5. MainLayout, Sidebar, and RightSidebar never remount
6. Only center content updates (smooth transitions)

## Key Features

### View Switching Without Route Changes
- Dashboard pages accept `useViewSwitching={true}` prop
- When true, they return just content (no MainLayout wrapper)
- DashboardPage wraps all content with MainLayout
- Clicking navbar buttons updates ViewContext, not routes
- This prevents layout thrashing and improves UX

### Protected Routes
- ProtectedRoute component wraps authenticated-only routes
- If `isAuthenticated = false`, redirects to `/home`
- If `isAuthenticated = true`, renders children normally

### Landing Routes
- LandingRoute component wraps unauthenticated-only routes
- If `isAuthenticated = true`, redirects to `/dashboard/home`
- If `isAuthenticated = false`, renders children normally

## State Persistence

### localStorage Keys
```javascript
localStorage.getItem("auth")  // "true" or null
localStorage.getItem("user")  // '{"id":"...","username":"...","email":"..."}'
```

### On App Load
1. AuthContext useEffect runs
2. Checks localStorage for "auth" and "user" keys
3. If both exist, restores authentication state
4. If either missing, user stays logged out
5. App renders appropriate layout based on `isAuthenticated`

## Examples

### Testing Login
```
1. Go to /login
2. Enter any email: test@example.com
3. Enter any password: anything
4. Click "Log in"
5. Should redirect to /dashboard/home
6. Sidebar changes to show logout button
7. Can see all 6 nav items
```

### Testing Logout
```
1. While logged in, click "Log out" in sidebar
2. Gets redirected to /home
3. Sidebar changes to show Login/Register/Admin Login
4. localStorage is cleared
5. Page reload keeps user logged out
```

### Testing Landing Pages
```
1. Go to /home (while logged out)
2. See Landing component with home feed
3. Click "Explore" in sidebar → /explore
4. See LandingExplore with categories & tags
5. Click "Communities" in sidebar → /communities
6. See LandingCommunities with community grid
7. All these stay logged out
```

### Testing Dashboard
```
1. Log in and go to /dashboard/home
2. Click "Explore" button in sidebar
3. URL stays at /dashboard/home (check address bar)
4. Content changes to Explore component
5. Sidebar, header, right sidebar never remount
6. Click "Inbox" - same behavior
7. This is view switching without routing
```

## TODO - Backend Integration

When connecting to a real backend:

1. **Update AuthContext.login():**
   ```typescript
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     body: JSON.stringify({ username, password })
   });
   const data = await response.json();
   // Store JWT token instead of just username
   localStorage.setItem('token', data.token);
   ```

2. **Update AuthContext.signup():**
   - Call `/api/auth/signup` endpoint
   - Similar token storage

3. **Update Protected Routes:**
   - Add token validation to ProtectedRoute
   - Verify token with backend if needed

4. **API Requests:**
   - Add Authorization header to all API calls
   - Format: `Authorization: Bearer ${localStorage.getItem('token')}`

5. **Token Refresh:**
   - Implement token refresh logic on 401 responses
   - Add useEffect in root App to check token validity

## Debugging

### Check Auth State
```javascript
// In browser console
localStorage.getItem('auth')
localStorage.getItem('user')
```

### Clear Auth (Hard Logout)
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### Debug Route Matching
- Open DevTools Network tab
- Watch URL bar while navigating
- Dashboard routes should NOT change URL when clicking sidebar items
- Landing routes SHOULD change URL (they're normal links)

## File Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx          # Auth state management
│   └── ViewContext.tsx          # Dashboard view state
├── pages/
│   ├── Login.tsx                # Login form
│   ├── Signup.tsx               # Registration form
│   ├── Landing.tsx              # Unauth home feed
│   ├── LandingExplore.tsx       # Unauth explore
│   ├── LandingCommunities.tsx   # Unauth communities
│   ├── DashboardPage.tsx        # Dashboard wrapper
│   ├── Home.tsx                 # Auth home feed
│   ├── Explore.tsx              # Auth explore
│   ├── Communities.tsx          # Auth communities
│   ├── Inbox.tsx                # Auth messaging
│   ├── Account.tsx              # Auth profile
│   └── Settings.tsx             # Auth settings
├── components/layout/
│   ├── MainLayout.tsx           # Auth layout (Sidebar + content)
│   ├── LandingLayout.tsx        # Unauth layout (LandingSidebar + content)
│   ├── Sidebar.tsx              # Auth navigation
│   └── LandingSidebar.tsx       # Unauth navigation
└── App.tsx                       # Main routing logic
```
