<?php
/**
 * Set random follower counts (0-15) for all users
 */

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();
    
    // Get all non-admin users
    $result = $db->execute('SELECT id, username FROM users WHERE is_admin = FALSE ORDER BY id')->get_result();
    
    $count = 0;
    while ($row = $result->fetch_assoc()) {
        $userId = $row['id'];
        $username = $row['username'];
        
        // Random followers between 0 and 15
        $randomFollowers = rand(0, 15);
        
        // Update user's followers count
        $updateStmt = $db->execute(
            'UPDATE users SET followers = ? WHERE id = ?',
            [$randomFollowers, $userId]
        );
        
        $count++;
        echo "[✓] User @{$username} -> {$randomFollowers} followers\n";
    }
    
    echo "\n=== Summary ===\n";
    echo "Total users updated: {$count}\n";
    echo "All users now have 0-15 followers!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
