<?php

// Load configuration
require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

// Get database connection
$db = Database::getInstance();

// Get all unique interests
$sql = "
SELECT DISTINCT GROUP_CONCAT(DISTINCT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.interests, ',', numbers.n), ',', -1)) ORDER BY TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(u.interests, ',', numbers.n), ',', -1))) as interests
FROM users u
JOIN (SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) numbers
ON CHAR_LENGTH(u.interests) - CHAR_LENGTH(REPLACE(u.interests, ',', '')) >= numbers.n - 1
WHERE u.interests IS NOT NULL AND u.interests != ''
";

try {
    $results = $db->execute($sql);
    echo json_encode([
        'method' => 'complex query',
        'data' => $results
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    error_log('Error: ' . $e->getMessage());
    
    // Fallback: Get simple list of interests from users
    $sql2 = "SELECT DISTINCT interests FROM users WHERE interests IS NOT NULL AND interests != '' ORDER BY interests";
    $results = $db->execute($sql2);
    echo json_encode([
        'method' => 'fallback',
        'data' => $results
    ], JSON_PRETTY_PRINT);
}
