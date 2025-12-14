<?php
/**
 * Seed all users with avatars from the registration options
 * Uses only the 10 avatars available during signup
 */

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();
    
    // These are the ONLY avatars available during registration
    $avatarOptions = [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar2",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar3",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar4",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar5",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar6",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar7",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar8",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar9",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar10",
    ];
    
    // Get all non-admin users
    $result = $db->execute('SELECT id, username FROM users WHERE is_admin = FALSE ORDER BY id')->get_result();
    
    $count = 0;
    while ($row = $result->fetch_assoc()) {
        $userId = $row['id'];
        $username = $row['username'];
        
        // Cycle through the 10 avatars
        $avatarIndex = ($userId - 1) % count($avatarOptions);
        $avatarUrl = $avatarOptions[$avatarIndex];
        
        // Update user's avatar_url
        $updateStmt = $db->execute(
            'UPDATE users SET avatar_url = ? WHERE id = ?',
            [$avatarUrl, $userId]
        );
        
        $count++;
        echo "[✓] User @{$username} -> Avatar " . ($avatarIndex + 1) . "\n";
    }
    
    echo "\n=== Summary ===\n";
    echo "Total avatars set: {$count}\n";
    echo "Using only the 10 registration avatars!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
