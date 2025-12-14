<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = Database::getInstance();

// Set interests for user 109 (username: 123)
$interests = "Wellness, Fashion, Design, Nature, Cooking";
$result = $db->execute(
    'UPDATE users SET interests = ? WHERE id = ?',
    [$interests, 109]
);

echo "Updated user 109 interests: {$interests}\n";

// Verify
$user = $db->execute('SELECT username, interests FROM users WHERE id = 109')->get_result()->fetch_assoc();
echo "Verification: " . $user['username'] . " now has interests: " . $user['interests'] . "\n";
?>
