<?php
/**
 * Minimal test of the /posts/feed endpoint
 */

// Simulate the router
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/posts/feed?limit=2&offset=0';
$_SERVER['HTTP_HOST'] = 'localhost:8000';

// Set a test JWT token in headers
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZXhwaXJlcyI6OTk5OTk5OTk5OTl9.h1rMtkRKHrPeO1sYaOJWJJVjSn4TlE2r6_2GYG3SQJU';

require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Middleware/Auth.php';
require_once __DIR__ . '/src/Routes/UserRoutes.php';

use App\Middleware\Auth;
use App\Routes\UserRoutes;

// Set JWT secret
Auth::setSecret('your_jwt_secret_key');

echo "Testing /posts/feed endpoint...\n";
echo "Calling UserRoutes::getPostsByTags()\n\n";

// This will echo JSON output
ob_start();
UserRoutes::getPostsByTags();
$output = ob_get_clean();

echo $output;
echo "\n";
?>
