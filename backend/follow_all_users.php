<?php
require_once __DIR__ . '/config/database.php';

// The current user (ID 108 which is @123)
$currentUserId = 108;

try {
    // Get all users except the current user
    $stmt = $pdo->prepare("
        SELECT id FROM users 
        WHERE id != :current_id 
        ORDER BY id ASC
    ");
    $stmt->execute([':current_id' => $currentUserId]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Setting up follows for user ID $currentUserId...\n";
    echo "Found " . count($users) . " other users to follow.\n\n";

    $followCount = 0;
    foreach ($users as $user) {
        try {
            // Check if already following
            $checkStmt = $pdo->prepare("
                SELECT id FROM follows 
                WHERE follower_id = :follower_id 
                AND following_id = :following_id
            ");
            $checkStmt->execute([
                ':follower_id' => $currentUserId,
                ':following_id' => $user['id']
            ]);

            if ($checkStmt->rowCount() === 0) {
                // Insert follow
                $insertStmt = $pdo->prepare("
                    INSERT INTO follows (follower_id, following_id)
                    VALUES (:follower_id, :following_id)
                ");
                $insertStmt->execute([
                    ':follower_id' => $currentUserId,
                    ':following_id' => $user['id']
                ]);

                // Update following count for current user
                $updateStmt = $pdo->prepare("
                    UPDATE users SET following = following + 1
                    WHERE id = :id
                ");
                $updateStmt->execute([':id' => $currentUserId]);

                // Update followers count for the followed user
                $updateStmt = $pdo->prepare("
                    UPDATE users SET followers = followers + 1
                    WHERE id = :id
                ");
                $updateStmt->execute([':id' => $user['id']]);

                $followCount++;
                echo "✓ Following user ID {$user['id']}\n";
            } else {
                echo "- Already following user ID {$user['id']}\n";
            }
        } catch (Exception $e) {
            echo "✗ Error following user ID {$user['id']}: " . $e->getMessage() . "\n";
        }
    }

    echo "\n✅ Complete! Now following $followCount new users.\n";
    echo "All posts from these users should now appear in your Following feed!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
