<?php

require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Services/AdminCategoryService.php';

use App\Services\AdminCategoryService;

try {
    $service = new AdminCategoryService();
    $result = $service->getAllCategories(1, 20, '', 'all');

    echo "✅ Categories fetched successfully!\n";
    echo "Total: " . $result['total'] . "\n";
    echo "Count: " . count($result['categories']) . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace:\n";
    echo $e->getTraceAsString() . "\n";
}
