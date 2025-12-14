<?php
// Image server - Direct image serving without complex routing

// Get the requested filename from the URL
// Request: /uploads/posts/filename.jpg
// REQUEST_URI: /uploads/posts/filename.jpg or /api/uploads/posts/filename.jpg

$uri = $_SERVER['REQUEST_URI'];

// Remove /api if present
$uri = preg_replace('#^/api#', '', $uri);

// Extract filename from uploads/posts path
if (preg_match('#/uploads/posts/(.+)$#', $uri, $matches)) {
    $filename = urldecode($matches[1]);

    // Security: Prevent directory traversal
    if (strpos($filename, '..') !== false || strpos($filename, '/') !== false) {
        http_response_code(403);
        exit('Forbidden');
    }

    // Construct file path
    $filepath = __DIR__ . '/uploads/posts/' . $filename;

    if (file_exists($filepath) && is_file($filepath)) {
        // Get file MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $filepath);
        finfo_close($finfo);

        // Serve the file
        header('Content-Type: ' . ($mime ?: 'image/jpeg'));
        header('Cache-Control: public, max-age=31536000');
        header('Content-Length: ' . filesize($filepath));
        readfile($filepath);
        exit;
    }
}

http_response_code(404);
echo 'Not Found';
