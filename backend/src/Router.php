<?php

namespace App;

use App\Config\Database;
use App\Middleware\Auth;
use App\Routes\AuthRoutes;
use App\Routes\UserRoutes;
use App\Routes\AdminRoutes;

class Router {
    
    public static function route() {
        // Load environment variables
        if (file_exists(__DIR__ . '/../../.env')) {
            $lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    [$key, $value] = explode('=', $line, 2);
                    putenv(trim($key) . '=' . trim($value));
                }
            }
        }

        // Set JWT secret
        Auth::setSecret(getenv('JWT_SECRET') ?: 'your_jwt_secret_key');

        // Run migrations
        self::runMigrations();

        // Parse URL
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = str_replace('/api', '', $path);
        $path = rtrim($path, '/');

        // Route handling
        if ($path === '/auth/register' && $method === 'POST') {
            AuthRoutes::register();
        } elseif ($path === '/auth/login' && $method === 'POST') {
            AuthRoutes::login();
        } elseif ($path === '/auth/me' && $method === 'GET') {
            AuthRoutes::me();
        } elseif ($path === '/admin/login' && $method === 'POST') {
            AdminRoutes::login();
        } elseif ($path === '/admin/verify' && $method === 'GET') {
            AdminRoutes::verifyAdmin();
        } elseif ($path === '/admin/dashboard' && $method === 'GET') {
            AdminRoutes::getDashboardMetrics();
        } elseif ($path === '/admin/users' && $method === 'GET') {
            AdminRoutes::getAllUsers();
        } elseif (preg_match('#^/admin/users/(\d+)/status$#', $path, $matches) && $method === 'PUT') {
            AdminRoutes::updateUserStatus();
        } elseif ($path === '/user/profile' && $method === 'PUT') {
            UserRoutes::updateProfile();
        } elseif ($path === '/user/avatar' && $method === 'POST') {
            UserRoutes::updateAvatar();
        } elseif (preg_match('#^/user/profile/([a-zA-Z0-9_]+)$#', $path, $matches) && $method === 'GET') {
            UserRoutes::getProfile();
        } elseif (preg_match('#^/user/([a-zA-Z0-9_]+)/follow$#', $path, $matches) && $method === 'POST') {
            UserRoutes::followUser();
        } elseif (preg_match('#^/user/([a-zA-Z0-9_]+)/unfollow$#', $path, $matches) && $method === 'POST') {
            UserRoutes::unfollowUser();
        } elseif (preg_match('#^/user/([a-zA-Z0-9_]+)/following$#', $path, $matches) && $method === 'GET') {
            UserRoutes::getFollowingList();
        } elseif (strpos($path, '/uploads/') === 0) {
            UserRoutes::serveUploadedFile();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
        }
    }

    private static function runMigrations() {
        try {
            $schemaPath = __DIR__ . '/../database/schema.sql';
            if (!file_exists($schemaPath)) {
                return;
            }

            $schema = file_get_contents($schemaPath);
            $queries = array_filter(explode(';', $schema), function($q) {
                return !empty(trim($q));
            });

            $db = Database::getInstance();
            $conn = $db->getConnection();

            foreach ($queries as $query) {
                $query = trim($query);
                if (!empty($query)) {
                    if (!$conn->query($query)) {
                        // Skip if table already exists
                        if (strpos($conn->error, 'already exists') === false) {
                            error_log('Migration error: ' . $conn->error);
                        }
                    }
                }
            }

            // Log to file, don't echo
            error_log('Database migrations completed');
        } catch (\Exception $e) {
            error_log('Migration error: ' . $e->getMessage());
        }
    }
}
