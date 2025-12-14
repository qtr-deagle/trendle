<?php

namespace App\Services;

use App\Config\Database;

class CommunityService
{

    /**
     * Get all communities with optional filtering
     */
    public static function getAllCommunities($limit = 20, $offset = 0)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT id, name, description, avatar_url, member_count, created_at
                 FROM communities
                 ORDER BY member_count DESC
                 LIMIT ? OFFSET ?',
                [$limit, $offset]
            );

            $result = $stmt->get_result();
            $communities = [];

            while ($row = $result->fetch_assoc()) {
                $communities[] = self::formatCommunityRow($row);
            }

            return [
                'success' => true,
                'communities' => $communities,
                'count' => count($communities)
            ];
        } catch (\Exception $e) {
            error_log('Get all communities error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch communities'
            ];
        }
    }

    /**
     * Get communities for the current user
     */
    public static function getUserCommunities($userId)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT c.id, c.name, c.description, c.avatar_url, c.member_count, c.created_at
                 FROM communities c
                 JOIN user_communities uc ON c.id = uc.community_id
                 WHERE uc.user_id = ?
                 ORDER BY c.name ASC',
                [$userId]
            );

            $result = $stmt->get_result();
            $communities = [];

            while ($row = $result->fetch_assoc()) {
                $communities[] = self::formatCommunityRow($row);
            }

            return [
                'success' => true,
                'communities' => $communities,
                'count' => count($communities)
            ];
        } catch (\Exception $e) {
            error_log('Get user communities error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch user communities'
            ];
        }
    }

    /**
     * Get a single community with details
     */
    public static function getCommunityDetail($communityId, $userId = null)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT id, name, description, avatar_url, member_count, created_at
                 FROM communities
                 WHERE id = ?',
                [$communityId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                return [
                    'success' => false,
                    'error' => 'Community not found'
                ];
            }

            $community = $result->fetch_assoc();
            $formatted = self::formatCommunityRow($community);

            // Check if user is member
            if ($userId) {
                $memberStmt = $db->execute(
                    'SELECT id FROM user_communities WHERE user_id = ? AND community_id = ?',
                    [$userId, $communityId]
                );
                $formatted['isMember'] = $memberStmt->get_result()->num_rows > 0;
            } else {
                $formatted['isMember'] = false;
            }

            return [
                'success' => true,
                'community' => $formatted
            ];
        } catch (\Exception $e) {
            error_log('Get community detail error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch community'
            ];
        }
    }

    /**
     * Create a new community
     */
    public static function createCommunity($name, $description = null, $avatarUrl = null)
    {
        try {
            if (empty($name)) {
                return [
                    'success' => false,
                    'error' => 'Community name cannot be empty'
                ];
            }

            $db = Database::getInstance();

            // Check if community name already exists
            $existStmt = $db->execute(
                'SELECT id FROM communities WHERE name = ?',
                [$name]
            );
            if ($existStmt->get_result()->num_rows > 0) {
                return [
                    'success' => false,
                    'error' => 'Community name already exists'
                ];
            }

            $stmt = $db->execute(
                'INSERT INTO communities (name, description, avatar_url) VALUES (?, ?, ?)',
                [$name, $description, $avatarUrl]
            );

            $communityId = $db->getConnection()->insert_id;

            return [
                'success' => true,
                'message' => 'Community created successfully',
                'community_id' => $communityId
            ];
        } catch (\Exception $e) {
            error_log('Create community error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to create community'
            ];
        }
    }

    /**
     * Join a community
     */
    public static function joinCommunity($userId, $communityId)
    {
        try {
            $db = Database::getInstance();

            // Check if community exists
            $communityStmt = $db->execute(
                'SELECT id FROM communities WHERE id = ?',
                [$communityId]
            );
            if ($communityStmt->get_result()->num_rows === 0) {
                return [
                    'success' => false,
                    'error' => 'Community not found'
                ];
            }

            // Check if already a member
            $memberStmt = $db->execute(
                'SELECT id FROM user_communities WHERE user_id = ? AND community_id = ?',
                [$userId, $communityId]
            );
            if ($memberStmt->get_result()->num_rows > 0) {
                return [
                    'success' => false,
                    'error' => 'Already a member'
                ];
            }

            // Add membership
            $db->execute(
                'INSERT INTO user_communities (user_id, community_id) VALUES (?, ?)',
                [$userId, $communityId]
            );

            // Update member count
            $db->getConnection()->query("UPDATE communities SET member_count = member_count + 1 WHERE id = {$communityId}");

            return [
                'success' => true,
                'message' => 'Joined community successfully'
            ];
        } catch (\Exception $e) {
            error_log('Join community error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to join community'
            ];
        }
    }

    /**
     * Leave a community
     */
    public static function leaveCommunity($userId, $communityId)
    {
        try {
            $db = Database::getInstance();

            $db->execute(
                'DELETE FROM user_communities WHERE user_id = ? AND community_id = ?',
                [$userId, $communityId]
            );

            // Update member count
            $db->getConnection()->query("UPDATE communities SET member_count = member_count - 1 WHERE id = {$communityId} AND member_count > 0");

            return [
                'success' => true,
                'message' => 'Left community successfully'
            ];
        } catch (\Exception $e) {
            error_log('Leave community error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to leave community'
            ];
        }
    }

    /**
     * Search communities
     */
    public static function searchCommunities($query, $limit = 20, $offset = 0)
    {
        try {
            $db = Database::getInstance();
            $searchQuery = '%' . $query . '%';

            $stmt = $db->execute(
                'SELECT id, name, description, avatar_url, member_count, created_at
                 FROM communities
                 WHERE name LIKE ? OR description LIKE ?
                 ORDER BY member_count DESC
                 LIMIT ? OFFSET ?',
                [$searchQuery, $searchQuery, $limit, $offset]
            );

            $result = $stmt->get_result();
            $communities = [];

            while ($row = $result->fetch_assoc()) {
                $communities[] = self::formatCommunityRow($row);
            }

            return [
                'success' => true,
                'communities' => $communities,
                'count' => count($communities)
            ];
        } catch (\Exception $e) {
            error_log('Search communities error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to search communities'
            ];
        }
    }

    /**
     * Format a community row into API response format
     */
    private static function formatCommunityRow($row)
    {
        return [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'image' => $row['avatar_url'] ?: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
            'members' => intval($row['member_count']),
            'createdAt' => $row['created_at']
        ];
    }
}
