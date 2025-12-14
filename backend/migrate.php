<?php

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

echo "📦 Running database migration...\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Check if is_admin column exists
    $result = $conn->query("SHOW COLUMNS FROM users LIKE 'is_admin'");
    
    if ($result->num_rows === 0) {
        echo "⏳ Adding is_admin column to users table...\n";
        
        $sql = "ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE AFTER following";
        
        if ($conn->query($sql)) {
            echo "✓ is_admin column added successfully\n";
        } else {
            echo "✗ Error adding column: " . $conn->error . "\n";
        }
    } else {
        echo "✓ is_admin column already exists\n";
    }

    // Check if avatar_url exists
    $result = $conn->query("SHOW COLUMNS FROM users LIKE 'avatar_url'");
    
    if ($result->num_rows === 0) {
        echo "⏳ Adding avatar_url column to users table...\n";
        
        $sql = "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) AFTER bio";
        
        if ($conn->query($sql)) {
            echo "✓ avatar_url column added successfully\n";
        } else {
            echo "✗ Error adding column: " . $conn->error . "\n";
        }
    } else {
        echo "✓ avatar_url column already exists\n";
    }

    // Check if interests exists
    $result = $conn->query("SHOW COLUMNS FROM users LIKE 'interests'");
    
    if ($result->num_rows === 0) {
        echo "⏳ Adding interests column to users table...\n";
        
        $sql = "ALTER TABLE users ADD COLUMN interests TEXT AFTER avatar_url";
        
        if ($conn->query($sql)) {
            echo "✓ interests column added successfully\n";
        } else {
            echo "✗ Error adding column: " . $conn->error . "\n";
        }
    } else {
        echo "✓ interests column already exists\n";
    }

    echo "\n✅ Migration complete!\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
