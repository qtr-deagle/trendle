`<?php

namespace App\Routes;

use App\Config\Database;
use App\Middleware\Auth;

class UserRoutes {
    
    public static function updateAvatar() {
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

    public static function updateProfile() {
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

            http_response_code(200);
            echo json_encode(['message' => 'Profile updated successfully']);
        } catch (\Exception $e) {
            error_log('Update profile error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update profile']);
        }
    }

    public static function getProfile() {
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

    public static function followUser() {
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

            http_response_code(200);
            echo json_encode(['message' => 'Now following user']);
        } catch (\Exception $e) {
            error_log('Follow user error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to follow user']);
        }
    }

    public static function unfollowUser() {
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
        $parts = explode('/', array_filter(explode('/', $path)));
        $targetUsername = $parts[count($parts) - 2] ?? null;

        if (!$targetUsername) {
            http_response_code(400);
            echo json_encode(['error' => 'Username required']);
            return;
        }

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

            http_response_code(200);
            echo json_encode(['message' => 'Unfollowed user']);
        } catch (\Exception $e) {
            error_log('Unfollow user error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to unfollow user']);
        }
    }

    public static function getFollowingList() {
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

    public static function serveUploadedFile() {
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
}
