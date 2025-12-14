<?php
// Simple test to debug admin login issues

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/src/Config/Database.php';

try {
    echo "Testing database connection...\n";
    $db = \App\Config\Database::getInstance();
    echo "✓ Database connected\n";

    // Check if users table exists
    echo "\nChecking users table...\n";
    $result = $db->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows > 0) {
        echo "✓ Users table exists\n";
    } else {
        echo "✗ Users table does not exist\n";
        exit(1);
    }

    // Check users table structure
    echo "\nChecking users table columns...\n";
    $result = $db->query("DESCRIBE users");
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row['Field'];
    }
    echo "Columns: " . implode(", ", $columns) . "\n";

    // Check for admin users
    echo "\nChecking for admin users...\n";
    $stmt = $db->execute(
        'SELECT id, username, email, is_admin FROM users WHERE is_admin = 1',
        []
    );
    $adminResult = $stmt->get_result();
    
    if ($adminResult->num_rows > 0) {
        echo "✓ Found " . $adminResult->num_rows . " admin user(s):\n";
        while ($row = $adminResult->fetch_assoc()) {
            echo "  - " . $row['username'] . " (" . $row['email'] . ")\n";
        }
    } else {
        echo "✗ No admin users found\n";
        echo "\nCreating default admin user...\n";
        
        $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);
        $insertStmt = $db->execute(
            'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 1)',
            ['admin', 'admin@trendle.com', $hashedPassword]
        );
        
        if ($insertStmt) {
            echo "✓ Admin user created\n";
            echo "  Email: admin@trendle.com\n";
            echo "  Password: admin123\n";
        }
    }

    echo "\n✓ All checks passed!\n";

} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
