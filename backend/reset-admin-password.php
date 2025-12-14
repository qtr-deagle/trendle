<?php

require_once __DIR__ . '/config/database.php';

$newPassword = 'admin123';
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE username = ? AND is_admin = 1');
    $stmt->execute([$hashedPassword, 'admin']);
    
    echo "✅ Admin password updated successfully!\n";
    echo "Username: admin\n";
    echo "Password: {$newPassword}\n";
    echo "\nYou can now login at: /admin/login\n";
    
} catch (PDOException $e) {
    echo "❌ Error updating password: " . $e->getMessage() . "\n";
}
