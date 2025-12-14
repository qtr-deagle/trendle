<?php

namespace App\Services;

use App\Config\Database;

/**
 * AdminLogService
 * 
 * Manages admin activity logs:
 * - List all admin actions with filtering
 * - View detailed log information
 * - Search logs by admin user or action type
 * - Generate audit reports
 * - Track changes to users, categories, tags, reports, etc.
 * 
 * Database interactions: admin_logs, users
 */
class AdminLogService {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Get all admin logs with optional filtering
     * 
     * @param int $page Current page
     * @param int $limit Records per page
     * @param int $adminId Filter by admin user (optional)
     * @param string $action Filter by action type (optional)
     * @param string $targetType Filter by target type (user, category, tag, report, etc.)
     * @param string $startDate Start date for filtering (YYYY-MM-DD)
     * @param string $endDate End date for filtering (YYYY-MM-DD)
     * @return array Logs with pagination
     */
    public function getAllLogs($page = 1, $limit = 50, $adminId = null, $action = '', 
                               $targetType = '', $startDate = '', $endDate = '') {
        $offset = ($page - 1) * $limit;
        
        try {
            $baseQuery = 'FROM admin_logs WHERE 1=1';
            $params = [];
            
            if (!empty($adminId)) {
                $baseQuery .= ' AND admin_id = ?';
                $params[] = $adminId;
            }
            
            if (!empty($action)) {
                $baseQuery .= ' AND action = ?';
                $params[] = $action;
            }
            
            if (!empty($targetType)) {
                $baseQuery .= ' AND target_type = ?';
                $params[] = $targetType;
            }
            
            if (!empty($startDate)) {
                $baseQuery .= ' AND DATE(created_at) >= ?';
                $params[] = $startDate;
            }
            
            if (!empty($endDate)) {
                $baseQuery .= ' AND DATE(created_at) <= ?';
                $params[] = $endDate;
            }
            
            // Get total count
            $countStmt = $this->db->execute('SELECT COUNT(*) as total ' . $baseQuery, $params);
            $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
            
            // Get paginated logs
            $query = 'SELECT al.id, al.admin_id, al.action, al.target_type, al.target_id, 
                             al.details, al.created_at, u.username, u.avatar_url
                     FROM admin_logs al
                     LEFT JOIN users u ON al.admin_id = u.id
                     ' . $baseQuery . '
                     ORDER BY al.created_at DESC
                     LIMIT ? OFFSET ?';
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->execute($query, $params);
            $result = $stmt->get_result();
            
            $logs = [];
            while ($row = $result->fetch_assoc()) {
                // Parse JSON details
                if (!empty($row['details'])) {
                    try {
                        $row['details'] = json_decode($row['details'], true);
                    } catch (\Exception $e) {
                        // Keep as is if not valid JSON
                    }
                }
                $logs[] = $row;
            }
            
            return [
                'logs' => $logs,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ];
        } catch (\Exception $e) {
            error_log('Get logs error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get detailed log entry
     * 
     * @param int $logId Log ID
     * @return array Complete log details
     */
    public function getLogDetail($logId) {
        try {
            $stmt = $this->db->execute(
                'SELECT al.id, al.admin_id, al.action, al.target_type, al.target_id, 
                        al.details, al.created_at, u.username, u.email, u.avatar_url
                 FROM admin_logs al
                 LEFT JOIN users u ON al.admin_id = u.id
                 WHERE al.id = ?',
                [$logId]
            );
            
            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                throw new \Exception('Log entry not found');
            }
            
            $log = $result->fetch_assoc();
            
            // Parse JSON details
            if (!empty($log['details'])) {
                try {
                    $log['details'] = json_decode($log['details'], true);
                } catch (\Exception $e) {
                    // Keep as is if not valid JSON
                }
            }
            
            return $log;
        } catch (\Exception $e) {
            error_log('Get log detail error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get activity logs for a specific admin user
     * 
     * @param int $adminId Admin user ID
     * @param int $limit Number of recent logs to retrieve
     * @return array Recent activity logs
     */
    public function getAdminActivity($adminId, $limit = 30) {
        try {
            $stmt = $this->db->execute(
                'SELECT al.id, al.action, al.target_type, al.target_id, al.details, al.created_at
                 FROM admin_logs al
                 WHERE al.admin_id = ?
                 ORDER BY al.created_at DESC
                 LIMIT ?',
                [$adminId, $limit]
            );
            
            $result = $stmt->get_result();
            $logs = [];
            
            while ($row = $result->fetch_assoc()) {
                if (!empty($row['details'])) {
                    try {
                        $row['details'] = json_decode($row['details'], true);
                    } catch (\Exception $e) {
                        // Keep as is
                    }
                }
                $logs[] = $row;
            }
            
            return $logs;
        } catch (\Exception $e) {
            error_log('Get admin activity error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get activity statistics
     * 
     * @param string $startDate Start date (YYYY-MM-DD)
     * @param string $endDate End date (YYYY-MM-DD)
     * @return array Activity stats by action type
     */
    public function getActivityStats($startDate = '', $endDate = '') {
        try {
            $baseQuery = 'FROM admin_logs WHERE 1=1';
            $params = [];
            
            if (!empty($startDate)) {
                $baseQuery .= ' AND DATE(created_at) >= ?';
                $params[] = $startDate;
            }
            
            if (!empty($endDate)) {
                $baseQuery .= ' AND DATE(created_at) <= ?';
                $params[] = $endDate;
            }
            
            // Get total logs
            $totalStmt = $this->db->execute('SELECT COUNT(*) as total ' . $baseQuery, $params);
            $total = (int)$totalStmt->get_result()->fetch_assoc()['total'];
            
            // Get logs by action
            $actionQuery = 'SELECT action, COUNT(*) as count ' . $baseQuery . ' GROUP BY action';
            $actionStmt = $this->db->execute($actionQuery, $params);
            
            $byAction = [];
            while ($row = $actionStmt->get_result()->fetch_assoc()) {
                $byAction[$row['action']] = (int)$row['count'];
            }
            
            // Get logs by target type
            $targetQuery = 'SELECT target_type, COUNT(*) as count ' . $baseQuery . ' GROUP BY target_type';
            $targetStmt = $this->db->execute($targetQuery, $params);
            
            $byTargetType = [];
            while ($row = $targetStmt->get_result()->fetch_assoc()) {
                $byTargetType[$row['target_type']] = (int)$row['count'];
            }
            
            // Get top admins
            $adminQuery = 'SELECT u.id, u.username, COUNT(*) as action_count ' . 
                         'FROM admin_logs al JOIN users u ON al.admin_id = u.id ' .
                         'WHERE 1=1';
            
            $adminParams = $params;
            if (!empty($startDate)) {
                $adminQuery .= ' AND DATE(al.created_at) >= ?';
                $adminParams[] = $startDate;
            }
            if (!empty($endDate)) {
                $adminQuery .= ' AND DATE(al.created_at) <= ?';
                $adminParams[] = $endDate;
            }
            
            $adminQuery .= ' GROUP BY u.id ORDER BY action_count DESC LIMIT 10';
            
            $adminStmt = $this->db->execute($adminQuery, $adminParams);
            
            $topAdmins = [];
            while ($row = $adminStmt->get_result()->fetch_assoc()) {
                $topAdmins[] = $row;
            }
            
            return [
                'total_logs' => $total,
                'by_action' => $byAction,
                'by_target_type' => $byTargetType,
                'top_admins' => $topAdmins
            ];
        } catch (\Exception $e) {
            error_log('Get activity stats error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a log entry (used internally by other services)
     * 
     * @param int $adminId Admin user ID
     * @param string $action Action performed
     * @param string $targetType Type of target (user, post, category, tag, etc.)
     * @param int $targetId ID of the target
     * @param array $details Additional details as JSON
     * @return int Log entry ID
     */
    public function createLog($adminId, $action, $targetType, $targetId, $details = []) {
        try {
            $detailsJson = !empty($details) ? json_encode($details) : null;
            
            $stmt = $this->db->execute(
                'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())',
                [$adminId, $action, $targetType, $targetId, $detailsJson]
            );
            
            return $this->db->getConnection()->insert_id;
        } catch (\Exception $e) {
            error_log('Create log error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get audit trail for a specific resource
     * Shows all changes made to a particular entity
     * 
     * @param string $targetType Type of resource (user, category, tag, report)
     * @param int $targetId Resource ID
     * @return array Audit trail
     */
    public function getAuditTrail($targetType, $targetId) {
        try {
            $stmt = $this->db->execute(
                'SELECT al.id, al.admin_id, al.action, al.details, al.created_at, u.username, u.avatar_url
                 FROM admin_logs al
                 LEFT JOIN users u ON al.admin_id = u.id
                 WHERE al.target_type = ? AND al.target_id = ?
                 ORDER BY al.created_at DESC',
                [$targetType, $targetId]
            );
            
            $result = $stmt->get_result();
            $trail = [];
            
            while ($row = $result->fetch_assoc()) {
                if (!empty($row['details'])) {
                    try {
                        $row['details'] = json_decode($row['details'], true);
                    } catch (\Exception $e) {
                        // Keep as is
                    }
                }
                $trail[] = $row;
            }
            
            return $trail;
        } catch (\Exception $e) {
            error_log('Get audit trail error: ' . $e->getMessage());
            throw $e;
        }
    }
}
