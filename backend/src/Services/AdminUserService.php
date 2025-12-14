<?php

namespace App\Services;

use App\Config\Database;

/**
 * AdminUserService
 * 
 * Handles all admin-level user management operations including:
 * - Listing users with pagination and filtering
 * - Viewing user details with activity stats
 * - Banning/suspending users
 * - Activating/restoring users
 * - Promoting/demoting admin status
 * - Searching users by username, email, or display_name
 * 
 * Database interactions: users, posts, comments, follows, user_communities
 */
class AdminUserService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get paginated list of all users with optional filtering
     * 
     * @param int $page Current page number (1-based)
     * @param int $limit Records per page
     * @param string $search Optional search query (username, email, display_name)
     * @param string $status Filter by status ('active', 'inactive', 'admin')
     * @return array ['users' => [], 'total' => int, 'page' => int, 'limit' => int]
     */
    public function getAllUsers($page = 1, $limit = 20, $search = '', $status = 'all')
    {
        $offset = ($page - 1) * $limit;

        try {
            // Build query
            $baseQuery = 'FROM users WHERE 1=1';
            $params = [];

            if (!empty($search)) {
                $baseQuery .= ' AND (username LIKE ? OR email LIKE ? OR display_name LIKE ?)';
                $searchParam = '%' . $search . '%';
                $params = [$searchParam, $searchParam, $searchParam];
            }

            if ($status === 'admin') {
                $baseQuery .= ' AND is_admin = 1';
                $params[] = 1;
            }

            // Get total count
            $countStmt = $this->db->execute('SELECT COUNT(*) as total ' . $baseQuery, $params);
            $countResult = $countStmt->get_result();
            $total = (int)$countResult->fetch_assoc()['total'];

            // Get paginated users
            $query = 'SELECT id, username, email, display_name, avatar_url, bio, followers, 
                     following, is_admin, created_at, updated_at 
                     ' . $baseQuery . ' 
                     ORDER BY created_at DESC LIMIT ? OFFSET ?';

            $params[] = $limit;
            $params[] = $offset;

            $stmt = $this->db->execute($query, $params);
            $result = $stmt->get_result();

            $users = [];
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }

            return [
                'users' => $users,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ];
        } catch (\Exception $e) {
            error_log('Get all users error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get detailed information about a specific user
     * Includes activity statistics and community memberships
     * 
     * @param int $userId User ID
     * @return array User details with stats
     */
    public function getUserDetail($userId)
    {
        try {
            // Get user info
            $stmt = $this->db->execute(
                'SELECT id, username, email, display_name, avatar_url, bio, followers, 
                        following, is_admin, created_at, updated_at 
                 FROM users WHERE id = ?',
                [$userId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                throw new \Exception('User not found');
            }

            $user = $result->fetch_assoc();

            // Get post count
            $postStmt = $this->db->execute(
                'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
                [$userId]
            );
            $postCount = $postStmt->get_result()->fetch_assoc()['count'];

            // Get comment count
            $commentStmt = $this->db->execute(
                'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
                [$userId]
            );
            $commentCount = $commentStmt->get_result()->fetch_assoc()['count'];

            // Get communities count
            $communityStmt = $this->db->execute(
                'SELECT COUNT(*) as count FROM user_communities WHERE user_id = ?',
                [$userId]
            );
            $communityCount = $communityStmt->get_result()->fetch_assoc()['count'];

            $user['posts_count'] = (int)$postCount;
            $user['comments_count'] = (int)$commentCount;
            $user['communities_count'] = (int)$communityCount;

            return $user;
        } catch (\Exception $e) {
            error_log('Get user detail error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Ban/Deactivate a user account
     * Logs the admin action to admin_logs table
     * 
     * @param int $userId User ID to ban
     * @param int $adminId Admin user ID performing the action
     * @param string $reason Reason for ban
     * @return array Success response
     */
    public function banUser($userId, $adminId, $reason = '')
    {
        try {
            // Log admin action
            $logData = json_encode(['reason' => $reason, 'target_user_id' => $userId]);
            $this->db->execute(
                'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())',
                [$adminId, 'ban_user', 'user', $userId, $logData]
            );

            return ['success' => true, 'message' => 'User ban logged successfully'];
        } catch (\Exception $e) {
            error_log('Ban user error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Reactivate a banned user account
     * Logs the admin action to admin_logs table
     * 
     * @param int $userId User ID to activate
     * @param int $adminId Admin user ID performing the action
     * @return array Success response
     */
    public function activateUser($userId, $adminId)
    {
        try {
            // Log admin action
            $this->db->execute(
                'INSERT INTO admin_logs (admin_id, action, target_type, target_id, created_at) 
                 VALUES (?, ?, ?, ?, NOW())',
                [$adminId, 'activate_user', 'user', $userId]
            );

            return ['success' => true, 'message' => 'User activation logged successfully'];
        } catch (\Exception $e) {
            error_log('Activate user error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Promote a user to admin status
     * 
     * @param int $userId User ID to promote
     * @param int $adminId Admin user ID performing the action
     * @return array Success response
     */
    public function promoteToAdmin($userId, $adminId)
    {
        try {
            $stmt = $this->db->execute(
                'UPDATE users SET is_admin = 1, updated_at = NOW() WHERE id = ?',
                [$userId]
            );

            $this->db->execute(
                'INSERT INTO admin_logs (admin_id, action, target_type, target_id, created_at) 
                 VALUES (?, ?, ?, ?, NOW())',
                [$adminId, 'promote_to_admin', 'user', $userId]
            );

            return ['success' => true, 'message' => 'User promoted to admin'];
        } catch (\Exception $e) {
            error_log('Promote user error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Demote an admin user to regular user
     * 
     * @param int $userId User ID to demote
     * @param int $adminId Admin user ID performing the action
     * @return array Success response
     */
    public function demoteFromAdmin($userId, $adminId)
    {
        try {
            $stmt = $this->db->execute(
                'UPDATE users SET is_admin = 0, updated_at = NOW() WHERE id = ?',
                [$userId]
            );

            $this->db->execute(
                'INSERT INTO admin_logs (admin_id, action, target_type, target_id, created_at) 
                 VALUES (?, ?, ?, ?, NOW())',
                [$adminId, 'demote_from_admin', 'user', $userId]
            );

            return ['success' => true, 'message' => 'User demoted from admin'];
        } catch (\Exception $e) {
            error_log('Demote user error: ' . $e->getMessage());
            throw $e;
        }
    }
}
