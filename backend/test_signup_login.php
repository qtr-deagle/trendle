<?php

/**
 * Test Script: Sign-up and Login Flow
 * Tests the complete authentication flow with password hashing
 */

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

// Load dependencies
require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Middleware/Auth.php';

use App\Config\Database;
use App\Middleware\Auth;

try {
    echo "=== Sign-up and Login Flow Test ===\n\n";

    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Test data
    $testUsername = 'testuser_' . time();
    $testEmail = 'test_' . time() . '@example.com';
    $testPassword = 'TestPassword123';

    echo "Test User Details:\n";
    echo "  Username: $testUsername\n";
    echo "  Email: $testEmail\n";
    echo "  Password: $testPassword\n\n";

    // Step 1: Register a new user
    echo "Step 1: Registering user...\n";

    // Check if user exists
    $stmt = $db->execute(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [$testEmail, $testUsername]
    );

    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo "  ERROR: User already exists\n";
        exit(1);
    }

    // Hash password
    $hashedPassword = password_hash($testPassword, PASSWORD_BCRYPT);
    echo "  Password hashed successfully (bcrypt)\n";

    // Insert user
    $stmt = $db->execute(
        'INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)',
        [$testUsername, $testEmail, $hashedPassword, $testUsername]
    );

    if (!$stmt) {
        echo "  ERROR: Failed to insert user\n";
        echo "  Error: " . $conn->error . "\n";
        exit(1);
    }

    $userId = $conn->insert_id;
    echo "  ✓ User registered successfully (ID: $userId)\n\n";

    // Step 2: Verify user was saved with password_hash
    echo "Step 2: Verifying user in database...\n";

    $stmt = $db->execute(
        'SELECT id, username, email, password FROM users WHERE id = ?',
        [$userId]
    );

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        echo "  ERROR: User not found in database\n";
        exit(1);
    }

    if (!$user['password']) {
        echo "  ERROR: Password hash is empty\n";
        exit(1);
    }

    echo "  ✓ User found in database\n";
    echo "  ✓ Password field contains: " . substr($user['password'], 0, 20) . "...\n\n";

    // Step 3: Test password verification
    echo "Step 3: Testing password verification...\n";

    if (password_verify($testPassword, $user['password'])) {
        echo "  ✓ Password verification successful (correct password)\n";
    } else {
        echo "  ERROR: Password verification failed for correct password\n";
        exit(1);
    }

    if (!password_verify('WrongPassword123', $user['password'])) {
        echo "  ✓ Wrong password correctly rejected\n";
    } else {
        echo "  ERROR: Wrong password was incorrectly accepted\n";
        exit(1);
    }
    echo "\n";

    // Step 4: Test login flow
    echo "Step 4: Testing login flow...\n";

    $stmt = $db->execute(
        'SELECT id, username, email, password FROM users WHERE email = ? AND is_admin = 0',
        [$testEmail]
    );

    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo "  ERROR: User not found during login\n";
        exit(1);
    }

    $loginUser = $result->fetch_assoc();

    if (!password_verify($testPassword, $loginUser['password'])) {
        echo "  ERROR: Password verification failed during login\n";
        exit(1);
    }

    echo "  ✓ Login password verification successful\n";

    // Generate token
    $token = Auth::generateToken($loginUser['id']);
    echo "  ✓ JWT token generated: " . substr($token, 0, 30) . "...\n\n";

    // Step 5: Verify token
    echo "Step 5: Testing token verification...\n";

    $decoded = Auth::verifyToken($token);
    if (!$decoded) {
        echo "  ERROR: Token verification failed\n";
        exit(1);
    }

    if ($decoded['userId'] != $userId) {
        echo "  ERROR: Token user ID doesn't match\n";
        exit(1);
    }

    echo "  ✓ Token verified successfully\n";
    echo "  ✓ Token user ID: " . $decoded['userId'] . "\n\n";

    // Cleanup: Delete test user
    echo "Cleanup: Deleting test user...\n";
    $db->execute('DELETE FROM users WHERE id = ?', [$userId]);
    echo "  ✓ Test user deleted\n\n";

    echo "=== All Tests Passed! ===\n";
    echo "\n✓ Sign-up flow with password hashing works\n";
    echo "✓ Password verification works correctly\n";
    echo "✓ Login flow with password verification works\n";
    echo "✓ Token generation and verification work\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
