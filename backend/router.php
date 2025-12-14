<?php
// Simple router for PHP development server
// Serves static files, otherwise routes to index.php

$requested_file = __DIR__ . $_SERVER['REQUEST_URI'];

// If it's a file that exists and is not a directory, serve it
if (is_file($requested_file)) {
    return false; // Let PHP dev server serve the static file
}

// Otherwise route to index.php
require __DIR__ . '/index.php';
