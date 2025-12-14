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

// Load dependencies
require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Middleware/Auth.php';
require_once __DIR__ . '/src/Routes/AuthRoutes.php';
require_once __DIR__ . '/src/Routes/UserRoutes.php';
require_once __DIR__ . '/src/Routes/AdminRoutes.php';
require_once __DIR__ . '/src/Router.php';

use App\Router;

Router::route();
