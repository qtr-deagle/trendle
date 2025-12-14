<?php

namespace App\Routes;

use App\Config\Database;
use App\Middleware\Auth;

class UserRoutes
{

    public static function updateAvatar()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        if (!isset($_FILES['avatar'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            return;
        }

        $file = $_FILES['avatar'];

        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'Upload error: ' . $file['error']]);
            return;
        }

        // Check MIME type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only images are allowed']);
            return;
        }

        // Check file size (5MB max)
        if ($file['size'] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds 5MB limit']);
            return;
        }

        try {
            // Create uploads directory if it doesn't exist
            $uploadsDir = __DIR__ . '/../../uploads/avatars';
            if (!is_dir($uploadsDir)) {
                mkdir($uploadsDir, 0755, true);
            }

            // Generate unique filename
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'avatar_' . $decoded['userId'] . '_' . time() . '.' . $ext;
            $filepath = $uploadsDir . '/' . $filename;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                throw new \Exception('Failed to save file');
            }

            // Save avatar URL to database
            $db = Database::getInstance();
            $avatarUrl = '/api/uploads/avatars/' . $filename;

            $stmt = $db->execute(
                'UPDATE users SET avatar_url = ? WHERE id = ?',
                [$avatarUrl, $decoded['userId']]
            );

            http_response_code(200);
            echo json_encode([
                'message' => 'Avatar updated successfully',
                'avatar_url' => $avatarUrl
            ]);
        } catch (\Exception $e) {
            error_log('Avatar upload error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update avatar: ' . $e->getMessage()]);
        }
    }

    public static function updateProfile()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $db = Database::getInstance();

            $updates = [];
            $params = [];

            if (isset($data['avatar_url'])) {
                $updates[] = 'avatar_url = ?';
                $params[] = $data['avatar_url'];
            }

            if (isset($data['display_name'])) {
                $updates[] = 'display_name = ?';
                $params[] = $data['display_name'];
            }

            if (isset($data['bio'])) {
                $updates[] = 'bio = ?';
                $params[] = $data['bio'];
            }

            if (isset($data['interests'])) {
                // Convert array to comma-separated string
                $interestsStr = is_array($data['interests'])
                    ? implode(', ', $data['interests'])
                    : $data['interests'];
                $updates[] = 'interests = ?';
                $params[] = $interestsStr;
            }

            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                return;
            }

            $params[] = $decoded['userId'];
            $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';

            $db->execute($sql, $params);

            // Fetch and return the updated user profile
            $stmt = $db->execute(
                'SELECT id, username, email, display_name, bio, avatar_url, interests, followers, following FROM users WHERE id = ?',
                [$decoded['userId']]
            );

            $result = $stmt->get_result();
            $updatedUser = $result->fetch_assoc();

            // Parse interests if they exist
            if ($updatedUser['interests']) {
                $updatedUser['interests'] = array_map('trim', explode(',', $updatedUser['interests']));
            } else {
                $updatedUser['interests'] = [];
            }

            http_response_code(200);
            echo json_encode([
                'message' => 'Profile updated successfully',
                'user' => $updatedUser
            ]);
        } catch (\Exception $e) {
            error_log('Update profile error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update profile']);
        }
    }

    public static function getCurrentUserProfile()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT id, username, display_name, bio, avatar_url, interests, followers, following, created_at FROM users WHERE id = ? LIMIT 1',
                [$decoded['userId']]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                return;
            }

            $user = $result->fetch_assoc();

            // Parse interests if they exist
            if ($user['interests']) {
                $user['interests'] = array_map('trim', explode(',', $user['interests']));
            } else {
                $user['interests'] = [];
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            error_log('Get current user profile error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch profile']);
        }
    }

    public static function getProfile()
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // Extract username from path like /api/user/profile/username
        preg_match('#/profile/([a-zA-Z0-9_]+)$#', $path, $matches);
        $username = $matches[1] ?? null;

        if (!$username) {
            http_response_code(400);
            echo json_encode(['error' => 'Username required']);
            return;
        }

        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT id, username, display_name, bio, avatar_url, interests, followers, following, created_at FROM users WHERE username = ? LIMIT 1',
                [$username]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                return;
            }

            $user = $result->fetch_assoc();

            // Parse interests if they exist
            if ($user['interests']) {
                $user['interests'] = array_map('trim', explode(',', $user['interests']));
            } else {
                $user['interests'] = [];
            }

            http_response_code(200);
            echo json_encode(['user' => $user]);
        } catch (\Exception $e) {
            error_log('Get profile error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch profile']);
        }
    }

    public static function followUser()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/user/([a-zA-Z0-9_]+)/follow$#', $path, $matches);
        $targetUsername = $matches[1] ?? null;

        if (!$targetUsername) {
            http_response_code(400);
            echo json_encode(['error' => 'Username required']);
            return;
        }

