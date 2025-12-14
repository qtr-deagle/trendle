<?php

namespace App\Services;

use App\Config\Database;

/**
 * AdminReportService
 * 
 * Manages content moderation and user reports:
 * - List reports with filtering by status and reason
 * - View detailed report information with reported content
 * - Update report status (pending, resolved, dismissed)
 * - Assign reports to admin moderators
 * - Add resolution notes to reports
 * - Take actions on reported content (remove, warn, suspend)
 * 
 * Database interactions: reports, users, posts, comments, admin_logs
 */
class AdminReportService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get all reports with optional filtering and pagination
     * 
     * @param int $page Current page
     * @param int $limit Records per page
     * @param string $status Filter by status ('pending', 'resolved', 'dismissed', 'all')
     * @param string $reason Filter by reason
     * @param string $search Search in report content
     * @return array Reports list with pagination
     */
    public function getAllReports($page = 1, $limit = 20, $status = 'pending', $reason = 'all', $search = '')
    {
        $offset = ($page - 1) * $limit;

        try {
            $baseQuery = 'WHERE 1=1';
            $params = [];

            if ($status !== 'all') {
                $baseQuery .= ' AND status = ?';
                $params[] = $status;
            }

            if ($reason !== 'all') {
                $baseQuery .= ' AND reason = ?';
                $params[] = $reason;
            }

            if (!empty($search)) {
                $baseQuery .= ' AND description LIKE ?';
                $params[] = '%' . $search . '%';
            }

            // Get total count
            $countStmt = $this->db->execute('SELECT COUNT(*) as total FROM reports ' . $baseQuery, $params);
            $total = (int)$countStmt->get_result()->fetch_assoc()['total'];

            // Get paginated reports
            $query = 'SELECT r.id, r.reporter_id, r.reported_user_id, r.post_id, r.comment_id, 
                             r.reason, r.description, r.status, r.admin_id, r.admin_notes, 
                             r.created_at, r.updated_at,
                             ur.username as reporter_username, ur.avatar_url as reporter_avatar,
                             uu.username as reported_username, uu.avatar_url as reported_avatar,
                             aa.username as admin_username
                     FROM reports r
                     LEFT JOIN users ur ON r.reporter_id = ur.id
                     LEFT JOIN users uu ON r.reported_user_id = uu.id
                     LEFT JOIN users aa ON r.admin_id = aa.id
                     ' . $baseQuery . '
                     ORDER BY 
                       CASE WHEN r.status = "pending" THEN 0 ELSE 1 END,
                       r.created_at DESC
                     LIMIT ? OFFSET ?';

            $params[] = $limit;
            $params[] = $offset;

            $stmt = $this->db->execute($query, $params);
            $result = $stmt->get_result();

            $reports = [];
            while ($row = $result->fetch_assoc()) {
                $reports[] = $row;
            }

            return [
                'reports' => $reports,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ];
        } catch (\Exception $e) {
            error_log('Get reports error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get detailed information about a specific report
     * Includes reported content details
     * 
     * @param int $reportId Report ID
     * @return array Complete report details
     */
    public function getReportDetail($reportId)
    {
        try {
            $stmt = $this->db->execute(
                'SELECT r.id, r.reporter_id, r.reported_user_id, r.post_id, r.comment_id, 
                        r.reason, r.description, r.status, r.assigned_admin_id, r.resolution_notes, 
                        r.created_at, r.resolved_at,
                        ur.username as reporter_username, ur.avatar_url as reporter_avatar,
                        uu.username as reported_username, uu.avatar_url as reported_avatar,
                        aa.username as assigned_admin_username
                 FROM reports r
                 LEFT JOIN users ur ON r.reporter_id = ur.id
                 LEFT JOIN users uu ON r.reported_user_id = uu.id
                 LEFT JOIN users aa ON r.assigned_admin_id = aa.id
                 WHERE r.id = ?',
                [$reportId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                throw new \Exception('Report not found');
            }

            $report = $result->fetch_assoc();

            // Get reported content if applicable
            $report['reported_content'] = null;

            if ($report['post_id']) {
                $postStmt = $this->db->execute(
                    'SELECT p.id, p.content, p.image_url, p.created_at, u.username, u.avatar_url 
                     FROM posts p
                     JOIN users u ON p.author_id = u.id
                     WHERE p.id = ?',
                    [$report['post_id']]
                );

                $postResult = $postStmt->get_result();
                if ($postResult->num_rows > 0) {
                    $report['reported_content'] = [
                        'type' => 'post',
                        'data' => $postResult->fetch_assoc()
                    ];
                }
            } elseif ($report['comment_id']) {
                $commentStmt = $this->db->execute(
                    'SELECT c.id, c.content, c.created_at, u.username, u.avatar_url 
                     FROM comments c
                     JOIN users u ON c.author_id = u.id
                     WHERE c.id = ?',
                    [$report['comment_id']]
                );

                $commentResult = $commentStmt->get_result();
                if ($commentResult->num_rows > 0) {
                    $report['reported_content'] = [
                        'type' => 'comment',
                        'data' => $commentResult->fetch_assoc()
                    ];
                }
            }

            return $report;
        } catch (\Exception $e) {
            error_log('Get report detail error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update report status and assign to admin
     * 
     * @param int $reportId Report ID
     * @param string $status New status ('pending', 'resolved', 'dismissed')
     * @param int $adminId Admin handling the report
     * @param string $resolutionNotes Notes about resolution
     * @return array Updated report data
     */
    public function updateReportStatus($reportId, $status, $adminId, $resolutionNotes = '')
    {
        try {
            if (!in_array($status, ['pending', 'resolved', 'dismissed'])) {
                throw new \Exception('Invalid status');
            }

            $resolvedAt = ($status !== 'pending') ? date('Y-m-d H:i:s') : null;

            $this->db->execute(
                'UPDATE reports SET status = ?, assigned_admin_id = ?, resolution_notes = ?, resolved_at = ? 
                 WHERE id = ?',
                [$status, $adminId, $resolutionNotes, $resolvedAt, $reportId]
            );

            // Log admin action
            $logData = json_encode([
                'report_id' => $reportId,
                'new_status' => $status,
                'notes' => $resolutionNotes
            ]);

            $this->db->execute(
                'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())',
                [$adminId, 'update_report_status', 'report', $reportId, $logData]
            );

            return ['success' => true, 'message' => 'Report status updated'];
        } catch (\Exception $e) {
            error_log('Update report status error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Approve a report and remove reported content
     * 
     * @param int $reportId Report ID
     * @param int $adminId Admin approving the report
     * @param string $action Action to take ('remove_content', 'suspend_user', 'warn_user')
     * @param string $notes Resolution notes
     * @return array Success response
     */
    public function approveReport($reportId, $adminId, $action = 'remove_content', $notes = '')
    {
        try {
            $report = $this->getReportDetail($reportId);

            // Take action based on type
            if ($report['post_id'] && $action === 'remove_content') {
                // Mark post as deleted
                $this->db->execute(
                    'UPDATE posts SET is_deleted = 1 WHERE id = ?',
                    [$report['post_id']]
                );
            } elseif ($report['comment_id'] && $action === 'remove_content') {
                // Mark comment as deleted
                $this->db->execute(
                    'UPDATE comments SET is_deleted = 1 WHERE id = ?',
                    [$report['comment_id']]
                );
            } elseif ($action === 'suspend_user' && $report['reported_user_id']) {
                // Suspend the reported user
                $this->db->execute(
                    'UPDATE users SET is_active = 0 WHERE id = ?',
                    [$report['reported_user_id']]
                );
            }

            // Update report status
            $this->updateReportStatus($reportId, 'resolved', $adminId, $notes);

            return ['success' => true, 'message' => 'Report approved and action taken'];
        } catch (\Exception $e) {
            error_log('Approve report error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Dismiss a report (not taking any action)
     * 
     * @param int $reportId Report ID
     * @param int $adminId Admin dismissing the report
     * @param string $reason Reason for dismissal
     * @return array Success response
     */
    public function dismissReport($reportId, $adminId, $reason = '')
    {
        try {
            $this->updateReportStatus($reportId, 'dismissed', $adminId, 'Dismissed: ' . $reason);
            return ['success' => true, 'message' => 'Report dismissed'];
        } catch (\Exception $e) {
            error_log('Dismiss report error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get report statistics
     * 
     * @return array Stats including pending, resolved, by reason
     */
    public function getReportStats()
    {
        try {
            // Total reports
            $totalStmt = $this->db->execute('SELECT COUNT(*) as total FROM reports');
            $total = (int)$totalStmt->get_result()->fetch_assoc()['total'];

            // Pending reports
            $pendingStmt = $this->db->execute(
                'SELECT COUNT(*) as total FROM reports WHERE status = "pending"'
            );
            $pending = (int)$pendingStmt->get_result()->fetch_assoc()['total'];

            // Reports by reason
            $reasonStmt = $this->db->execute(
                'SELECT reason, COUNT(*) as count FROM reports WHERE status = "pending" GROUP BY reason'
            );

            $byReason = [];
            while ($row = $reasonStmt->get_result()->fetch_assoc()) {
                $byReason[$row['reason']] = (int)$row['count'];
            }

            return [
                'total' => $total,
                'pending' => $pending,
                'resolved' => $total - $pending,
                'by_reason' => $byReason
            ];
        } catch (\Exception $e) {
            error_log('Get report stats error: ' . $e->getMessage());
            throw $e;
        }
    }
}
