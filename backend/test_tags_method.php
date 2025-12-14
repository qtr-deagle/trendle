<?php
/**
 * Test getPostsByTags method
 */

require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Services/UserPostService.php';

use App\Services\UserPostService;

try {
    // Assuming user ID 123 exists
    $userId = 123;
    
    echo "=== Testing getPostsByTags for User {$userId} ===\n\n";
    
    $result = UserPostService::getPostsByTags($userId, 50, 0);
    
    echo "Success: " . ($result['success'] ? 'YES' : 'NO') . "\n";
    echo "Count: " . $result['count'] . "\n\n";
    
    if ($result['success'] && !empty($result['posts'])) {
        echo "First 3 posts:\n";
        for ($i = 0; $i < min(3, count($result['posts'])); $i++) {
            $post = $result['posts'][$i];
            echo "\n[" . ($i + 1) . "] Post ID: {$post['id']}\n";
            echo "    Content: " . substr($post['content'], 0, 50) . "...\n";
            echo "    Tags: " . json_encode($post['tags'] ?? []) . "\n";
        }
    } else {
        echo "No posts returned or error occurred.\n";
        if (!$result['success']) {
            echo "Error: " . ($result['error'] ?? 'Unknown error') . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    exit(1);
}
?>
