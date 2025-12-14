<?php

namespace App\Routes;

use App\Middleware\Auth;

class UploadRoutes
{
    private static $uploadDir = __DIR__ . '/../../uploads/posts/';
    private static $maxFileSize = 10 * 1024 * 1024; // 10MB
    private static $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    public static function uploadPostImage()
    {
        // Verify authentication
        $token = Auth::getToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        // Check if file was uploaded
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No image file provided or upload error']);
            return;
        }

        $file = $_FILES['image'];

        // Validate file type
        if (!in_array($file['type'], self::$allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed']);
            return;
        }

        // Validate file size
        if ($file['size'] > self::$maxFileSize) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds 10MB limit']);
            return;
        }

        try {
            // Create uploads directory if it doesn't exist
            if (!is_dir(self::$uploadDir)) {
                mkdir(self::$uploadDir, 0755, true);
            }

            // Generate unique filename with timestamp and random string
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'post_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
            $filepath = self::$uploadDir . $filename;

            error_log('Upload attempt - filepath: ' . $filepath . ', exists: ' . (file_exists($filepath) ? 'yes' : 'no'));

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                $error = error_get_last();
                error_log('File move failed - error: ' . print_r($error, true));
                http_response_code(500);
                echo json_encode(['error' => 'Failed to save file: ' . ($error['message'] ?? 'unknown error')]);
                return;
            }

            error_log('Upload success - file saved to: ' . $filepath . ', size: ' . filesize($filepath));

            // Return the full API URL for storing in database (WITHOUT /api prefix since files are served at root)
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
            $imageUrl = $protocol . '://' . $host . '/uploads/posts/' . $filename;

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'image_url' => $imageUrl,
                'filename' => $filename
            ]);
        } catch (\Exception $e) {
            error_log('Upload error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to process upload']);
        }
    }

    public static function serveImage()
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        error_log('serveImage called with URI: ' . $uri);

        $path = parse_url($uri, PHP_URL_PATH);
        error_log('Parsed path: ' . $path);

        // Extract filename from path: /uploads/posts/filename.jpg or /api/uploads/posts/filename.jpg
        if (preg_match('#/uploads/posts/(.+)$#', $path, $matches)) {
            $filename = $matches[1];
            error_log('Extracted filename: ' . $filename);

            // Prevent directory traversal attacks
            if (strpos($filename, '..') !== false || strpos($filename, '/') !== false) {
                http_response_code(403);
                echo 'Forbidden';
                return;
            }

            $filepath = self::$uploadDir . $filename;
            error_log('Checking filepath: ' . $filepath . ' (exists: ' . (file_exists($filepath) ? 'yes' : 'no') . ')');

            if (file_exists($filepath) && is_file($filepath)) {
                error_log('File found, serving...');
                // Determine content type using finfo for better accuracy
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $contentType = finfo_file($finfo, $filepath);
                finfo_close($finfo);
                $contentType = $contentType ?: 'image/jpeg';

                header('Content-Type: ' . $contentType);
                header('Cache-Control: public, max-age=31536000');
                header('Content-Length: ' . filesize($filepath));

                readfile($filepath);
                return;
            } else {
                error_log('File NOT found at: ' . $filepath);
            }
        } else {
            error_log('Path does not match uploads/posts pattern');
        }

        http_response_code(404);
        error_log('Returning 404');
        echo 'Not found';
    }
}
