<?php

require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Services/AdminReportService.php';
require_once __DIR__ . '/src/Services/AdminContactMessageService.php';
require_once __DIR__ . '/src/Services/AdminLogService.php';

use App\Services\AdminReportService;
use App\Services\AdminContactMessageService;
use App\Services\AdminLogService;

try {
    echo "Testing AdminReportService...\n";
    $service = new AdminReportService();
    $result = $service->getAllReports(1, 20, 'pending', 'all', '');
    echo "✅ Reports: " . count($result['reports']) . " / " . $result['total'] . "\n";

    echo "\nTesting AdminContactMessageService...\n";
    $service = new AdminContactMessageService();
    $result = $service->getAllMessages(1, 20, 'unread', '');
    echo "✅ Messages: " . count($result['messages']) . " / " . $result['total'] . "\n";

    echo "\nTesting AdminLogService...\n";
    $service = new AdminLogService();
    $result = $service->getAllLogs(1, 20);
    echo "✅ Logs: " . count($result['logs']) . " / " . $result['total'] . "\n";

    echo "\n✅ All services working!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
