<?php
/**
 * Debug script to check posts with tags
 */

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();
    
    echo "=== Posts with Tags ===\n\n";
    
    // Check how many posts have tags
    $tagsResult = $db->execute(
        'SELECT DISTINCT p.id, p.content, 
                GROUP_CONCAT(DISTINCT t.name SEPARATOR \',\') as tags
         FROM posts p
         INNER JOIN post_tags pt ON p.id = pt.post_id
         INNER JOIN tags t ON pt.tag_id = t.id AND t.name IN (\'Travel\', \'Fitness\', \'Cooking\', \'Gaming\', \'Reading\', \'Photography\', \'Fashion\', \'Nature\', \'Technology\', \'Art\', \'Wellness\', \'Design\')
         GROUP BY p.id
         ORDER BY p.created_at DESC'
    )->get_result();
    
    $count = 0;
    while ($row = $tagsResult->fetch_assoc()) {
        $count++;
        echo "[{$count}] Post #{$row['id']}: " . substr($row['content'], 0, 50) . "...\n";
        echo "    Tags: {$row['tags']}\n\n";
    }
    
    echo "=== Summary ===\n";
    echo "Total posts with life-related tags: {$count}\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
