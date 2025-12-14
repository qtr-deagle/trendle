<?php

// Load configuration
require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

// Get database connection
$db = Database::getInstance();

// First check if users exist
$sql = "SELECT id, username, interests FROM users LIMIT 5";

try {
    $stmt = $db->execute($sql);
    $result = $stmt->get_result();
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo "Users with interests:\n";
    echo json_encode($users, JSON_PRETTY_PRINT);
    echo "\n\n";
    
    // Now try to get unique interests
    $sql2 = "SELECT interests FROM users WHERE interests IS NOT NULL AND interests != '' AND LENGTH(interests) > 0";
    $stmt2 = $db->execute($sql2);
    $result2 = $stmt2->get_result();
    $interests = [];
    while ($row = $result2->fetch_assoc()) {
        $interests[] = $row;
    }
    echo "Raw interests data:\n";
    echo json_encode($interests, JSON_PRETTY_PRINT);
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
