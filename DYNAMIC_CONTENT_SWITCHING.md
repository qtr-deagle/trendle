# Dynamic Content Switching Implementation

## Overview
This implementation allows clicking on **Explore** or **Communities** in the sidebar to dynamically replace content in the main container without triggering a full route change or re-rendering the layout.

## Architecture

### Key Components

1. **ViewContext** (`src/contexts/ViewContext.tsx`)
   - Global state management for the active view
   - Provides `useViewContext()` hook to access and update the active view
   - Types: `home`, `explore`, `communities`, `inbox`, `account`, `settings`

2. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Wrapper component that conditionally renders the appropriate page based on the active view
   - Respects the ViewContext state to switch content without navigation

3. **Sidebar** (`src/components/layout/Sidebar.tsx`)
   - Enhanced with view switching logic
   - When `useViewSwitching={true}`, clicking "Explore" or "Communities" calls `viewContext.setView()` instead of navigating
   - Active view highlighting works with the context state

4. **MainLayout** (`src/components/layout/MainLayout.tsx`)
   - Accepts `useViewSwitching` prop to enable view switching in the Sidebar

5. **Page Components** (`Home`, `Explore`, `Communities`, `Inbox`, `Account`, `Settings`)
   - All updated to accept optional `useViewSwitching` prop
   - Pass prop to MainLayout to enable view switching

### Data Flow

```
User clicks "Explore" button
        ↓
Sidebar.handleNavClick() called
        ↓
viewContext.setView("explore")
        ↓
ViewContext state updates
        ↓
Dashboard re-renders with new activeView
        ↓
Dashboard renders <Explore /> component
        ↓
Only main content area updates (no full page reload)
```

## Usage

The feature is automatically enabled when using the Dashboard route. To access the dynamic switching:

1. Navigate to `/home` → Dashboard renders with view switching enabled
2. Click "Explore" or "Communities" → content swaps without route change
3. The sidebar active state updates to reflect the current view

## Technical Details

- **No Route Changes**: Clicking Explore/Communities doesn't trigger React Router navigation
- **Layout Persistence**: Sidebar and RightSidebar remain mounted and unchanged
- **Efficient Rendering**: Only the main content area re-renders
- **State Preservation**: Component states within each view are maintained across switches (though new instances are created on each switch)

## Routes

Dashboard is accessible via:
- `/home`
- `/explore`
- `/communities`
- `/inbox`
- `/account`
- `/settings`

All these routes render the same Dashboard component with ViewProvider, enabling dynamic switching within the dashboard.

## Future Enhancements

- Add transition animations between view changes
- Implement scroll position restoration
- Cache view states to prevent re-initialization
- Add history management for back/forward navigation
