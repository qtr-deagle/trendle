<?php
/**
 * Clean up post tags - remove any tags not in the register form
 */

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();
    
    // Allowed tags from register form
    $allowedTags = ["Travel", "Fitness", "Cooking", "Gaming", "Reading", "Photography", "Fashion", "Nature", "Technology", "Art", "Wellness", "Design"];
    
    echo "=== Cleaning Up Post Tags ===\n";
    echo "Allowed tags: " . implode(", ", $allowedTags) . "\n\n";
    
    // Get all tags that are NOT in the allowed list
    $invalidTags = $db->execute(
        'SELECT id, name FROM tags WHERE name NOT IN (' . implode(',', array_fill(0, count($allowedTags), '?')) . ')',
        $allowedTags
    )->get_result();
    
    $invalidTagIds = [];
    $invalidTagNames = [];
    
    while ($tag = $invalidTags->fetch_assoc()) {
        $invalidTagIds[] = $tag['id'];
        $invalidTagNames[] = $tag['name'];
    }
    
    if (empty($invalidTagIds)) {
        echo "✅ All posts already have only allowed tags!\n";
    } else {
        echo "Found " . count($invalidTagIds) . " invalid tags to remove:\n";
        foreach ($invalidTagNames as $tagName) {
            echo "  - {$tagName}\n";
        }
        echo "\n";
        
        // Delete post_tags entries for invalid tags
        $placeholders = implode(',', array_fill(0, count($invalidTagIds), '?'));
        $deleteResult = $db->execute(
            'DELETE FROM post_tags WHERE tag_id IN (' . $placeholders . ')',
            $invalidTagIds
        );
        
        echo "[✓] Removed invalid tag associations from posts\n";
        
        // Delete the invalid tags themselves
        $tagsDeleteResult = $db->execute(
            'DELETE FROM tags WHERE id IN (' . $placeholders . ')',
            $invalidTagIds
        );
        
        echo "[✓] Deleted " . count($invalidTagIds) . " invalid tag entries\n";
    }
    
    // Show summary of remaining tags
    echo "\n=== Remaining Tags in Database ===\n";
    $remaining = $db->execute('SELECT id, name FROM tags ORDER BY name')->get_result();
    $count = 0;
    while ($tag = $remaining->fetch_assoc()) {
        echo "  - {$tag['name']} (ID: {$tag['id']})\n";
        $count++;
    }
    echo "Total: {$count} tags\n";
    
    echo "\n✅ Post tags cleanup complete!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
