<?php

function runMigrations() {
    try {
        // Get database connection
        $pdo = require __DIR__ . '/../config/database.php';
        
        // Read schema file
        $schemaPath = __DIR__ . '/../database/schema.sql';
        
        if (!file_exists($schemaPath)) {
            throw new Exception("Schema file not found: {$schemaPath}");
        }
        
        $schema = file_get_contents($schemaPath);
        
        if ($schema === false) {
            throw new Exception("Failed to read schema file");
        }
        
        // Split queries by semicolon
        $queries = array_filter(
            array_map('trim', explode(';', $schema)),
            function($q) { return !empty($q); }
        );
        
        $executedCount = 0;
        
        foreach ($queries as $query) {
            if (trim($query)) {
                try {
                    $pdo->exec($query);
                    $executedCount++;
                    $preview = substr($query, 0, 50);
                    echo "✓ Executed: " . $preview . "...\n";
                } catch (PDOException $error) {
                    echo "Migration error: " . $error->getMessage() . "\n";
                }
            }
        }
        
        echo "\n✅ Database migrations completed! ({$executedCount} queries executed)\n";
        return true;
        
    } catch (Exception $error) {
        echo "❌ Migration failed: " . $error->getMessage() . "\n";
        return false;
    }
}

// Run migrations if this file is executed directly
if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['PHP_SELF'] ?? '')) {
    runMigrations();
}