<<<<<<< HEAD
=======
        error_log("[FollowUser] User {$decoded['userId']} attempting to follow {$targetUsername}");

>>>>>>> 86d481d (Finalized Project)
        try {
            $db = Database::getInstance();
            $conn = $db->getConnection();

            // Get target user ID
            $stmt = $db->execute('SELECT id FROM users WHERE username = ?', [$targetUsername]);
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                return;
            }

            $targetUser = $result->fetch_assoc();
            $targetId = $targetUser['id'];

            if ($targetId == $decoded['userId']) {
                http_response_code(400);
                echo json_encode(['error' => 'Cannot follow yourself']);
                return;
            }

            // Check if already following
            $checkStmt = $db->execute(
                'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
                [$decoded['userId'], $targetId]
            );
            $checkResult = $checkStmt->get_result();

            if ($checkResult->num_rows > 0) {
<<<<<<< HEAD
=======
                error_log("[FollowUser] User {$decoded['userId']} is already following {$targetId}");
>>>>>>> 86d481d (Finalized Project)
                http_response_code(400);
                echo json_encode(['error' => 'Already following this user']);
                return;
            }

            // Add follow relationship
            $db->execute(
                'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
                [$decoded['userId'], $targetId]
            );

            // Update follower counts
            $conn->query("UPDATE users SET following = following + 1 WHERE id = {$decoded['userId']}");
            $conn->query("UPDATE users SET followers = followers + 1 WHERE id = {$targetId}");

<<<<<<< HEAD
=======
            error_log("[FollowUser] Successfully followed: User {$decoded['userId']} now follows {$targetId}");
>>>>>>> 86d481d (Finalized Project)
            http_response_code(200);
            echo json_encode(['message' => 'Now following user']);
        } catch (\Exception $e) {
            error_log('Follow user error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to follow user']);
        }
    }

    public static function unfollowUser()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
<<<<<<< HEAD
        $pathParts = explode('/', $path);
        $parts = array_filter($pathParts);
        $targetUsername = isset($parts[2]) ? $parts[2] : null;
=======
        preg_match('#/user/([a-zA-Z0-9_]+)/unfollow$#', $path, $matches);
        $targetUsername = $matches[1] ?? null;
>>>>>>> 86d481d (Finalized Project)

        if (!$targetUsername) {
            http_response_code(400);
            echo json_encode(['error' => 'Username required']);
            return;
        }

<<<<<<< HEAD
=======
        error_log("[UnfollowUser] User {$decoded['userId']} attempting to unfollow {$targetUsername}");

>>>>>>> 86d481d (Finalized Project)
        try {
            $db = Database::getInstance();
            $conn = $db->getConnection();

            // Get target user ID
            $stmt = $db->execute('SELECT id FROM users WHERE username = ?', [$targetUsername]);
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                return;
            }

            $targetUser = $result->fetch_assoc();
            $targetId = $targetUser['id'];

            // Remove follow relationship
            $db->execute(
                'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
                [$decoded['userId'], $targetId]
            );

            // Update follower counts
            $conn->query("UPDATE users SET following = following - 1 WHERE id = {$decoded['userId']}");
            $conn->query("UPDATE users SET followers = followers - 1 WHERE id = {$targetId}");

<<<<<<< HEAD
=======
            error_log("[UnfollowUser] Successfully unfollowed: User {$decoded['userId']} unfollowed {$targetId}");
>>>>>>> 86d481d (Finalized Project)
            http_response_code(200);
            echo json_encode(['message' => 'Unfollowed user']);
        } catch (\Exception $e) {
            error_log('Unfollow user error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to unfollow user']);
        }
    }

    public static function getFollowingList()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

<<<<<<< HEAD
=======
        error_log("[GetFollowingList] User {$decoded['userId']} requesting their following list");

