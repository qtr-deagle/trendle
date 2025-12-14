<?php
require_once __DIR__ . '/src/Config/Database.php';
use App\Config\Database;

$db = Database::getInstance();
$tags = $db->execute("SELECT * FROM tags")->get_result();
while($t = $tags->fetch_assoc()) {
    echo $t["name"] . " -> " . $t["slug"] . "\n";
}
?>
