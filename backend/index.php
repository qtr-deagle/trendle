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
require_once __DIR__ . '/src/Services/UserPostService.php';
require_once __DIR__ . '/src/Services/CommunityService.php';
require_once __DIR__ . '/src/Services/MessageService.php';
require_once __DIR__ . '/src/Services/ExploreService.php';
require_once __DIR__ . '/src/Services/SettingsService.php';
require_once __DIR__ . '/src/Routes/AuthRoutes.php';
require_once __DIR__ . '/src/Routes/UserRoutes.php';
require_once __DIR__ . '/src/Routes/AdminRoutes.php';
require_once __DIR__ . '/src/Routes/UploadRoutes.php';
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
    // ========== UPLOAD ROUTES ==========
    if ($path === '/upload/image' && $method === 'POST') {
        \App\Routes\UploadRoutes::uploadPostImage();
    } elseif (preg_match('#^/uploads/posts/.+$#', $path) && $method === 'GET') {
        \App\Routes\UploadRoutes::serveImage();
    }
    // ========== AUTH ROUTES ==========
    elseif ($path === '/auth/register' && $method === 'POST') {
        \App\Routes\AuthRoutes::register();
    } elseif ($path === '/auth/login' && $method === 'POST') {
        \App\Routes\AuthRoutes::login();
    } elseif ($path === '/auth/me' && $method === 'GET') {
        \App\Routes\AuthRoutes::me();
    } elseif ($path === '/auth/admin-login' && $method === 'POST') {
        \App\Routes\AuthRoutes::adminLogin();
    }
    // ========== USER ROUTES ==========
    elseif ($path === '/user/profile' && $method === 'GET') {
        \App\Routes\UserRoutes::getCurrentUserProfile();
    } elseif ($path === '/user/profile' && $method === 'PUT') {
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
    } elseif ($path === '/admin/logout' && $method === 'POST') {
        \App\Routes\AdminRoutes::logout();
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
    // ========== POST ROUTES ==========
    elseif ($path === '/posts/feed' && $method === 'GET') {
        \App\Routes\UserRoutes::getFeedPosts();
    } elseif (preg_match('#^/user/([a-zA-Z0-9_]+)/posts$#', $path) && $method === 'GET') {
        \App\Routes\UserRoutes::getUserPosts();
    } elseif (preg_match('#^/post/(\d+)$#', $path) && $method === 'GET') {
        \App\Routes\UserRoutes::getPostDetail();
    } elseif ($path === '/post' && $method === 'POST') {
        \App\Routes\UserRoutes::createPost();
    } elseif ($path === '/post' && $method === 'DELETE') {
        \App\Routes\UserRoutes::deletePost();
    } elseif (preg_match('#^/post/(\d+)/like$#', $path) && $method === 'POST') {
        \App\Routes\UserRoutes::likePost();
    } elseif (preg_match('#^/post/(\d+)/unlike$#', $path) && $method === 'POST') {
        \App\Routes\UserRoutes::unlikePost();
    }
    // ========== COMMUNITY ROUTES ==========
    elseif ($path === '/communities' && $method === 'GET') {
        \App\Routes\UserRoutes::getAllCommunities();
    } elseif ($path === '/communities/user' && $method === 'GET') {
        \App\Routes\UserRoutes::getUserCommunities();
    } elseif (preg_match('#^/community/(\d+)$#', $path) && $method === 'GET') {
        \App\Routes\UserRoutes::getCommunityDetail();
    } elseif (preg_match('#^/community/(\d+)/join$#', $path) && $method === 'POST') {
        \App\Routes\UserRoutes::joinCommunity();
    } elseif (preg_match('#^/community/(\d+)/leave$#', $path) && $method === 'POST') {
        \App\Routes\UserRoutes::leaveCommunity();
    } elseif ($path === '/communities/search' && $method === 'GET') {
        \App\Routes\UserRoutes::searchCommunities();
    }
    // ========== MESSAGE ROUTES ==========
    elseif ($path === '/messages/conversations' && $method === 'GET') {
        \App\Routes\UserRoutes::getConversations();
    } elseif ($path === '/messages/followers' && $method === 'GET') {
        \App\Routes\UserRoutes::getFollowersForMessaging();
    } elseif (preg_match('#^/message/conversation/(\d+)$#', $path) && $method === 'GET') {
        \App\Routes\UserRoutes::getConversation();
    } elseif ($path === '/message/send' && $method === 'POST') {
        \App\Routes\UserRoutes::sendMessage();
    } elseif ($path === '/messages' && $method === 'GET') {
        \App\Routes\UserRoutes::getMessages();
    } elseif ($path === '/messages/read' && $method === 'PUT') {
        \App\Routes\UserRoutes::markMessagesAsRead();
    } elseif ($path === '/messages/unread' && $method === 'GET') {
        \App\Routes\UserRoutes::getUnreadMessageCount();
    }
    // ========== EXPLORE ROUTES ==========
    elseif ($path === '/explore/trending-hashtags' && $method === 'GET') {
        \App\Routes\UserRoutes::getTrendingHashtags();
    } elseif ($path === '/explore/categories' && $method === 'GET') {
        \App\Routes\UserRoutes::getTrendingCategories();
    } elseif ($path === '/users/search' && $method === 'GET') {
        \App\Routes\UserRoutes::searchUsers();
    } elseif ($path === '/search' && $method === 'GET') {
        \App\Routes\UserRoutes::globalSearch();
    } elseif (preg_match('#^/tag/([a-zA-Z0-9_\-]+)/posts$#', $path) && $method === 'GET') {
        \App\Routes\UserRoutes::getPostsByHashtag();
    } elseif ($path === '/explore/recommended-users' && $method === 'GET') {
        \App\Routes\UserRoutes::getRecommendedUsers();
    }
    // ========== SETTINGS ROUTES ==========
    elseif ($path === '/settings' && $method === 'GET') {
        \App\Routes\UserRoutes::getUserSettings();
    } elseif ($path === '/settings' && $method === 'PUT') {
        \App\Routes\UserRoutes::updateUserSettings();
    } elseif ($path === '/settings/account' && $method === 'PUT') {
        \App\Routes\UserRoutes::updateAccountSettings();
    }
    // ========== FOLLOW ROUTES ==========
    elseif (preg_match('#^/user/([a-zA-Z0-9_]+)/follow$#', $path) && $method === 'POST') {
        \App\Routes\UserRoutes::followUser();
    } elseif (preg_match('#^/user/([a-zA-Z0-9_]+)/unfollow$#', $path) && $method === 'POST') {
        \App\Routes\UserRoutes::unfollowUser();
    } elseif ($path === '/user/following' && $method === 'GET') {
        \App\Routes\UserRoutes::getFollowingList();
    }
    // ========== FILE UPLOAD ROUTES ==========
    elseif (preg_match('#^/uploads/.+#', $path) && $method === 'GET') {
        \App\Routes\UserRoutes::serveUploadedFile();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }
} catch (\Throwable $e) {
    error_log('Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
