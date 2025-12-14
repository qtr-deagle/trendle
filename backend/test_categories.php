<?php

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();

    echo "Testing categories table...\n";

    // Test 1: Simple count
    $countStmt = $db->execute('SELECT COUNT(*) as total FROM categories', []);
    $countResult = $countStmt->get_result();
    $total = (int)$countResult->fetch_assoc()['total'];
    echo "Total categories: " . $total . "\n";

    // Test 2: Get all
    $stmt = $db->execute('SELECT id, name, slug FROM categories LIMIT 5', []);
    $result = $stmt->get_result();
    echo "Sample categories:\n";
    while ($row = $result->fetch_assoc()) {
        echo "  - " . $row['name'] . "\n";
    }

    // Test 3: Test reports
    echo "\nTesting reports table...\n";
    $countStmt = $db->execute('SELECT COUNT(*) as total FROM reports', []);
    $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
    echo "Total reports: " . $total . "\n";

    // Test 4: Test contact_messages
    echo "\nTesting contact_messages table...\n";
    $countStmt = $db->execute('SELECT COUNT(*) as total FROM contact_messages', []);
    $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
    echo "Total messages: " . $total . "\n";

    // Test 5: Test admin_logs
    echo "\nTesting admin_logs table...\n";
    $countStmt = $db->execute('SELECT COUNT(*) as total FROM admin_logs', []);
    $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
    echo "Total logs: " . $total . "\n";

    echo "\n✅ All tables working!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
