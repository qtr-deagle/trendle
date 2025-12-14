#!/usr/bin/env php
<?php
/**
 * Simple PHP Development Server Runner
 * Keeps the server running and restarts on failure
 */

$port = 8000;
$host = '0.0.0.0';
$attempts = 0;
$maxAttempts = 5;

echo "[Server] Starting development server on $host:$port\n";

while ($attempts < $maxAttempts) {
    $cmd = "php -S $host:$port";
    echo "[Server] Attempt " . ($attempts + 1) . ": Running $cmd\n";

    passthru($cmd);

    $attempts++;
    echo "[Server] Server exited, waiting 2 seconds before retry...\n";
    sleep(2);
}

echo "[Server] Maximum restart attempts reached. Giving up.\n";
exit(1);
