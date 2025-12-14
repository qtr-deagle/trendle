<?php

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

$db = Database::getInstance();
$result = $db->query('DESCRIBE users');

echo "Users table structure:\n\n";
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . ' - ' . $row['Type'] . (($row['Null'] === 'NO') ? ' NOT NULL' : ' NULL') . "\n";
}
