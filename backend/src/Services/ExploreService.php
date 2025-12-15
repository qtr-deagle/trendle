<?php

namespace App\Services;

use App\Config\Database;

class ExploreService
{

    /**
     * Get trending hashtags
     */
    public static function getTrendingHashtags($limit = 10)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT id, name, slug, usage_count
                 FROM tags
                 WHERE is_active = TRUE AND is_nsfw = FALSE
                 ORDER BY usage_count DESC
                 LIMIT ?',
                [$limit]
            );

            $result = $stmt->get_result();
            $hashtags = [];

            while ($row = $result->fetch_assoc()) {
                $hashtags[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'slug' => $row['slug'],
                    'usage_count' => intval($row['usage_count']),
                    'followers' => intval($row['usage_count']) . 'K+'
                ];
            }

            return [
                'success' => true,
                'hashtags' => $hashtags,
                'count' => count($hashtags)
            ];
        } catch (\Exception $e) {
            error_log('Get trending hashtags error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch trending hashtags'
            ];
        }
    }

    /**
     * Get trending categories
     */
    public static function getTrendingCategories($limit = 10)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT id, name, slug, description, icon, color
                 FROM categories
                 WHERE is_active = TRUE AND is_visible = TRUE
                 ORDER BY display_order ASC
                 LIMIT ?',
                [$limit]
            );

            $result = $stmt->get_result();
            $categories = [];

            while ($row = $result->fetch_assoc()) {
                $categories[] = [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'slug' => $row['slug'],
                    'description' => $row['description'],
                    'icon' => $row['icon'],
                    'color' => $row['color']
                ];
            }

            return [
                'success' => true,
                'categories' => $categories,
                'count' => count($categories)
            ];
        } catch (\Exception $e) {
            error_log('Get trending categories error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch categories'
            ];
        }
    }

    /**
     * Search for users, posts, and tags
     */
    public static function globalSearch($query, $type = 'all', $limit = 20)
    {
        try {
            $db = Database::getInstance();
            $searchQuery = '%' . $query . '%';
            $results = [
                'users' => [],
                'tags' => [],
                'posts' => []
            ];

            if ($type === 'all' || $type === 'users') {
                // Search users
                $userStmt = $db->execute(
                    'SELECT id, username, display_name, avatar_url, bio
                     FROM users
                     WHERE username LIKE ? OR display_name LIKE ?
                     LIMIT ?',
                    [$searchQuery, $searchQuery, $limit]
                );

                while ($row = $userStmt->get_result()->fetch_assoc()) {
                    $results['users'][] = [
                        'id' => $row['id'],
                        'username' => $row['username'],
                        'display_name' => $row['display_name'],
                        'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}",
                        'bio' => $row['bio']
                    ];
                }
            }

            if ($type === 'all' || $type === 'tags') {
                // Search tags
                $tagStmt = $db->execute(
                    'SELECT id, name, slug, usage_count
                     FROM tags
                     WHERE name LIKE ? AND is_active = TRUE
                     LIMIT ?',
                    [$searchQuery, $limit]
                );

                while ($row = $tagStmt->get_result()->fetch_assoc()) {
                    $results['tags'][] = [
                        'id' => $row['id'],
                        'name' => $row['name'],
                        'slug' => $row['slug'],
                        'usage_count' => intval($row['usage_count'])
                    ];
                }
            }

            if ($type === 'all' || $type === 'posts') {
                // Search posts
                $postStmt = $db->execute(
                    'SELECT p.id, p.user_id, p.content, p.image_url, p.created_at, u.username, u.display_name, u.avatar_url
                     FROM posts p
                     JOIN users u ON p.user_id = u.id
                     WHERE p.content LIKE ?
                     ORDER BY p.created_at DESC
                     LIMIT ?',
                    [$searchQuery, $limit]
                );

                while ($row = $postStmt->get_result()->fetch_assoc()) {
                    $results['posts'][] = [
                        'id' => $row['id'],
                        'author' => [
                            'id' => $row['user_id'],
                            'username' => $row['username'],
                            'display_name' => $row['display_name'],
                            'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}"
                        ],
                        'content' => $row['content'],
                        'image' => $row['image_url'],
                        'createdAt' => $row['created_at']
                    ];
                }
            }

            return [
                'success' => true,
                'results' => $results,
                'query' => $query
            ];
        } catch (\Exception $e) {
            error_log('Global search error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Search failed'
            ];
        }
    }

    /**
     * Get posts by hashtag
     */
    public static function getPostsByHashtag($tagSlug, $limit = 20, $offset = 0)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT p.id, p.user_id, p.content, p.image_url, p.created_at,
                        u.username, u.display_name, u.avatar_url,
                        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 JOIN post_tags pt ON p.id = pt.post_id
                 JOIN tags t ON pt.tag_id = t.id
                 WHERE t.slug = ?
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?',
                [$tagSlug, $limit, $offset]
            );

            $result = $stmt->get_result();
            $posts = [];

            while ($row = $result->fetch_assoc()) {
                $posts[] = [
                    'id' => $row['id'],
                    'author' => [
                        'id' => $row['user_id'],
                        'username' => $row['username'],
                        'display_name' => $row['display_name'],
                        'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}"
                    ],
                    'content' => $row['content'],
                    'image' => $row['image_url'],
                    'likes' => intval($row['likes_count']),
                    'comments' => intval($row['comments_count']),
                    'createdAt' => $row['created_at']
                ];
            }

            return [
                'success' => true,
                'posts' => $posts,
                'count' => count($posts)
            ];
        } catch (\Exception $e) {
            error_log('Get posts by hashtag error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch posts'
            ];
        }
    }

    /**
     * Get recommended users (trending/popular users)
     */
    public static function getRecommendedUsers($limit = 10, $excludeUserId = null)
    {
        try {
            $db = Database::getInstance();

            $params = [$limit];
            $whereClause = 'WHERE is_admin = FALSE';
            
            // Exclude the current user if provided
            if ($excludeUserId) {
                $whereClause .= ' AND id != ?';
                // Add exclude user ID before limit
                array_unshift($params, $excludeUserId);
            }

            $stmt = $db->execute(
                'SELECT id, username, display_name, avatar_url, bio, followers
                 FROM users
                 ' . $whereClause . '
                 ORDER BY followers DESC
                 LIMIT ?',
                $params
            );

            $result = $stmt->get_result();
            $users = [];

            while ($row = $result->fetch_assoc()) {
                $users[] = [
                    'id' => $row['id'],
                    'username' => $row['username'],
                    'display_name' => $row['display_name'],
                    'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}",
                    'bio' => $row['bio'],
                    'followers' => intval($row['followers'])
                ];
            }

            return [
                'success' => true,
                'users' => $users,
                'count' => count($users)
            ];
        } catch (\Exception $e) {
            error_log('Get recommended users error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch users'
            ];
        }
    }
}
