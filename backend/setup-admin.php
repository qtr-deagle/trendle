<?php

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

echo "🔐 Creating admin user...\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    $email = 'admin@trendle.com';
    $password = 'admin123';
    $username = 'admin';
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Check if admin exists
    $result = $conn->query("SELECT id FROM users WHERE email = '$email'");
    
    if ($result->num_rows > 0) {
        echo "✓ Admin user already exists\n";
    } else {
        // Create admin user
        $stmt = $conn->prepare("INSERT INTO users (username, email, password, display_name, is_admin) VALUES (?, ?, ?, ?, 1)");
        $stmt->bind_param("ssss", $username, $email, $hashedPassword, $username);
        
        if ($stmt->execute()) {
            echo "✓ Admin user created successfully!\n";
            echo "📧 Email: admin@trendle.com\n";
            echo "🔑 Password: admin123\n";
        } else {
            echo "✗ Failed to create admin user: " . $stmt->error . "\n";
        }
        $stmt->close();
    }

    echo "\n✅ Admin setup complete!\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
