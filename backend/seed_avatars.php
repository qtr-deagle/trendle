<?php
/**
 * Set unique avatars for all users
 * Uses different DiceBear styles for variety
 */

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();
    
    // DiceBear styles for variety
    $styles = [
        'avataaars',
        'pixel-art',
        'lorelei',
        'thumbs',
        'initials',
        'shape',
        'gridy',
        'jdenticon',
        'bottts',
        'fun-emoji'
    ];
    
    // Get all users
    $result = $db->execute('SELECT id, username FROM users ORDER BY id')->get_result();
    
    $count = 0;
    while ($row = $result->fetch_assoc()) {
        $userId = $row['id'];
        $username = $row['username'];
        
        // Rotate through styles for variety
        $styleIndex = ($userId - 1) % count($styles);
        $style = $styles[$styleIndex];
        
        // Create avatar URL with seed (username)
        $avatarUrl = "https://api.dicebear.com/7.x/{$style}/svg?seed={$username}";
        
        // Update user's avatar_url
        $updateStmt = $db->execute(
            'UPDATE users SET avatar_url = ? WHERE id = ?',
            [$avatarUrl, $userId]
        );
        
        if ($updateStmt) {
            $count++;
            echo "[✓] User @{$username} -> {$style} avatar\n";
        } else {
            echo "[✗] Failed to update @{$username}\n";
        }
    }
    
    echo "\n=== Summary ===\n";
    echo "Total avatars set: {$count}\n";
    echo "All users now have unique, consistent avatars!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
