<?php
// Development server router
if (preg_match('/\.(?:jpg|jpeg|png|gif|css|js|txt)$/', $_SERVER["REQUEST_URI"])) {
    return false;    // serve the requested resource as-is.
} else {
    require_once __DIR__ . '/index.php';
}
