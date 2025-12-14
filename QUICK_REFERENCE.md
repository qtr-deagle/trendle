# Quick Reference Card

## Essential Files at a Glance

### Authentication
- **AuthContext** (`src/contexts/AuthContext.tsx`) - Auth state & methods
- **useAuth hook** - Access auth state anywhere: `const { isAuthenticated, user, login, logout, signup } = useAuth()`

### Routing
- **App.tsx** - Routes, ProtectedRoute, LandingRoute
- **Protected routes:** `/dashboard/*` (require login)
- **Landing routes:** `/home`, `/explore`, `/communities` (guests only)

### Layouts
- **MainLayout** - For authenticated users (Sidebar + content)
- **LandingLayout** - For unauthenticated users (LandingSidebar + content)

### Pages
| Path | Component | Auth Required |
|------|-----------|---------------|
| `/home` | Landing | NO |
| `/explore` | LandingExplore | NO |
| `/communities` | LandingCommunities | NO |
| `/login` | Login | NO |
| `/signup` | Signup | NO |
| `/dashboard/home` | DashboardPage → Home | YES |
| `/dashboard/explore` | DashboardPage → Explore | YES |
| `/dashboard/communities` | DashboardPage → Communities | YES |
| `/dashboard/inbox` | DashboardPage → Inbox | YES |
| `/dashboard/account` | DashboardPage → Account | YES |
| `/dashboard/settings` | DashboardPage → Settings | YES |

## Common Code Snippets

### Check if User is Logged In
```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? `Hello ${user?.username}` : "Please login"}
    </div>
  );
}
```

### Perform Login
```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (email, password) => {
    await login(email, password);
    navigate("/dashboard/home");
  };
}
```

### Perform Logout
```typescript
import { useAuth } from "@/contexts/AuthContext";

function LogoutButton() {
  const { logout } = useAuth();
  
  return <button onClick={logout}>Log out</button>;
}
```

### Add Protected Route
```typescript
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/home" />;
  return children;
};

// In App.tsx routing:
<Route path="/secret" element={<ProtectedRoute><SecretPage /></ProtectedRoute>} />
```

### Switch Dashboard Views
```typescript
import { useViewContext } from "@/contexts/ViewContext";

function MyDashboard() {
  const { activeView, setView } = useViewContext();
  
  return (
    <button onClick={() => setView("explore")}>
      {activeView === "explore" && "✓"} Explore
    </button>
  );
}
```

## localStorage Keys

```javascript
// Check auth state in console:
localStorage.getItem("auth")      // "true" or null
localStorage.getItem("user")      // '{"id":"...","username":"...","email":"..."}'

// Clear all (logout manually):
localStorage.clear()
```

## Route Decision Tree

```
User visits URL
    ↓
Is /dashboard/* route?
    ├─ YES → Is isAuthenticated?
    │        ├─ YES → Show DashboardPage ✓
    │        └─ NO → Redirect to /home ✗
    └─ NO → Is /home|/explore|/communities?
             ├─ YES → Is isAuthenticated?
             │        ├─ YES → Redirect to /dashboard/home ✗
             │        └─ NO → Show Landing page ✓
             └─ NO → Public route → Show page ✓
```

## State Flow

```
App mounts
    ↓
AuthContext useEffect runs
    ↓
Check localStorage for auth & user
    ↓
If found:
  - setIsAuthenticated(true)
  - setUser(userData)
    ↓
    Routing component sees isAuthenticated
    ↓
    Shows MainLayout (authenticated)

If not found:
  - isAuthenticated stays false
  - user stays null
    ↓
    Routing component sees !isAuthenticated
    ↓
    Shows LandingLayout (unauthenticated)
```

## Event Flows

### Login Flow
```
1. User submits login form
2. Login.tsx calls useAuth().login(email, password)
3. AuthContext.login():
   - localStorage.setItem("auth", "true")
   - localStorage.setItem("user", JSON.stringify(user))
   - setIsAuthenticated(true)
   - setUser(user)
4. navigate("/dashboard/home")
5. App sees isAuthenticated = true
6. Shows DashboardPage with MainLayout
```

### Logout Flow
```
1. User clicks logout button
2. Sidebar calls props.onLogout()
3. DashboardPage passes useAuth().logout
4. AuthContext.logout():
   - localStorage.removeItem("auth")
   - localStorage.removeItem("user")
   - setIsAuthenticated(false)
   - setUser(null)
5. ProtectedRoute redirects to /home
6. App sees isAuthenticated = false
7. Shows Landing page with LandingSidebar
```

### View Switch Flow
```
1. User clicks sidebar button (e.g., Explore)
2. Sidebar.handleNavClick() called
3. viewContext.setView("explore")
4. ViewContext state updated
5. DashboardPage re-renders with activeView = "explore"
6. DashboardPage.renderContent() returns <Explore />
7. MainLayout wrapping still mounted (no flashing)
8. URL never changes (check address bar)
```

## Debugging Commands

```javascript
// Check auth state
const auth = localStorage.getItem('auth');
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('Auth:', auth, 'User:', user);

// Force logout
localStorage.clear();
location.reload();

// Check active view
// (Need to add debug to ViewContext if needed)

// Check route
console.log('Current path:', window.location.pathname);

// Simulate API call
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

## Before Deployment Checklist

- [ ] Test login/signup/logout flows
- [ ] Test protected routes (try accessing /dashboard/* without auth)
- [ ] Test landing routes (try accessing /home while logged in)
- [ ] Verify localStorage persists on refresh
- [ ] Check view switching doesn't change URL
- [ ] Verify sidebar shows correct items based on auth
- [ ] Test back/forward browser buttons
- [ ] Clear localStorage and test fresh flow
- [ ] Check console for errors
- [ ] Verify no network requests during view switches
- [ ] Test Create button links
- [ ] Test all sidebar navigation items

## Environment Setup

No additional environment variables needed for auth system (uses localStorage).

For backend integration, add to `.env`:
```
VITE_API_URL=https://your-api.com
VITE_AUTH_TOKEN_NAME=your_token_name
```

## Performance Tips

- AuthContext uses localStorage (instant checks, no network)
- ViewContext prevents layout remounts (smooth switching)
- Routes are evaluated on every render (acceptable cost)
- Consider adding loading states for real API calls
- Use React Query for API data caching

## Common Gotchas

❌ **Don't:** Store sensitive data in localStorage (can be stolen via XSS)
✅ **Do:** Use httpOnly cookies + JWT tokens for production

❌ **Don't:** Update route directly when you meant to switch views
✅ **Do:** Use viewContext.setView() for dashboard navigation

❌ **Don't:** Add new pages as top-level routes in dashboard
✅ **Do:** Add them in DashboardPage as cases in renderContent()

❌ **Don't:** Forget ProtectedRoute wrapper for authenticated pages
✅ **Do:** Always wrap protected pages in <ProtectedRoute>

❌ **Don't:** Use Link instead of navigation context in dashboard
✅ **Do:** Keep routing separate from view switching
