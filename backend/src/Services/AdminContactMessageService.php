<?php

namespace App\Services;

use App\Config\Database;

/**
 * AdminContactMessageService
 * 
 * Manages contact/support messages from users:
 * - List contact messages with status filtering
 * - View detailed message content
 * - Mark messages as read
 * - Send admin replies to messages
 * - Filter messages by status (unread, read, resolved)
 * - Search messages by sender email or name
 * 
 * Database interactions: contact_messages, users
 */
class AdminContactMessageService {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Get all contact messages with optional filtering
     * 
     * @param int $page Current page
     * @param int $limit Records per page
     * @param string $status Filter by status ('unread', 'read', 'resolved', 'all')
     * @param string $search Optional search in name or email
     * @return array Messages with pagination
     */
    public function getAllMessages($page = 1, $limit = 20, $status = 'unread', $search = '') {
        $offset = ($page - 1) * $limit;
        
        try {
            $baseQuery = 'FROM contact_messages WHERE 1=1';
            $params = [];
            
            if ($status !== 'all') {
                $baseQuery .= ' AND status = ?';
                $params[] = $status;
            }
            
            if (!empty($search)) {
                $baseQuery .= ' AND (name LIKE ? OR email LIKE ?)';
                $searchParam = '%' . $search . '%';
                $params[] = $searchParam;
                $params[] = $searchParam;
            }
            
            // Get total count
            $countStmt = $this->db->execute('SELECT COUNT(*) as total ' . $baseQuery, $params);
            $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
            
            // Get paginated messages
            $query = 'SELECT cm.id, cm.user_id, cm.email, cm.name, cm.subject, cm.status, 
                             cm.assigned_admin_id, cm.admin_reply, cm.created_at, cm.replied_at,
                             u.username as user_username, u.avatar_url,
                             aa.username as assigned_admin_username
                     FROM contact_messages cm
                     LEFT JOIN users u ON cm.user_id = u.id
                     LEFT JOIN users aa ON cm.assigned_admin_id = aa.id
                     ' . $baseQuery . '
                     ORDER BY 
                       CASE WHEN cm.status = "unread" THEN 0 WHEN cm.status = "read" THEN 1 ELSE 2 END,
                       cm.created_at DESC
                     LIMIT ? OFFSET ?';
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->execute($query, $params);
            $result = $stmt->get_result();
            
            $messages = [];
            while ($row = $result->fetch_assoc()) {
                $messages[] = $row;
            }
            
            return [
                'messages' => $messages,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ];
        } catch (\Exception $e) {
            error_log('Get messages error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get detailed information about a specific message
     * 
     * @param int $messageId Message ID
     * @return array Complete message details
     */
    public function getMessageDetail($messageId) {
        try {
            $stmt = $this->db->execute(
                'SELECT cm.id, cm.user_id, cm.email, cm.name, cm.subject, cm.message, 
                        cm.status, cm.assigned_admin_id, cm.admin_reply, cm.created_at, cm.replied_at,
                        u.username as user_username, u.avatar_url,
                        aa.username as assigned_admin_username
                 FROM contact_messages cm
                 LEFT JOIN users u ON cm.user_id = u.id
                 LEFT JOIN users aa ON cm.assigned_admin_id = aa.id
                 WHERE cm.id = ?',
                [$messageId]
            );
            
            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                throw new \Exception('Message not found');
            }
            
            return $result->fetch_assoc();
        } catch (\Exception $e) {
            error_log('Get message detail error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Mark message as read and assign to admin
     * 
     * @param int $messageId Message ID
     * @param int $adminId Admin user ID
     * @return array Success response
     */
    public function markAsRead($messageId, $adminId) {
        try {
            $this->db->execute(
                'UPDATE contact_messages SET status = "read", assigned_admin_id = ? WHERE id = ? AND status = "unread"',
                [$adminId, $messageId]
            );
            
            return ['success' => true, 'message' => 'Message marked as read'];
        } catch (\Exception $e) {
            error_log('Mark as read error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send admin reply to a contact message
     * Updates message status to 'resolved'
     * 
     * @param int $messageId Message ID
     * @param string $replyText Admin reply text
     * @param int $adminId Admin user ID
     * @return array Success response with updated message
     */
    public function sendReply($messageId, $replyText, $adminId) {
        try {
            // Validate input
            if (empty($replyText)) {
                throw new \Exception('Reply text cannot be empty');
            }
            
            // Get message details
            $message = $this->getMessageDetail($messageId);
            
            // Update message with reply
            $this->db->execute(
                'UPDATE contact_messages SET admin_reply = ?, status = "resolved", 
                        assigned_admin_id = ?, replied_at = NOW() WHERE id = ?',
                [$replyText, $adminId, $messageId]
            );
            
            // Log admin action
            $logData = json_encode([
                'message_id' => $messageId,
                'recipient_email' => $message['email'],
                'reply_length' => strlen($replyText)
            ]);
            
            $this->db->execute(
                'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())',
                [$adminId, 'send_reply_to_message', 'contact_message', $messageId, $logData]
            );
            
            // TODO: In a real application, send email to user with the reply
            // This would involve integrating with an email service like SendGrid, AWS SES, etc.
            
            return ['success' => true, 'message' => 'Reply sent successfully'];
        } catch (\Exception $e) {
            error_log('Send reply error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Mark message as resolved
     * 
     * @param int $messageId Message ID
     * @param int $adminId Admin user ID
     * @return array Success response
     */
    public function markAsResolved($messageId, $adminId) {
        try {
            $this->db->execute(
                'UPDATE contact_messages SET status = "resolved", assigned_admin_id = ? WHERE id = ?',
                [$adminId, $messageId]
            );
            
            return ['success' => true, 'message' => 'Message marked as resolved'];
        } catch (\Exception $e) {
            error_log('Mark as resolved error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get message statistics
     * 
     * @return array Stats by status
     */
    public function getMessageStats() {
        try {
            $stmt = $this->db->execute(
                'SELECT status, COUNT(*) as count FROM contact_messages GROUP BY status'
            );
            
            $stats = [
                'total' => 0,
                'unread' => 0,
                'read' => 0,
                'resolved' => 0
            ];
            
            while ($row = $stmt->get_result()->fetch_assoc()) {
                $stats[$row['status']] = (int)$row['count'];
                $stats['total'] += (int)$row['count'];
            }
            
            return $stats;
        } catch (\Exception $e) {
            error_log('Get message stats error: ' . $e->getMessage());
            throw $e;
        }
    }
}
