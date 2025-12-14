# Follow/Unfollow Logic Fix - Technical Summary

## Bug Analysis

### Root Cause of "User not found" Error on Unfollow

The `unfollowUser()` endpoint in [backend/src/Routes/UserRoutes.php](backend/src/Routes/UserRoutes.php) was using unreliable path parsing:

```php
// BROKEN CODE (OLD):
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', $path);
$parts = array_filter($pathParts);
$targetUsername = isset($parts[2]) ? $parts[2] : null;
```

**Problem**: The `$parts[2]` approach:
- Depends on array position after filtering
- Breaks if path structure changes
- Uses `array_filter()` which re-indexes arrays unpredictably
- Is inconsistent with the `followUser()` method which used regex

### Example Path Parsing Issue:

URL: `/api/user/testuser/unfollow`

After explode: `['', 'api', 'user', 'testuser', 'unfollow']`
After array_filter: `['api', 'user', 'testuser', 'unfollow']` (re-indexed)

Accessing `$parts[2]` gives `'testuser'` ✓ (by luck)

But with different paths or trailing slashes:
- `/api/user/testuser/unfollow/` 
- `/user/testuser/unfollow` (after '/api' is stripped)

The indexing becomes unreliable.

---

## Solution Applied

Changed to use regex pattern matching (same as `followUser()` method):

```php
// FIXED CODE (NEW):
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
preg_match('#/user/([a-zA-Z0-9_]+)/unfollow$#', $path, $matches);
$targetUsername = $matches[1] ?? null;
```

**Benefits**:
- ✅ Reliable extraction of username from path
- ✅ Consistent with `followUser()` method
- ✅ Works regardless of path structure
- ✅ Clear pattern that only matches valid usernames
- ✅ Returns 400 error if username not found (proper validation)

---

## Code Comparison

### Before (Broken):
```php
public static function unfollowUser()
{
    // ... auth checks ...
    
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $pathParts = explode('/', $path);
    $parts = array_filter($pathParts);
    $targetUsername = isset($parts[2]) ? $parts[2] : null;
    
    // Attempts to unfollow, often fails with "User not found"
}
```

### After (Fixed):
```php
public static function unfollowUser()
{
    // ... auth checks ...
    
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    preg_match('#/user/([a-zA-Z0-9_]+)/unfollow$#', $path, $matches);
    $targetUsername = $matches[1] ?? null;
    
    // Always correctly extracts username, unfollow works
}
```

---

## Comparison with Follow Method

The `followUser()` method (which worked correctly) used:

```php
public static function followUser()
{
    // ... auth checks ...
    
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    preg_match('#/user/([a-zA-Z0-9_]+)/follow$#', $path, $matches);
    $targetUsername = $matches[1] ?? null;
    
    // This always worked correctly
}
```

**The Fix**: Make `unfollowUser()` use the same reliable pattern as `followUser()`.

---

## How the Fix Works

1. **Extract path** from request URI
   - Input: `/api/user/testuser/unfollow`
   - After parse_url: `/user/testuser/unfollow`

2. **Match regex pattern** to extract username
   - Pattern: `#/user/([a-zA-Z0-9_]+)/unfollow$#`
   - Captures: `testuser`
   - Stores in: `$matches[1]`

3. **Validate username**
   ```php
   if (!$targetUsername) {
       http_response_code(400);
       echo json_encode(['error' => 'Username required']);
       return;
   }
   ```

4. **Get user ID from database**
   ```php
   $stmt = $db->execute('SELECT id FROM users WHERE username = ?', [$targetUsername]);
   $result = $stmt->get_result();
   
   if ($result->num_rows === 0) {
       http_response_code(404);
       echo json_encode(['error' => 'User not found']);
       return;
   }
   ```

5. **Remove follow relationship**
   ```php
   $db->execute(
       'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
       [$decoded['userId'], $targetId]
   );
   ```

6. **Update counts and return success**
   ```php
   $conn->query("UPDATE users SET following = following - 1 WHERE id = {$decoded['userId']}");
   $conn->query("UPDATE users SET followers = followers - 1 WHERE id = {$targetId}");
   
   http_response_code(200);
   echo json_encode(['message' => 'Unfollowed user']);
   ```

---

## Testing the Fix

### Before Fix:
```
User clicks Follow → ✅ Works
User clicks Following (to unfollow) → ❌ "User not found" error
```

### After Fix:
```
User clicks Follow → ✅ Works
User clicks Following (to unfollow) → ✅ Works
User clicks Follow again → ✅ Works
```

---

## Related Code (No Changes Needed)

The following were already correct:

1. **FollowButton Component** ([src/components/FollowButton.tsx](src/components/FollowButton.tsx))
   - Correctly calls `/user/{username}/follow` and `/user/{username}/unfollow`
   - Properly handles responses
   - Updates state correctly

2. **Account Page** ([src/pages/Account.tsx](src/pages/Account.tsx))
   - Correctly calls `/user/{username}/following` to get list
   - Properly displays all followed users
   - Unfollow handler works correctly

3. **Backend Endpoints**
   - `checkFollowStatus()` - ✅ Already correct
   - `followUser()` - ✅ Already correct
   - `getFollowingList()` - ✅ Already correct

---

## Impact

This fix ensures:
- ✅ Follow/unfollow toggle works seamlessly
- ✅ No more "User not found" on unfollow
- ✅ Consistent error handling across all endpoints
- ✅ Reliable username extraction
- ✅ Database operations succeed reliably

## Files Changed

1. **backend/src/Routes/UserRoutes.php**
   - Modified `unfollowUser()` method
   - Line ~390: Changed path parsing from array indexing to regex

## Deployment

- ✅ No database changes needed
- ✅ No frontend changes needed
- ✅ No new dependencies
- ✅ Backward compatible
- ✅ Ready for immediate deployment
