<?php
// Direct test of admin login endpoint

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Middleware/Auth.php';
require_once __DIR__ . '/src/Routes/AdminRoutes.php';

try {
    echo "Testing admin login...\n";
    
    $db = \App\Config\Database::getInstance();
    
    // Test query directly
    echo "\n1. Testing direct query:\n";
    $stmt = $db->execute(
        'SELECT id, username, email, password, is_admin FROM users WHERE email = ? AND is_admin = 1',
        ['admin@trendle.com']
    );
    
    if (!$stmt) {
        echo "ERROR: Query returned null\n";
        exit(1);
    }
    
    $result = $stmt->get_result();
    echo "Query executed successfully\n";
    echo "Rows found: " . $result->num_rows . "\n";
    
    if ($result->num_rows > 0) {
        $admin = $result->fetch_assoc();
        echo "Admin found: " . $admin['username'] . " (" . $admin['email'] . ")\n";
        
        // Test password verification
        echo "\n2. Testing password verification:\n";
        $passwordMatch = password_verify('admin123', $admin['password']);
        echo "Password match: " . ($passwordMatch ? "YES" : "NO") . "\n";
        
        if ($passwordMatch) {
            // Test token generation
            echo "\n3. Testing token generation:\n";
            $token = \App\Middleware\Auth::generateToken($admin['id']);
            echo "Token generated: " . substr($token, 0, 20) . "...\n";
            echo "\n✓ All admin login tests passed!\n";
        }
    } else {
        echo "No admin user found\n";
    }

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