>>>>>>> 86d481d (Finalized Project)
        try {
            $db = Database::getInstance();

            // Get the list of users that the authenticated user is following
            $stmt = $db->execute(
                'SELECT u.id, u.username, u.display_name, u.bio, u.avatar_url, u.followers, u.following
                 FROM users u
                 JOIN follows f ON u.id = f.following_id
                 WHERE f.follower_id = ?
                 ORDER BY f.created_at DESC',
                [$decoded['userId']]
            );

            $result = $stmt->get_result();
            $following = [];

            while ($row = $result->fetch_assoc()) {
                $following[] = [
                    'id' => $row['id'],
                    'username' => $row['username'],
                    'display_name' => $row['display_name'],
                    'bio' => $row['bio'],
                    'avatar_url' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}",
                    'followers' => $row['followers'],
                    'following' => $row['following']
                ];
            }

<<<<<<< HEAD
=======
            error_log("[GetFollowingList] User {$decoded['userId']} is following " . count($following) . " users");
            
>>>>>>> 86d481d (Finalized Project)
            http_response_code(200);
            echo json_encode([
                'following' => $following,
                'count' => count($following)
            ]);
        } catch (\Exception $e) {
            error_log('Get following list error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch following list']);
        }
    }

    public static function serveUploadedFile()
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = str_replace('/api/uploads/', '', $path);

        $filePath = __DIR__ . '/../../uploads/' . $path;

        if (!file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(['error' => 'File not found']);
            return;
        }

        // Prevent directory traversal
        if (realpath($filePath) === false || strpos(realpath($filePath), realpath(__DIR__ . '/../../uploads/')) !== 0) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }

        // Serve file
        $mimeType = mime_content_type($filePath);
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
    }

<<<<<<< HEAD
=======
    /**
     * Get all unique interests from users in the system
     */
    public static function getInterests()
    {
        try {
            $db = Database::getInstance();

            // Get all interests from users
            $stmt = $db->execute(
                'SELECT interests FROM users WHERE interests IS NOT NULL AND interests != "" AND LENGTH(interests) > 0'
            );

            $result = $stmt->get_result();
            $allInterests = [];

            // Extract and parse all interests
            while ($row = $result->fetch_assoc()) {
                $interests = $row['interests'];
                if (!empty($interests)) {
                    // Split by comma and trim each interest
                    $userInterests = array_map('trim', explode(',', $interests));
                    // Add each interest to our collection if not already present
                    foreach ($userInterests as $interest) {
                        if (!empty($interest) && !in_array($interest, $allInterests)) {
                            $allInterests[] = $interest;
                        }
                    }
                }
            }

            // Sort interests alphabetically
            sort($allInterests);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'interests' => $allInterests,
                'count' => count($allInterests)
            ]);
        } catch (\Exception $e) {
            error_log('Get interests error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch interests']);
        }
    }

>>>>>>> 86d481d (Finalized Project)
    // ========== POST ENDPOINTS ==========

    public static function getFeedPosts()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $limit = (int)($_GET['limit'] ?? 20);
        $offset = (int)($_GET['offset'] ?? 0);

        $result = \App\Services\UserPostService::getFeedPosts($decoded['userId'], $limit, $offset);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

<<<<<<< HEAD
=======
    public static function getAllPosts()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);

        $result = \App\Services\UserPostService::getAllPosts($limit, $offset, $decoded['userId']);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getFollowingPosts()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);

        $result = \App\Services\UserPostService::getFollowingPosts($decoded['userId'], $limit, $offset);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

>>>>>>> 86d481d (Finalized Project)
    public static function getUserPosts()
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/user/([a-zA-Z0-9_]+)/posts$#', $path, $matches);
        $username = $matches[1] ?? null;

        if (!$username) {
            http_response_code(400);
            echo json_encode(['error' => 'Username required']);
            return;
        }

        $limit = (int)($_GET['limit'] ?? 20);
        $offset = (int)($_GET['offset'] ?? 0);

        $result = \App\Services\UserPostService::getUserPosts($username, $limit, $offset);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getPostDetail()
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/post/(\d+)$#', $path, $matches);
        $postId = $matches[1] ?? null;

        if (!$postId) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID required']);
            return;
        }

        $token = Auth::getToken();
        $userId = null;

        if ($token) {
            $decoded = Auth::verifyToken($token);
            if ($decoded) {
                $userId = $decoded['userId'];
            }
        }

        $result = \App\Services\UserPostService::getPostDetail($postId, $userId);

        http_response_code($result['success'] ? 200 : 404);
        echo json_encode($result);
    }

    public static function createPost()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $result = \App\Services\UserPostService::createPost(
            $decoded['userId'],
            $data['content'] ?? null,
<<<<<<< HEAD
            $data['image_url'] ?? null
=======
            $data['image_url'] ?? null,
            $data['tags'] ?? []
>>>>>>> 86d481d (Finalized Project)
        );

        http_response_code($result['success'] ? 201 : 400);
        echo json_encode($result);
    }

    public static function likePost()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/post/(\d+)/like$#', $path, $matches);
        $postId = $matches[1] ?? null;

        if (!$postId) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID required']);
            return;
        }

        $result = \App\Services\UserPostService::likePost($decoded['userId'], $postId);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function unlikePost()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/post/(\d+)/unlike$#', $path, $matches);
        $postId = $matches[1] ?? null;

        if (!$postId) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID required']);
            return;
        }

        $result = \App\Services\UserPostService::unlikePost($decoded['userId'], $postId);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    // ========== COMMUNITY ENDPOINTS ==========

