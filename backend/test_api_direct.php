<?php
// Debug API endpoint directly

error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Simulate the POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/admin/login';

// Simulate the JSON body
$_POST = [];
$GLOBALS['HTTP_RAW_POST_DATA'] = json_encode([
    'email' => 'admin@trendle.com',
    'password' => 'admin123'
]);

// Mock file_get_contents for php://input
function mock_file_get_contents($filename) {
    if ($filename === 'php://input') {
        return json_encode([
            'email' => 'admin@trendle.com',
            'password' => 'admin123'
        ]);
    }
    return file_get_contents($filename);
}

// Load and execute the API
ob_start();
try {
    require __DIR__ . '/api/index.php';
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage();
}
$output = ob_get_clean();

echo "Response:\n";
echo $output;
