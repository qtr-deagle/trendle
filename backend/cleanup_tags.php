<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = Database::getInstance();

// Delete problematic tags
$problematicSlugs = ['technologyADSAD', 'inspirationssADSASDAS', 'ASD'];

foreach ($problematicSlugs as $slug) {
    $tag = $db->execute('SELECT id FROM tags WHERE slug = ?', [$slug])->get_result()->fetch_assoc();
    if ($tag) {
        $db->execute('DELETE FROM post_tags WHERE tag_id = ?', [$tag['id']]);
        $db->execute('DELETE FROM tags WHERE id = ?', [$tag['id']]);
        echo "Deleted tag with slug: {$slug}\n";
    }
}

echo "Done cleaning up tags\n";
?>