<<<<<<< HEAD
=======
    public static function createCommunity()
    {
        $token = Auth::getToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? null;
        $description = $input['description'] ?? null;
        $avatarUrl = $input['avatarUrl'] ?? null;

        $result = \App\Services\CommunityService::createCommunity($name, $description, $avatarUrl);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

>>>>>>> 86d481d (Finalized Project)
    public static function getAllCommunities()
    {
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = (int)($_GET['offset'] ?? 0);

        $result = \App\Services\CommunityService::getAllCommunities($limit, $offset);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getUserCommunities()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $result = \App\Services\CommunityService::getUserCommunities($decoded['userId']);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getCommunityDetail()
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/community/(\d+)$#', $path, $matches);
        $communityId = $matches[1] ?? null;

        if (!$communityId) {
            http_response_code(400);
            echo json_encode(['error' => 'Community ID required']);
            return;
        }

        $token = Auth::getToken();
        $userId = null;

        if ($token) {
            $decoded = Auth::verifyToken($token);
            if ($decoded) {
                $userId = $decoded['userId'];
            }
        }

        $result = \App\Services\CommunityService::getCommunityDetail($communityId, $userId);

        http_response_code($result['success'] ? 200 : 404);
        echo json_encode($result);
    }

    public static function joinCommunity()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/community/(\d+)/join$#', $path, $matches);
        $communityId = $matches[1] ?? null;

        if (!$communityId) {
            http_response_code(400);
            echo json_encode(['error' => 'Community ID required']);
            return;
        }

        $result = \App\Services\CommunityService::joinCommunity($decoded['userId'], $communityId);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function leaveCommunity()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/community/(\d+)/leave$#', $path, $matches);
        $communityId = $matches[1] ?? null;

        if (!$communityId) {
            http_response_code(400);
            echo json_encode(['error' => 'Community ID required']);
            return;
        }

        $result = \App\Services\CommunityService::leaveCommunity($decoded['userId'], $communityId);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function searchCommunities()
    {
        $query = $_GET['query'] ?? '';
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = (int)($_GET['offset'] ?? 0);

        if (empty($query)) {
            http_response_code(400);
            echo json_encode(['error' => 'Query required']);
            return;
        }

        $result = \App\Services\CommunityService::searchCommunities($query, $limit, $offset);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    // ========== MESSAGE ENDPOINTS ==========

    public static function getConversations()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $result = \App\Services\MessageService::getConversations($decoded['userId']);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getFollowersForMessaging()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $result = \App\Services\MessageService::getFollowersForMessaging($decoded['userId']);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getConversation()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/message/conversation/(\d+)$#', $path, $matches);
        $otherUserId = $matches[1] ?? null;

        if (!$otherUserId) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            return;
        }

        $result = \App\Services\MessageService::getConversation($decoded['userId'], $otherUserId);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function sendMessage()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['recipient_id']) || !isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Recipient ID and content required']);
            return;
        }

        $result = \App\Services\MessageService::sendMessage(
            $decoded['userId'],
            $data['recipient_id'],
            $data['content']
        );

        http_response_code($result['success'] ? 201 : 400);
        echo json_encode($result);
    }

    public static function getUnreadMessageCount()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $result = \App\Services\MessageService::getUnreadCount($decoded['userId']);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    // ========== EXPLORE ENDPOINTS ==========

    public static function getTrendingHashtags()
    {
        $limit = (int)($_GET['limit'] ?? 10);

        $result = \App\Services\ExploreService::getTrendingHashtags($limit);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getTrendingCategories()
    {
        $limit = (int)($_GET['limit'] ?? 10);

        $result = \App\Services\ExploreService::getTrendingCategories($limit);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function globalSearch()
    {
        $query = $_GET['query'] ?? '';
        $type = $_GET['type'] ?? 'all';
        $limit = (int)($_GET['limit'] ?? 20);

        if (empty($query)) {
            http_response_code(400);
            echo json_encode(['error' => 'Query required']);
            return;
        }

        $result = \App\Services\ExploreService::globalSearch($query, $type, $limit);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getPostsByHashtag()
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/tag/([a-zA-Z0-9_\-]+)/posts$#', $path, $matches);
        $tagSlug = $matches[1] ?? null;

        if (!$tagSlug) {
            http_response_code(400);
            echo json_encode(['error' => 'Tag slug required']);
            return;
        }

        $limit = (int)($_GET['limit'] ?? 20);
        $offset = (int)($_GET['offset'] ?? 0);

        $result = \App\Services\ExploreService::getPostsByHashtag($tagSlug, $limit, $offset);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getRecommendedUsers()
    {
<<<<<<< HEAD
        $limit = (int)($_GET['limit'] ?? 10);

        $result = \App\Services\ExploreService::getRecommendedUsers($limit);
=======
        $token = Auth::getToken();
        $currentUserId = null;

        // If user is authenticated, get their ID to exclude them from recommendations
        if ($token) {
            $decoded = Auth::verifyToken($token);
            if ($decoded) {
                $currentUserId = $decoded['userId'];
            }
        }

        $limit = (int)($_GET['limit'] ?? 10);

        $result = \App\Services\ExploreService::getRecommendedUsers($limit, $currentUserId);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function getPostsByTags()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);

        $result = \App\Services\UserPostService::getPostsByTagsWithFollowers($decoded['userId'], $limit, $offset);
>>>>>>> 86d481d (Finalized Project)

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    // ========== SETTINGS ENDPOINTS ==========

    public static function getUserSettings()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $result = \App\Services\SettingsService::getUserSettings($decoded['userId']);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function updateUserSettings()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $result = \App\Services\SettingsService::updateUserSettings($decoded['userId'], $data);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    public static function updateAccountSettings()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $result = \App\Services\SettingsService::updateAccountSettings($decoded['userId'], $data);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    /**
     * Delete a post (only the owner can delete)
     */
    public static function deletePost()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['post_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID is required']);
            return;
        }

        $postId = $data['post_id'];

        try {
            $db = Database::getInstance();

            // Verify ownership
            $stmt = $db->execute(
                'SELECT id, user_id, image_url FROM posts WHERE id = ?',
                [$postId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Post not found']);
                return;
            }

            $post = $result->fetch_assoc();

            if ($post['user_id'] != $decoded['userId']) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized to delete this post']);
                return;
            }

            // Delete associated data (cascade handled by foreign keys, but delete image manually)
            if ($post['image_url']) {
                $imagePath = __DIR__ . '/../../uploads/posts/' . basename($post['image_url']);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }

            // Delete the post
            $stmt = $db->execute(
                'DELETE FROM posts WHERE id = ? AND user_id = ?',
                [$postId, $decoded['userId']]
            );

            http_response_code(200);
            echo json_encode(['message' => 'Post deleted successfully']);
        } catch (\Exception $e) {
            error_log('Delete post error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete post']);
        }
    }

    /**
     * Search for users by username or display name
     */
    public static function searchUsers()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $query = $_GET['q'] ?? '';
        if (strlen($query) < 2) {
            http_response_code(400);
            echo json_encode(['error' => 'Query must be at least 2 characters']);
            return;
        }

        try {
            $db = Database::getInstance();

            $searchTerm = '%' . $query . '%';
            $stmt = $db->execute(
                'SELECT id, username, display_name, avatar_url, bio, followers, following 
                 FROM users 
                 WHERE username LIKE ? OR display_name LIKE ?
                 AND id != ?
                 LIMIT 20',
                [$searchTerm, $searchTerm, $decoded['userId']]
            );

            $result = $stmt->get_result();
            $users = [];

            while ($row = $result->fetch_assoc()) {
                // Check if current user follows this user
                $followCheck = $db->execute(
                    'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
                    [$decoded['userId'], $row['id']]
                );

                $isFollowing = $followCheck->get_result()->num_rows > 0;

                $users[] = [
                    'id' => $row['id'],
                    'username' => $row['username'],
                    'display_name' => $row['display_name'],
                    'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}",
                    'bio' => $row['bio'],
                    'followers' => intval($row['followers']),
                    'following' => intval($row['following']),
                    'isFollowing' => $isFollowing
                ];
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'users' => $users,
                'count' => count($users)
            ]);
        } catch (\Exception $e) {
            error_log('Search users error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to search users']);
        }
    }

    /**
     * Get messages with a specific user
     */
    public static function getMessages()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $userId = $_GET['user_id'] ?? null;
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            return;
        }

        $result = \App\Services\MessageService::getMessages($decoded['userId'], $userId);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }

    /**
     * Mark messages as read
     */
    public static function markMessagesAsRead()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['sender_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Sender ID is required']);
            return;
        }

        $result = \App\Services\MessageService::markAsRead($decoded['userId'], $data['sender_id']);

        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
    }
