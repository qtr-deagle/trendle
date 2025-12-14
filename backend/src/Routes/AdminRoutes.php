<?php

namespace App\Routes;

use App\Config\Database;
use App\Middleware\Auth;

class AdminRoutes {
    
    public static function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        try {
            $db = Database::getInstance();

            // Get admin user
            $stmt = $db->execute(
                'SELECT id, username, email, password, is_admin FROM users WHERE email = ? AND is_admin = 1',
                [$data['email']]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid admin credentials']);
                return;
            }

            $admin = $result->fetch_assoc();

            // Verify password
            if (!password_verify($data['password'], $admin['password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid admin credentials']);
                return;
            }

            $token = Auth::generateToken($admin['id']);

            http_response_code(200);
            echo json_encode([
                'token' => $token,
                'admin' => [
                    'id' => $admin['id'],
                    'username' => $admin['username'],
                    'email' => $admin['email'],
                    'is_admin' => (bool)$admin['is_admin']
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Admin login failed']);
        }
    }

    public static function verifyAdmin() {
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

            // Check if user is admin
            $stmt = $db->execute(
                'SELECT id, username, email, is_admin FROM users WHERE id = ? AND is_admin = 1',
                [$decoded['userId']]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                http_response_code(403);
                echo json_encode(['error' => 'Not an admin account']);
                return;
            }

            $admin = $result->fetch_assoc();

            http_response_code(200);
            echo json_encode(['admin' => $admin]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to verify admin']);
        }
    }

    public static function getDashboardMetrics() {
        if (!self::checkAdminAuth()) return;

        try {
            $db = Database::getInstance();
            $conn = $db->getConnection();

            // Get total users
            $users = $conn->query('SELECT COUNT(*) as count FROM users')->fetch_assoc();
            
            // Get total posts
            $posts = $conn->query('SELECT COUNT(*) as count FROM posts')->fetch_assoc();
            
            // Get total communities
            $communities = $conn->query('SELECT COUNT(*) as count FROM communities')->fetch_assoc();
            
            // Get active sessions (last 24 hours)
            $sessions = $conn->query('SELECT COUNT(*) as count FROM sessions WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)')->fetch_assoc();

            http_response_code(200);
            echo json_encode([
                'metrics' => [
                    'total_users' => (int)$users['count'],
                    'total_posts' => (int)$posts['count'],
                    'total_communities' => (int)$communities['count'],
                    'active_sessions_24h' => (int)$sessions['count']
                ]
            ]);
        } catch (\Exception $e) {
            error_log('Dashboard metrics error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch metrics']);
        }
    }

    public static function getAllUsers() {
        if (!self::checkAdminAuth()) return;

        $limit = $_GET['limit'] ?? 20;
        $offset = (($_GET['page'] ?? 1) - 1) * $limit;

        try {
            $db = Database::getInstance();

            // Get total count
            $countStmt = $db->execute('SELECT COUNT(*) as total FROM users');
            $countResult = $countStmt->get_result();
            $total = $countResult->fetch_assoc()['total'];

            // Get paginated users
            $stmt = $db->execute(
                'SELECT id, username, email, display_name, followers, following, is_admin, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [$limit, $offset]
            );

            $result = $stmt->get_result();
            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }

            http_response_code(200);
            echo json_encode([
                'users' => $users,
                'total' => (int)$total,
                'page' => (int)$_GET['page'] ?? 1
            ]);
        } catch (\Exception $e) {
            error_log('Get users error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch users']);
        }
    }

    public static function updateUserStatus() {
        if (!self::checkAdminAuth()) return;

        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $parts = explode('/', trim($path, '/'));
        $userId = end($parts);

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Status is required']);
            return;
        }

        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'UPDATE users SET is_admin = ? WHERE id = ?',
                [$data['status'] === 'admin' ? 1 : 0, $userId]
            );

            http_response_code(200);
            echo json_encode(['message' => 'User status updated']);
        } catch (\Exception $e) {
            error_log('Update user status error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update user status']);
        }
    }

    private static function checkAdminAuth() {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return false;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return false;
        }

        try {
            $db = Database::getInstance();
            $stmt = $db->execute(
                'SELECT is_admin FROM users WHERE id = ?',
                [$decoded['userId']]
            );

            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if (!$user || !$user['is_admin']) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized - admin access required']);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Authorization check failed']);
            return false;
        }
    }
}
