<?php
require_once __DIR__ . '/config/database.php';

$stmt = $pdo->query('SELECT COUNT(*) as count FROM users');
$result = $stmt->fetch();
echo 'Total users: ' . $result['count'] . PHP_EOL;

$stmt = $pdo->query('SELECT COUNT(*) as count FROM posts');
$result = $stmt->fetch();
echo 'Total posts: ' . $result['count'] . PHP_EOL;
?>