<<<<<<< HEAD
=======

    /**
     * Check if current user is following a specific user
     */
    public static function checkFollowStatus()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/user/([a-zA-Z0-9_]+)/follow-status$#', $path, $matches);
        $targetUsername = $matches[1] ?? null;

        if (!$targetUsername) {
            http_response_code(400);
            echo json_encode(['error' => 'Username required']);
            return;
        }

        error_log("[CheckFollowStatus] User {$decoded['userId']} checking follow status for {$targetUsername}");

        try {
            $db = Database::getInstance();

            // Get target user ID
            $stmt = $db->execute('SELECT id FROM users WHERE username = ?', [$targetUsername]);
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                error_log("[CheckFollowStatus] Target user '{$targetUsername}' not found");
                http_response_code(404);
                echo json_encode(['error' => 'User not found', 'username' => $targetUsername]);
                return;
            }

            $targetUser = $result->fetch_assoc();
            $targetId = $targetUser['id'];

            // Check if already following
            $checkStmt = $db->execute(
                'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
                [$decoded['userId'], $targetId]
            );
            $checkResult = $checkStmt->get_result();

            $isFollowing = $checkResult->num_rows > 0;

            error_log("[CheckFollowStatus] User {$decoded['userId']} isFollowing {$targetId} ({$targetUsername}): " . ($isFollowing ? 'true' : 'false'));
            http_response_code(200);
            echo json_encode([
                'isFollowing' => $isFollowing,
                'userId' => $targetId,
                'username' => $targetUsername
            ]);
        } catch (\Exception $e) {
            error_log('Check follow status error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to check follow status']);
        }
    }

    public static function addComment()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        // Get post ID from URL
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('#/post/(\d+)/comment$#', $path, $matches);
        $postId = $matches[1] ?? null;

        if (!$postId) {
            http_response_code(400);
            echo json_encode(['error' => 'Post ID required']);
            return;
        }

        // Get request body
        $body = json_decode(file_get_contents('php://input'), true);
        $content = trim($body['content'] ?? '');

        if (empty($content)) {
            http_response_code(400);
            echo json_encode(['error' => 'Comment content required']);
            return;
        }

        try {
            $db = \App\Config\Database::getInstance();

            // Verify post exists
            $postStmt = $db->execute('SELECT id FROM posts WHERE id = ?', [$postId]);
            $postResult = $postStmt->get_result();

            if ($postResult->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Post not found']);
                return;
            }

            // Insert comment
            $insertStmt = $db->execute(
                'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
                [$postId, $decoded['userId'], $content]
            );

            if ($insertStmt) {
                $commentId = $db->getConnection()->insert_id;

                // Get comment with user details
                $commentStmt = $db->execute(
                    'SELECT c.id, c.content, c.created_at, u.id as user_id, u.username, u.display_name, u.avatar_url 
                     FROM comments c 
                     JOIN users u ON c.user_id = u.id 
                     WHERE c.id = ?',
                    [$commentId]
                );
                $commentResult = $commentStmt->get_result();
                $row = $commentResult->fetch_assoc();

                // Format comment in the same structure as getPostDetail
                $comment = [
                    'id' => $row['id'],
                    'author' => [
                        'id' => $row['user_id'],
                        'username' => $row['username'],
                        'display_name' => $row['display_name'],
                        'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}"
                    ],
                    'content' => $row['content'],
                    'likes' => 0,
                    'createdAt' => $row['created_at']
                ];

                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'comment' => $comment
                ]);
            }
        } catch (\Exception $e) {
            error_log('Add comment error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add comment: ' . $e->getMessage()]);
        }
    }
>>>>>>> 86d481d (Finalized Project)
}
