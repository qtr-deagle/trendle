<?php
require 'src/Config/Database.php';
require 'src/Services/UserPostService.php';
use App\Services\UserPostService;
$result = UserPostService::getPostsByTags(123, 2, 0);
echo json_encode($result['posts'][0], JSON_PRETTY_PRINT);
?>
