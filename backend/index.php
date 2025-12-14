<?php

// Set CORS headers FIRST before anything else
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

// Load dependencies
require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Middleware/Auth.php';
require_once __DIR__ . '/src/Services/AdminUserService.php';
require_once __DIR__ . '/src/Services/AdminTagService.php';
require_once __DIR__ . '/src/Services/AdminCategoryService.php';
require_once __DIR__ . '/src/Services/AdminReportService.php';
require_once __DIR__ . '/src/Services/AdminContactMessageService.php';
require_once __DIR__ . '/src/Services/AdminLogService.php';
require_once __DIR__ . '/src/Routes/AuthRoutes.php';
require_once __DIR__ . '/src/Routes/UserRoutes.php';
require_once __DIR__ . '/src/Routes/AdminRoutes.php';
require_once __DIR__ . '/src/Router.php';

// Set JWT secret
\App\Middleware\Auth::setSecret(getenv('JWT_SECRET') ?: 'your_jwt_secret_key');

// Parse URL
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$path = rtrim($path, '/');

// Route handling
try {
    if ($path === '/auth/register' && $method === 'POST') {
        \App\Routes\AuthRoutes::register();
    } elseif ($path === '/auth/login' && $method === 'POST') {
        \App\Routes\AuthRoutes::login();
    } elseif ($path === '/auth/me' && $method === 'GET') {
        \App\Routes\AuthRoutes::me();
    } elseif ($path === '/auth/admin-login' && $method === 'POST') {
        \App\Routes\AuthRoutes::adminLogin();
    }
    // ========== USER ROUTES ==========
    elseif ($path === '/user/profile' && $method === 'PUT') {
        \App\Routes\UserRoutes::updateProfile();
    } elseif (preg_match('#^/user/profile/([a-zA-Z0-9_]+)$#', $path, $matches) && $method === 'GET') {
        \App\Routes\UserRoutes::getProfile();
    } elseif ($path === '/user/avatar' && $method === 'POST') {
        \App\Routes\UserRoutes::updateAvatar();
    }
    // ========== ADMIN ROUTES ==========
    elseif ($path === '/admin/login' && $method === 'POST') {
        \App\Routes\AdminRoutes::login();
    } elseif ($path === '/admin/verify' && $method === 'GET') {
        \App\Routes\AdminRoutes::verifyAdmin();
    } elseif ($path === '/admin/dashboard' && $method === 'GET') {
        \App\Routes\AdminRoutes::getDashboardMetrics();
    }
    // ========== USERS ==========
    elseif ($path === '/admin/users' && $method === 'GET') {
        \App\Routes\AdminRoutes::getAllUsers();
    } elseif (preg_match('/^\/admin\/users\/(\d+)$/', $path, $matches) && $method === 'GET') {
        \App\Routes\AdminRoutes::getUserDetail();
    } elseif (preg_match('/^\/admin\/users\/(\d+)\/ban$/', $path, $matches) && $method === 'POST') {
        \App\Routes\AdminRoutes::banUser();
    } elseif (preg_match('/^\/admin\/users\/(\d+)\/activate$/', $path, $matches) && $method === 'POST') {
        \App\Routes\AdminRoutes::activateUser();
    } elseif (preg_match('/^\/admin\/users\/(\d+)\/promote$/', $path, $matches) && $method === 'POST') {
        \App\Routes\AdminRoutes::promoteToAdmin();
    } elseif (preg_match('/^\/admin\/users\/(\d+)\/demote$/', $path, $matches) && $method === 'POST') {
        \App\Routes\AdminRoutes::demoteFromAdmin();
    }
    // ========== TAGS ==========
    elseif ($path === '/admin/tags' && $method === 'GET') {
        \App\Routes\AdminRoutes::getAllTags();
    } elseif ($path === '/admin/tags' && $method === 'POST') {
        \App\Routes\AdminRoutes::createTag();
    } elseif (preg_match('/^\/admin\/tags\/(\d+)$/', $path, $matches) && $method === 'PUT') {
        \App\Routes\AdminRoutes::updateTag();
    } elseif (preg_match('/^\/admin\/tags\/(\d+)$/', $path, $matches) && $method === 'DELETE') {
        \App\Routes\AdminRoutes::deleteTag();
    }
    // ========== CATEGORIES ==========
    elseif ($path === '/admin/categories' && $method === 'GET') {
        \App\Routes\AdminRoutes::getAllCategories();
    } elseif ($path === '/admin/categories' && $method === 'POST') {
        \App\Routes\AdminRoutes::createCategory();
    } elseif (preg_match('/^\/admin\/categories\/(\d+)$/', $path, $matches) && $method === 'GET') {
        \App\Routes\AdminRoutes::getCategoryDetail();
    } elseif (preg_match('/^\/admin\/categories\/(\d+)$/', $path, $matches) && $method === 'PUT') {
        \App\Routes\AdminRoutes::updateCategory();
    } elseif (preg_match('/^\/admin\/categories\/(\d+)$/', $path, $matches) && $method === 'DELETE') {
        \App\Routes\AdminRoutes::deleteCategory();
    }
    // ========== REPORTS ==========
    elseif ($path === '/admin/reports' && $method === 'GET') {
        \App\Routes\AdminRoutes::getAllReports();
    } elseif (preg_match('/^\/admin\/reports\/(\d+)$/', $path, $matches) && $method === 'GET') {
        \App\Routes\AdminRoutes::getReportDetail();
    } elseif (preg_match('/^\/admin\/reports\/(\d+)\/status$/', $path, $matches) && $method === 'PUT') {
        \App\Routes\AdminRoutes::updateReportStatus();
    } elseif (preg_match('/^\/admin\/reports\/(\d+)\/approve$/', $path, $matches) && $method === 'POST') {
        \App\Routes\AdminRoutes::approveReport();
    } elseif (preg_match('/^\/admin\/reports\/(\d+)\/dismiss$/', $path, $matches) && $method === 'POST') {
        \App\Routes\AdminRoutes::dismissReport();
    } elseif ($path === '/admin/reports/stats' && $method === 'GET') {
        \App\Routes\AdminRoutes::getReportStats();
    }
    // ========== MESSAGES ==========
    elseif ($path === '/admin/messages' && $method === 'GET') {
        \App\Routes\AdminRoutes::getAllMessages();
    } elseif (preg_match('/^\/admin\/messages\/(\d+)$/', $path, $matches) && $method === 'GET') {
        \App\Routes\AdminRoutes::getMessageDetail();
    } elseif (preg_match('/^\/admin\/messages\/(\d+)\/reply$/', $path, $matches) && $method === 'POST') {
        \App\Routes\AdminRoutes::sendMessageReply();
    } elseif (preg_match('/^\/admin\/messages\/(\d+)\/read$/', $path, $matches) && $method === 'POST') {
        \App\Routes\AdminRoutes::markMessageAsRead();
    } elseif ($path === '/admin/messages/stats' && $method === 'GET') {
        \App\Routes\AdminRoutes::getMessageStats();
    }
    // ========== LOGS ==========
    elseif ($path === '/admin/logs' && $method === 'GET') {
        \App\Routes\AdminRoutes::getAllLogs();
    } elseif (preg_match('/^\/admin\/logs\/(\d+)$/', $path, $matches) && $method === 'GET') {
        \App\Routes\AdminRoutes::getLogDetail();
    } elseif ($path === '/admin/logs/stats' && $method === 'GET') {
        \App\Routes\AdminRoutes::getActivityStats();
    } elseif ($path === '/admin/logs/audit-trail' && $method === 'GET') {
        \App\Routes\AdminRoutes::getAuditTrail();
    }
    else {
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
} catch (\Throwable $e) {
    error_log('Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
