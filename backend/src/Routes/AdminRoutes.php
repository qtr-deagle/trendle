<?php

namespace App\Routes;

use App\Config\Database;
use App\Middleware\Auth;
use App\Services\AdminUserService;
use App\Services\AdminTagService;
use App\Services\AdminCategoryService;
use App\Services\AdminReportService;
use App\Services\AdminContactMessageService;
use App\Services\AdminLogService;

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
            error_log('Admin login error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Admin login failed: ' . $e->getMessage()]);
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

        try {
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $search = $_GET['search'] ?? '';
            $status = $_GET['status'] ?? 'all';

            $service = new AdminUserService();
            $result = $service->getAllUsers($page, $limit, $search, $status);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Get users error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch users']);
        }
    }

    public static function getUserDetail() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $userId = (int)end($parts);

            if (empty($userId)) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                return;
            }

            $service = new AdminUserService();
            $user = $service->getUserDetail($userId);

            http_response_code(200);
            echo json_encode(['user' => $user]);
        } catch (\Exception $e) {
            error_log('Get user detail error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch user detail']);
        }
    }

    public static function banUser() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $userId = (int)end($parts);
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($userId)) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                return;
            }

            $adminId = self::getAdminId();
            $reason = $data['reason'] ?? '';

            $service = new AdminUserService();
            $result = $service->banUser($userId, $adminId, $reason);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Ban user error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to ban user']);
        }
    }

    public static function activateUser() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $userId = (int)end($parts);

            if (empty($userId)) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                return;
            }

            $adminId = self::getAdminId();

            $service = new AdminUserService();
            $result = $service->activateUser($userId, $adminId);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Activate user error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to activate user']);
        }
    }

    public static function promoteToAdmin() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $userId = (int)end($parts);

            if (empty($userId)) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                return;
            }

            $adminId = self::getAdminId();

            $service = new AdminUserService();
            $result = $service->promoteToAdmin($userId, $adminId);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Promote user error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to promote user']);
        }
    }

    public static function demoteFromAdmin() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $userId = (int)end($parts);

            if (empty($userId)) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                return;
            }

            $adminId = self::getAdminId();

            $service = new AdminUserService();
            $result = $service->demoteFromAdmin($userId, $adminId);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Demote user error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to demote user']);
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

    // ========== TAG MANAGEMENT ==========
    public static function getAllTags() {
        if (!self::checkAdminAuth()) return;

        try {
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $search = $_GET['search'] ?? '';
            $filter = $_GET['filter'] ?? 'all';

            $service = new AdminTagService();
            $result = $service->getAllTags($page, $limit, $search, $filter);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Get tags error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch tags']);
        }
    }

    public static function createTag() {
        if (!self::checkAdminAuth()) return;

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Tag name is required']);
                return;
            }

            $adminId = self::getAdminId();
            $service = new AdminTagService();
            $tag = $service->createTag(
                $data['name'],
                $data['slug'] ?? '',
                $data['description'] ?? '',
                (bool)($data['is_nsfw'] ?? false),
                (bool)($data['is_active'] ?? true),
                $adminId
            );

            http_response_code(201);
            echo json_encode(['tag' => $tag]);
        } catch (\Exception $e) {
            error_log('Create tag error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function updateTag() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $tagId = (int)end($parts);

            if (empty($tagId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Tag ID is required']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $adminId = self::getAdminId();

            $service = new AdminTagService();
            $tag = $service->updateTag($tagId, $data, $adminId);

            http_response_code(200);
            echo json_encode(['tag' => $tag]);
        } catch (\Exception $e) {
            error_log('Update tag error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function deleteTag() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $tagId = (int)end($parts);

            if (empty($tagId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Tag ID is required']);
                return;
            }

            $adminId = self::getAdminId();
            $service = new AdminTagService();
            $result = $service->deleteTag($tagId, $adminId);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Delete tag error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete tag']);
        }
    }

    // ========== CATEGORY MANAGEMENT ==========
    public static function getAllCategories() {
        if (!self::checkAdminAuth()) return;

        try {
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $search = $_GET['search'] ?? '';
            $filter = $_GET['filter'] ?? 'all';

            $service = new AdminCategoryService();
            $result = $service->getAllCategories($page, $limit, $search, $filter);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Get categories error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch categories']);
        }
    }

    public static function getCategoryDetail() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $categoryId = (int)end($parts);

            if (empty($categoryId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                return;
            }

            $service = new AdminCategoryService();
            $category = $service->getCategoryDetail($categoryId);

            http_response_code(200);
            echo json_encode(['category' => $category]);
        } catch (\Exception $e) {
            error_log('Get category detail error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch category']);
        }
    }

    public static function createCategory() {
        if (!self::checkAdminAuth()) return;

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Category name is required']);
                return;
            }

            $adminId = self::getAdminId();
            $service = new AdminCategoryService();
            $category = $service->createCategory(
                $data['name'],
                $data['slug'] ?? '',
                $data['description'] ?? '',
                $data['icon'] ?? '',
                $data['color'] ?? '#000000',
                (int)($data['display_order'] ?? 0),
                (bool)($data['is_visible'] ?? true),
                (bool)($data['is_active'] ?? true),
                $adminId
            );

            http_response_code(201);
            echo json_encode(['category' => $category]);
        } catch (\Exception $e) {
            error_log('Create category error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function updateCategory() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $categoryId = (int)end($parts);

            if (empty($categoryId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $adminId = self::getAdminId();

            $service = new AdminCategoryService();
            $category = $service->updateCategory($categoryId, $data, $adminId);

            http_response_code(200);
            echo json_encode(['category' => $category]);
        } catch (\Exception $e) {
            error_log('Update category error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function deleteCategory() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $categoryId = (int)end($parts);

            if (empty($categoryId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                return;
            }

            $adminId = self::getAdminId();
            $service = new AdminCategoryService();
            $result = $service->deleteCategory($categoryId, $adminId);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Delete category error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete category']);
        }
    }

    // ========== REPORT MANAGEMENT ==========
    public static function getAllReports() {
        if (!self::checkAdminAuth()) return;

        try {
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $status = $_GET['status'] ?? 'pending';
            $reason = $_GET['reason'] ?? 'all';
            $search = $_GET['search'] ?? '';

            $service = new AdminReportService();
            $result = $service->getAllReports($page, $limit, $status, $reason, $search);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Get reports error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch reports']);
        }
    }

    public static function getReportDetail() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $reportId = (int)end($parts);

            if (empty($reportId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Report ID is required']);
                return;
            }

            $service = new AdminReportService();
            $report = $service->getReportDetail($reportId);

            http_response_code(200);
            echo json_encode(['report' => $report]);
        } catch (\Exception $e) {
            error_log('Get report detail error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch report']);
        }
    }

    public static function updateReportStatus() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $reportId = (int)end($parts);

            if (empty($reportId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Report ID is required']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['status'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Status is required']);
                return;
            }

            $adminId = self::getAdminId();
            $service = new AdminReportService();
            $result = $service->updateReportStatus(
                $reportId,
                $data['status'],
                $adminId,
                $data['notes'] ?? ''
            );

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Update report status error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update report']);
        }
    }

    public static function approveReport() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $reportId = (int)end($parts);

            if (empty($reportId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Report ID is required']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $adminId = self::getAdminId();

            $service = new AdminReportService();
            $result = $service->approveReport(
                $reportId,
                $adminId,
                $data['action'] ?? 'remove_content',
                $data['notes'] ?? ''
            );

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Approve report error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to approve report']);
        }
    }

    public static function dismissReport() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $reportId = (int)end($parts);

            if (empty($reportId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Report ID is required']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $adminId = self::getAdminId();

            $service = new AdminReportService();
            $result = $service->dismissReport($reportId, $adminId, $data['reason'] ?? '');

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Dismiss report error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to dismiss report']);
        }
    }

    public static function getReportStats() {
        if (!self::checkAdminAuth()) return;

        try {
            $service = new AdminReportService();
            $stats = $service->getReportStats();

            http_response_code(200);
            echo json_encode(['stats' => $stats]);
        } catch (\Exception $e) {
            error_log('Get report stats error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch report stats']);
        }
    }

    // ========== MESSAGE/CONTACT MANAGEMENT ==========
    public static function getAllMessages() {
        if (!self::checkAdminAuth()) return;

        try {
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $status = $_GET['status'] ?? 'unread';
            $search = $_GET['search'] ?? '';

            $service = new AdminContactMessageService();
            $result = $service->getAllMessages($page, $limit, $status, $search);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Get messages error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch messages']);
        }
    }

    public static function getMessageDetail() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $messageId = (int)end($parts);

            if (empty($messageId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Message ID is required']);
                return;
            }

            $service = new AdminContactMessageService();
            $message = $service->getMessageDetail($messageId);

            http_response_code(200);
            echo json_encode(['message' => $message]);
        } catch (\Exception $e) {
            error_log('Get message detail error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch message']);
        }
    }

    public static function sendMessageReply() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $messageId = (int)end($parts);

            if (empty($messageId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Message ID is required']);
                return;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['reply'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Reply text is required']);
                return;
            }

            $adminId = self::getAdminId();
            $service = new AdminContactMessageService();
            $result = $service->sendReply($messageId, $data['reply'], $adminId);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Send message reply error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function markMessageAsRead() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $messageId = (int)end($parts);

            if (empty($messageId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Message ID is required']);
                return;
            }

            $adminId = self::getAdminId();
            $service = new AdminContactMessageService();
            $result = $service->markAsRead($messageId, $adminId);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Mark message as read error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to mark message as read']);
        }
    }

    public static function getMessageStats() {
        if (!self::checkAdminAuth()) return;

        try {
            $service = new AdminContactMessageService();
            $stats = $service->getMessageStats();

            http_response_code(200);
            echo json_encode(['stats' => $stats]);
        } catch (\Exception $e) {
            error_log('Get message stats error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch message stats']);
        }
    }

    // ========== ADMIN LOG MANAGEMENT ==========
    public static function getAllLogs() {
        if (!self::checkAdminAuth()) return;

        try {
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $adminId = !empty($_GET['admin_id']) ? (int)$_GET['admin_id'] : null;
            $action = $_GET['action'] ?? '';
            $targetType = $_GET['target_type'] ?? '';
            $startDate = $_GET['start_date'] ?? '';
            $endDate = $_GET['end_date'] ?? '';

            $service = new AdminLogService();
            $result = $service->getAllLogs($page, $limit, $adminId, $action, $targetType, $startDate, $endDate);

            http_response_code(200);
            echo json_encode($result);
        } catch (\Exception $e) {
            error_log('Get logs error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch logs']);
        }
    }

    public static function getLogDetail() {
        if (!self::checkAdminAuth()) return;

        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $parts = explode('/', trim($path, '/'));
            $logId = (int)end($parts);

            if (empty($logId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Log ID is required']);
                return;
            }

            $service = new AdminLogService();
            $log = $service->getLogDetail($logId);

            http_response_code(200);
            echo json_encode(['log' => $log]);
        } catch (\Exception $e) {
            error_log('Get log detail error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch log']);
        }
    }

    public static function getActivityStats() {
        if (!self::checkAdminAuth()) return;

        try {
            $startDate = $_GET['start_date'] ?? '';
            $endDate = $_GET['end_date'] ?? '';

            $service = new AdminLogService();
            $stats = $service->getActivityStats($startDate, $endDate);

            http_response_code(200);
            echo json_encode(['stats' => $stats]);
        } catch (\Exception $e) {
            error_log('Get activity stats error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch activity stats']);
        }
    }

    public static function getAuditTrail() {
        if (!self::checkAdminAuth()) return;

        try {
            $targetType = $_GET['target_type'] ?? '';
            $targetId = !empty($_GET['target_id']) ? (int)$_GET['target_id'] : 0;

            if (empty($targetType) || empty($targetId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Target type and target ID are required']);
                return;
            }

            $service = new AdminLogService();
            $trail = $service->getAuditTrail($targetType, $targetId);

            http_response_code(200);
            echo json_encode(['audit_trail' => $trail]);
        } catch (\Exception $e) {
            error_log('Get audit trail error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch audit trail']);
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

    /**
     * Get the authenticated admin user's ID
     * Must be called after checkAdminAuth() returns true
     */
    private static function getAdminId() {
        $token = Auth::getToken();
        $decoded = Auth::verifyToken($token);
        return $decoded['userId'] ?? null;
    }
}
