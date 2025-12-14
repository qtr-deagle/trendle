<?php
require_once __DIR__ . '/config/database.php';

$stmt = $pdo->query('
    SELECT p.id, u.username, p.content, p.image_url 
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    ORDER BY p.created_at DESC 
    LIMIT 20
');

echo "Recent posts:\n";
echo str_repeat("=", 80) . "\n";
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $type = empty($row['image_url']) ? '[TEXT]' : '[IMAGE]';
    $content = substr($row['content'], 0, 50);
    echo "$type @{$row['username']}: {$content}...\n";
}
echo str_repeat("=", 80) . "\n";
?>
