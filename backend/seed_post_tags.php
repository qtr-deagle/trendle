<?php
/**
 * Seed tags for all posts
 * Creates 12 life-related tags and assigns 0-12 random tags to each post
 */

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance();
    
    // The 12 life-related tags
    $genres = ["Travel", "Fitness", "Cooking", "Gaming", "Reading", "Photography", "Fashion", "Nature", "Technology", "Art", "Wellness", "Design"];
    
    echo "=== Creating Life-Related Tags ===\n";
    
    // Create tags if they don't exist
    $tagIds = [];
    foreach ($genres as $genre) {
        $slug = strtolower(str_replace([' ', '-'], '-', $genre));
        
        // Check if tag exists
        $existingTag = $db->execute(
            'SELECT id FROM tags WHERE name = ?',
            [$genre]
        )->get_result()->fetch_assoc();
        
        if ($existingTag) {
            $tagIds[$genre] = $existingTag['id'];
            echo "[✓] Tag '{$genre}' already exists (ID: {$existingTag['id']})\n";
        } else {
            // Create new tag
            $insertStmt = $db->execute(
                'INSERT INTO tags (name, slug, description, is_active) VALUES (?, ?, ?, 1)',
                [$genre, $slug, "{$genre} lifestyle content"]
            );
            
            // Get the inserted ID
            $newTag = $db->execute(
                'SELECT id FROM tags WHERE name = ?',
                [$genre]
            )->get_result()->fetch_assoc();
            
            $tagIds[$genre] = $newTag['id'];
            echo "[✓] Created tag '{$genre}' (ID: {$newTag['id']})\n";
        }
    }
    
    echo "\n=== Seeding Post Tags ===\n";
    
    // Get all posts
    $postsResult = $db->execute('SELECT id FROM posts ORDER BY id')->get_result();
    
    $postCount = 0;
    $totalTagsAdded = 0;
    
    while ($postRow = $postsResult->fetch_assoc()) {
        $postId = $postRow['id'];
        
        // Random number of tags (0-8)
        $numTags = rand(0, 8);
        
        if ($numTags === 0) {
            echo "[✓] Post #{$postId} -> 0 tags\n";
            $postCount++;
            continue;
        }
        
        // Get random genres
        $randomGenres = array_rand($genres, min($numTags, count($genres)));
        if (!is_array($randomGenres)) {
            $randomGenres = [$randomGenres];
        }
        
        $tagsAdded = 0;
        foreach ($randomGenres as $index) {
            $genre = $genres[$index];
            $tagId = $tagIds[$genre];
            
            try {
                // Insert post-tag relationship
                $db->execute(
                    'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)',
                    [$postId, $tagId]
                );
                $tagsAdded++;
                $totalTagsAdded++;
            } catch (Exception $e) {
                // Duplicate tag for post, skip
            }
        }
        
        echo "[✓] Post #{$postId} -> {$tagsAdded} tags\n";
        $postCount++;
    }
    
    echo "\n=== Summary ===\n";
    echo "Posts tagged: {$postCount}\n";
    echo "Total tag assignments: {$totalTagsAdded}\n";
    echo "All posts now have 0-8 genre tags!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
