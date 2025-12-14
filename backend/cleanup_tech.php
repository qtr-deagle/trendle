<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = Database::getInstance();

// Delete the problematic technology tag
$tag = $db->execute('SELECT id FROM tags WHERE slug = ?', ['technology'])->get_result()->fetch_assoc();
if ($tag) {
    $db->execute('DELETE FROM post_tags WHERE tag_id = ?', [$tag['id']]);
    $db->execute('DELETE FROM tags WHERE id = ?', [$tag['id']]);
    echo "Deleted tag with slug: technology\n";
}

// Also delete technologyADSAD if it exists
$tag2 = $db->execute('SELECT id FROM tags WHERE name = ?', ['technologyADSAD'])->get_result()->fetch_assoc();
if ($tag2) {
    $db->execute('DELETE FROM post_tags WHERE tag_id = ?', [$tag2['id']]);
    $db->execute('DELETE FROM tags WHERE id = ?', [$tag2['id']]);
    echo "Deleted tag: technologyADSAD\n";
}

// Delete inspiration tag
$tag3 = $db->execute('SELECT id FROM tags WHERE name = ?', ['inspirationssADSASDASAS'])->get_result()->fetch_assoc();
if ($tag3) {
    $db->execute('DELETE FROM post_tags WHERE tag_id = ?', [$tag3['id']]);
    $db->execute('DELETE FROM tags WHERE id = ?', [$tag3['id']]);
    echo "Deleted tag: inspirationssADSASDASAS\n";
}

echo "Done\n";
?>
