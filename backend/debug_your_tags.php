<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = Database::getInstance();

// Get all users
echo "=== All Users ===\n";
$users = $db->execute('SELECT id, username, interests FROM users ORDER BY id')->get_result();
$userList = [];
while ($u = $users->fetch_assoc()) {
    $userList[] = $u;
    $interests = json_decode($u['interests'], true);
    echo "ID: {$u['id']}, Username: {$u['username']}\n";
    echo "  Interests: " . json_encode($interests) . "\n";
}

// Check the first user
if (!empty($userList)) {
    $user = $userList[0];
    echo "\n=== Testing with User: {$user['username']} (ID: {$user['id']}) ===\n";
    
    $interests = json_decode($user['interests'], true);
    echo "Interests (decoded): " . json_encode($interests) . "\n";
    echo "Interest count: " . count($interests ?? []) . "\n\n";

    // Check posts with these interests
    echo "=== Posts with matching tags ===\n";

    if (!empty($interests)) {
        $placeholders = implode(',', array_fill(0, count($interests), '?'));
        
        $stmt = $db->execute(
            'SELECT DISTINCT p.id, p.content, GROUP_CONCAT(DISTINCT t.name SEPARATOR \',\') as tags
             FROM posts p
             INNER JOIN post_tags pt ON p.id = pt.post_id
             INNER JOIN tags t ON pt.tag_id = t.id AND t.name IN (' . $placeholders . ')
             GROUP BY p.id
             ORDER BY p.created_at DESC
             LIMIT 10',
            $interests
        );
        
        $result = $stmt->get_result();
        $count = 0;
        while ($row = $result->fetch_assoc()) {
            $count++;
            echo "[{$count}] Post #{$row['id']}: " . substr($row['content'], 0, 50) . "\n";
            echo "    Tags: {$row['tags']}\n";
        }
        echo "Total posts found: {$count}\n";
    }
}

// Check all posts with their tags
echo "\n=== Sample Posts with tags ===\n";
$allPosts = $db->execute(
    'SELECT DISTINCT p.id, p.user_id, p.content, GROUP_CONCAT(DISTINCT t.name SEPARATOR \',\') as tags
     FROM posts p
     LEFT JOIN post_tags pt ON p.id = pt.post_id
     LEFT JOIN tags t ON pt.tag_id = t.id
     GROUP BY p.id
     ORDER BY p.id DESC
     LIMIT 15'
)->get_result();

$postCount = 0;
while ($post = $allPosts->fetch_assoc()) {
    $postCount++;
    echo "[{$postCount}] Post #{$post['id']}: " . substr($post['content'], 0, 50) . "\n";
    echo "    Tags: " . ($post['tags'] ?: 'None') . "\n";
}

// Check all tags in database
echo "\n=== All Tags ===\n";
$tags = $db->execute('SELECT id, name FROM tags ORDER BY name')->get_result();
while ($tag = $tags->fetch_assoc()) {
    echo "- {$tag['name']} (ID: {$tag['id']})\n";
}
?>

