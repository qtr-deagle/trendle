<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = Database::getInstance();
$user = $db->execute('SELECT id, username, interests FROM users WHERE id = 109')->get_result()->fetch_assoc();
echo 'User: ' . $user['username'] . "\n";
echo 'Interests: ' . ($user['interests'] ?: 'NULL') . "\n";
?>
