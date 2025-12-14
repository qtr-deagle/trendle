<?php
/**
 * Reset tags - delete old genre tags and recreate with new life-related tags
 */

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();
    
    // Old genre tags to delete
    $oldGenres = ["Rock", "Pop", "Hip-Hop", "Electronic", "Jazz", "R&B", "Country", "Indie"];
    
    echo "=== Deleting Old Genre Tags ===\n";
    
    foreach ($oldGenres as $genre) {
        // Get tag ID
        $tag = $db->execute(
            'SELECT id FROM tags WHERE name = ?',
            [$genre]
        )->get_result()->fetch_assoc();
        
        if ($tag) {
            // Delete all associations
            $db->execute('DELETE FROM post_tags WHERE tag_id = ?', [$tag['id']]);
            // Delete the tag
            $db->execute('DELETE FROM tags WHERE id = ?', [$tag['id']]);
            echo "[✓] Deleted tag: {$genre}\n";
        }
    }
    
    echo "\n=== Creating New Life-Related Tags ===\n";
    
    // New life-related tags
    $newTags = ["Travel", "Fitness", "Cooking", "Gaming", "Reading", "Photography", "Fashion", "Nature", "Technology", "Art", "Wellness", "Design"];
    
    $tagIds = [];
    foreach ($newTags as $tag) {
        $slug = strtolower(str_replace([' ', '-'], '-', $tag));
        
        // Check if already exists
        $existing = $db->execute(
            'SELECT id FROM tags WHERE name = ?',
            [$tag]
        )->get_result()->fetch_assoc();
        
        if ($existing) {
            $tagIds[$tag] = $existing['id'];
            echo "[✓] Tag '{$tag}' already exists (ID: {$existing['id']})\n";
        } else {
            // Create new tag
            $db->execute(
                'INSERT INTO tags (name, slug, description, is_active) VALUES (?, ?, ?, 1)',
                [$tag, $slug, "{$tag} lifestyle content"]
            );
            
            $newTag = $db->execute(
                'SELECT id FROM tags WHERE name = ?',
                [$tag]
            )->get_result()->fetch_assoc();
            
            $tagIds[$tag] = $newTag['id'];
            echo "[✓] Created tag '{$tag}' (ID: {$newTag['id']})\n";
        }
    }
    
    echo "\n=== Assigning New Tags to Posts ===\n";
    
    // Get all posts
    $posts = $db->execute(
        'SELECT id FROM posts'
    )->get_result();
    
    $postCount = 0;
    $tagAssignments = 0;
    
    while ($post = $posts->fetch_assoc()) {
        $postCount++;
        
        // Remove old tags
        $db->execute('DELETE FROM post_tags WHERE post_id = ?', [$post['id']]);
        
        // Assign 0-12 random new tags
        $numTags = rand(0, 12);
        $randomTags = [];
        
        if ($numTags > 0) {
            $randomTags = array_rand($newTags, min($numTags, count($newTags)));
            
            if (!is_array($randomTags)) {
                $randomTags = is_int($randomTags) ? [$randomTags] : [];
            }
        }
        
        foreach ($randomTags as $index) {
            $tagName = $newTags[$index];
            $db->execute(
                'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
                [$post['id'], $tagIds[$tagName]]
            );
            $tagAssignments++;
        }
    }
    
    echo "[✓] Updated {$postCount} posts with new tags ({$tagAssignments} total tag assignments)\n";
    
    echo "\n✅ Tags successfully reset!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
