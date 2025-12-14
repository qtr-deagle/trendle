# Follow Functionality Implementation Guide

## Overview
This document outlines the complete implementation of the follow functionality for authenticated users in the Trendle application.

## Features Implemented

### 1. **Backend Endpoints** (PHP)

#### Check Follow Status
- **Endpoint**: `GET /api/user/{username}/follow-status`
- **Requires**: Authentication token
- **Response**: 
  ```json
  {
    "isFollowing": boolean,
    "userId": number
  }
  ```
- **File**: [backend/src/Routes/UserRoutes.php](backend/src/Routes/UserRoutes.php)

#### Follow User
- **Endpoint**: `POST /api/user/{username}/follow`
- **Requires**: Authentication token
- **Response**: 
  ```json
  {
    "message": "Now following user"
  }
  ```
- **Features**:
  - Prevents self-following
  - Prevents duplicate follows
  - Updates follower/following counts
  - Persists data in database

#### Unfollow User
- **Endpoint**: `POST /api/user/{username}/unfollow`
- **Requires**: Authentication token
- **Response**: 
  ```json
  {
    "message": "Unfollowed user"
  }
  ```

#### Get Following List
- **Endpoint**: `GET /api/user/{username}/following`
- **Requires**: Authentication token
- **Response**: 
  ```json
  {
    "following": [
      {
        "id": number,
        "username": string,
        "display_name": string,
        "bio": string,
        "avatar_url": string,
        "followers": number,
        "following": number
      }
    ],
    "count": number
  }
  ```

### 2. **Frontend Components**

#### FollowButton Component
- **File**: [src/components/FollowButton.tsx](src/components/FollowButton.tsx)
- **Props**:
  - `targetUsername`: string (required) - Username to follow
  - `onFollowChange`: callback function
  - `disabled`: boolean
  - `showIcon`: boolean (default: true)
  - `className`: string
  - `size`: "sm" | "md" | "lg"
- **Features**:
  - Automatic follow status detection
  - Disabled for unauthenticated users
  - Prevents self-following
  - Loading states
  - Toast notifications
  - Reactive UI (Follow → Following)

#### Updated Components

**RightSidebar**
- [src/components/layout/RightSidebar.tsx](src/components/layout/RightSidebar.tsx)
- Now uses FollowButton for trending blogs
- Shows real follow state with visual feedback

**Profile Page**
- [src/pages/Profile.tsx](src/pages/Profile.tsx)
- Integrated FollowButton
- Dynamic username from URL params
- Follow button next to profile controls

**Account Page - Following Tab**
- [src/pages/Account.tsx](src/pages/Account.tsx)
- Working unfollow functionality
- Lists all users being followed
- Remove from list on unfollow
- Toast notifications

### 3. **Database**
The `follows` table already exists with:
- `follower_id` (Foreign key to users)
- `following_id` (Foreign key to users)
- `created_at` timestamp
- Unique constraint on (follower_id, following_id) to prevent duplicates

## How It Works

### Follow Flow
1. User clicks Follow button on another user's profile
2. FollowButton component sends POST request to `/api/user/{username}/follow`
3. Backend validates token and creates follow relationship
4. Backend increments both users' follower/following counts
5. UI updates to show "Following" state
6. Toast notification confirms action

### Unfollow Flow
1. User clicks "Following" button to unfollow
2. FollowButton component sends POST request to `/api/user/{username}/unfollow`
3. Backend removes follow relationship and updates counts
4. UI reverts to "Follow" state
5. In Following tab: user is removed from list immediately

### Follow Status Check
1. When FollowButton mounts, it checks current follow status
2. GET request to `/api/user/{username}/follow-status`
3. Returns isFollowing boolean
4. Sets initial button state accordingly

## Behavior Rules

✅ **Implemented:**
- Follow actions are disabled for unauthenticated users
  - FollowButton returns null if not authenticated
- Prevents duplicate follow entries
  - Database unique constraint
  - Backend validation
- Prevents self-following
  - Username comparison in FollowButton
  - Backend validation
- Follow state persists after refresh
  - Data stored in database
  - Follow status checked on component mount
- UI reflects follow state immediately
  - Loading state during request
  - State updates on success

## API Routes Registered

In [backend/src/Router.php](backend/src/Router.php):
```php
// Follow routes
POST /api/user/{username}/follow
POST /api/user/{username}/unfollow
GET /api/user/{username}/following
GET /api/user/{username}/follow-status
```

## Testing Follow Functionality

### Manual Testing Steps

1. **Create Two Test Accounts**
   - Register user1 and user2
   - Log in as user1

2. **Test Follow Button in RightSidebar**
   - Check that Follow button appears and changes to Following
   - Click Follow on one of the trending blogs
   - Verify state changes to Following
   - Click again to unfollow
   - Verify state changes back to Follow

3. **Test Profile Page Follow**
   - Navigate to another user's profile
   - Click Follow button
   - Verify it changes to Following
   - Refresh page
   - Verify state persists

4. **Test Following Tab in Account**
   - Go to Account page
   - Click Following tab
   - Should show the users you're following
   - Click unfollow button
   - User should be removed from list
   - Refresh page
   - User should still be gone (persisted)

5. **Test Guest Access**
   - Log out
   - Try to view profile
   - Follow button should not appear or be disabled
   - Try to view RightSidebar
   - Follow buttons should be disabled
   - Toast should show "Please log in to follow users"

6. **Test Self-Follow Prevention**
   - Go to your own profile (Account page)
   - Follow button should not appear

## Files Modified

### Backend
- [backend/src/Routes/UserRoutes.php](backend/src/Routes/UserRoutes.php) - Added checkFollowStatus()
- [backend/src/Router.php](backend/src/Router.php) - Added route for follow-status

### Frontend
- [src/components/FollowButton.tsx](src/components/FollowButton.tsx) - NEW component
- [src/components/layout/RightSidebar.tsx](src/components/layout/RightSidebar.tsx) - Integrated FollowButton
- [src/pages/Profile.tsx](src/pages/Profile.tsx) - Integrated FollowButton
- [src/pages/Account.tsx](src/pages/Account.tsx) - Added unfollow handler and improved Following tab

## Data Persistence

All follow data is persisted in the `follows` database table with:
- Automatic timestamps
- Foreign key constraints
- Cascading deletes
- Unique constraints to prevent duplicates

Follow counts are maintained in the `users` table:
- `followers` INT column
- `following` INT column

## Error Handling

✅ Comprehensive error handling with:
- 401 Unauthorized for missing/invalid tokens
- 404 Not Found for non-existent users
- 400 Bad Request for invalid operations
- Toast notifications for user feedback
- Console logging for debugging
- Fallback messages for unexpected errors

## Security

✅ Security measures in place:
- Token authentication required
- User validation on all operations
- SQL injection prevention (prepared statements)
- Self-follow prevention
- Duplicate follow prevention
- CORS/XSS considerations in API calls

## Performance Considerations

- Lazy loading of follow status (only when component mounts)
- Efficient database queries with proper indexing
- Minimal re-renders in React components
- Loading states prevent duplicate submissions
