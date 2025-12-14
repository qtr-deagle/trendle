<?php
// Custom server router for development
$uri = $_SERVER['REQUEST_URI'] ?? '/';

// If it's a static file, return false to let PHP dev server serve it
$static_files = ['css', 'js', 'jpg', 'jpeg', 'png', 'gif', 'ico', 'svg', 'woff', 'woff2', 'ttf'];
foreach ($static_files as $ext) {
    if (preg_match('/\.' . $ext . '$/', $uri)) {
        return false;
    }
}

// For everything else, route through index.php
$_SERVER['REQUEST_URI'] = $uri;
$_SERVER['REQUEST_METHOD'] = $_SERVER['REQUEST_METHOD'] ?? 'GET';

require __DIR__ . '/index.php';
