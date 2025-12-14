<?php
// Simple image server that bypasses routing
$path = $_SERVER['REQUEST_URI'];

// Remove /api from the beginning if present
$path = preg_replace('#^/api#', '', $path);

// Extract the file path
if (preg_match('#^/uploads/posts/(.+)$#', $path, $matches)) {
    $filename = urldecode($matches[1]);

    // Prevent directory traversal
    if (strpos($filename, '..') !== false || strpos($filename, '/') !== false) {
        http_response_code(403);
        exit('Forbidden');
    }

    $filepath = __DIR__ . '/uploads/posts/' . $filename;

    if (file_exists($filepath) && is_file($filepath)) {
        // Determine MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $filepath);
        finfo_close($finfo);

        header('Content-Type: ' . ($mime ?: 'image/jpeg'));
        header('Cache-Control: public, max-age=31536000');
        header('Content-Length: ' . filesize($filepath));
        readfile($filepath);
        exit;
    }
}

http_response_code(404);
echo 'Not Found';
