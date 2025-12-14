<?php
// Simple database clear script
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'trendle';

try {
    $conn = new mysqli($host, $user, $password, $database);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Clear all follows
    $conn->query('DELETE FROM follows');
    
    // Reset followers and following counts
    $conn->query('UPDATE users SET followers = 0, following = 0');

    echo "Database cleared! All follows removed and counters reset.\n";
    
    $conn->close();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>