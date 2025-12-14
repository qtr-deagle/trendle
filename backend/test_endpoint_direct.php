<?php
/**
 * Test the full endpoint response
 */

// Set up test environment
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/posts/feed?limit=2&offset=0';
$_SERVER['HTTP_HOST'] = 'localhost:8000';

// Mock token
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer test_token';

// Create a test token
require 'src/Config/Database.php';
require 'src/Middleware/Auth.php';

use App\Middleware\Auth;

Auth::setSecret('your_jwt_secret_key');

// Create a valid test token for user 123
$token = Auth::generateToken(['userId' => 123], 99999999999);
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;

// Now call the endpoint
require 'src/Routes/UserRoutes.php';
require 'src/Services/UserPostService.php';

use App\Routes\UserRoutes;

ob_start();
UserRoutes::getPostsByTags();
$output = ob_get_clean();

$data = json_decode($output, true);

echo "Response from /posts/feed:\n";
echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
echo "\n\nFirst post structure:\n";
if (!empty($data['posts'])) {
    echo json_encode($data['posts'][0], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
?>
