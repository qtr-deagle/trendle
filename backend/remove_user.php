<?php
/**
 * Remove a specific user and their data
 */

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();
    
    // Find user by username
    $username = 'jmrckvr';
    
    $userStmt = $db->execute(
        'SELECT id FROM users WHERE username = ?',
        [$username]
    );
    
    $userResult = $userStmt->get_result();
    $userRow = $userResult->fetch_assoc();
    
    if (!$userRow) {
        echo "[✗] User @{$username} not found\n";
        exit(1);
    }
    
    $userId = $userRow['id'];
    echo "[*] Found user @{$username} with ID: {$userId}\n";
    
    // Delete user's posts
    $deletePostsStmt = $db->execute(
        'DELETE FROM posts WHERE user_id = ?',
        [$userId]
    );
    $postsCount = $db->affected_rows;
    echo "[✓] Deleted {$postsCount} posts\n";
    
    // Delete user's likes
    $deleteLikesStmt = $db->execute(
        'DELETE FROM likes WHERE user_id = ?',
        [$userId]
    );
    echo "[✓] Deleted likes\n";
    
    // Delete user's followers (where they follow others)
    $deleteFollowsStmt = $db->execute(
        'DELETE FROM follows WHERE follower_id = ?',
        [$userId]
    );
    echo "[✓] Deleted follows (where user is follower)\n";
    
    // Delete user's followers (where others follow them)
    $deleteFollowedStmt = $db->execute(
        'DELETE FROM follows WHERE following_id = ?',
        [$userId]
    );
    echo "[✓] Deleted followers (where others follow user)\n";
    
    // Finally, delete the user
    $deleteUserStmt = $db->execute(
        'DELETE FROM users WHERE id = ?',
        [$userId]
    );
    echo "[✓] Deleted user @{$username}\n";
    
    echo "\n=== Summary ===\n";
    echo "User @{$username} has been completely removed from the system.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
