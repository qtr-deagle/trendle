<?php

namespace App\Services;

use App\Config\Database;

class UserPostService
{

    /**
     * Get feed posts for the authenticated user
     * Shows posts from users they follow, sorted by created_at DESC
     */
    public static function getFeedPosts($userId, $limit = 20, $offset = 0)
    {
        try {
            $db = Database::getInstance();

            // Get posts from followed users and user's own posts
            $stmt = $db->execute(
                'SELECT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
                        u.username, u.display_name, u.avatar_url,
                        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts_count,
                        CASE WHEN EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.user_id IN (
                     SELECT following_id FROM follows WHERE follower_id = ?
                     UNION
                     SELECT ?
                 )
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?',
                [$userId, $userId, $userId, $limit, $offset]
            );

            $result = $stmt->get_result();
            $posts = [];

            while ($row = $result->fetch_assoc()) {
                $posts[] = self::formatPostRow($row, $userId);
            }

            return [
                'success' => true,
                'posts' => $posts,
                'count' => count($posts)
            ];
        } catch (\Exception $e) {
            error_log('Get feed posts error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch feed'
            ];
        }
    }

    /**
     * Get all posts from a specific user
     */
    public static function getUserPosts($username, $limit = 20, $offset = 0)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
                        u.username, u.display_name, u.avatar_url,
                        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts_count
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 WHERE u.username = ?
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?',
                [$username, $limit, $offset]
            );

            $result = $stmt->get_result();
            $posts = [];

            while ($row = $result->fetch_assoc()) {
                $posts[] = self::formatPostRow($row);
            }

            return [
                'success' => true,
                'posts' => $posts,
                'count' => count($posts)
            ];
        } catch (\Exception $e) {
            error_log('Get user posts error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch user posts'
            ];
        }
    }

    /**
     * Get a single post with full details including comments
     */
    public static function getPostDetail($postId, $userId = null)
    {
        try {
            $db = Database::getInstance();

            // Get post details
            $stmt = $db->execute(
                'SELECT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
                        u.username, u.display_name, u.avatar_url, u.bio,
                        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts_count,
                        CASE WHEN ? IS NOT NULL AND EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 WHERE p.id = ?',
                [$userId, $userId, $postId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                return [
                    'success' => false,
                    'error' => 'Post not found'
                ];
            }

            $post = $result->fetch_assoc();
            $post = self::formatPostRow($post, $userId);

            // Get comments
            $commentsStmt = $db->execute(
                'SELECT c.id, c.user_id, c.content, c.created_at,
                        u.username, u.display_name, u.avatar_url,
                        (SELECT COUNT(*) FROM likes WHERE comment_id = c.id) as likes_count
                 FROM comments c
                 JOIN users u ON c.user_id = u.id
                 WHERE c.post_id = ?
                 ORDER BY c.created_at DESC',
                [$postId]
            );

            $commentsResult = $commentsStmt->get_result();
            $comments = [];

            while ($row = $commentsResult->fetch_assoc()) {
                $comments[] = [
                    'id' => $row['id'],
                    'author' => [
                        'id' => $row['user_id'],
                        'username' => $row['username'],
                        'display_name' => $row['display_name'],
                        'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}"
                    ],
                    'content' => $row['content'],
                    'likes' => $row['likes_count'],
                    'createdAt' => $row['created_at']
                ];
            }

            $post['comments'] = $comments;

            return [
                'success' => true,
                'post' => $post
            ];
        } catch (\Exception $e) {
            error_log('Get post detail error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch post'
            ];
        }
    }

    /**
     * Create a new post
     */
    public static function createPost($userId, $content, $imageUrl = null)
    {
        try {
            if (empty($content)) {
                return [
                    'success' => false,
                    'error' => 'Content cannot be empty'
                ];
            }

            $db = Database::getInstance();

            $stmt = $db->execute(
                'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
                [$userId, $content, $imageUrl]
            );

            $postId = $db->getConnection()->insert_id;

            return [
                'success' => true,
                'message' => 'Post created successfully',
                'post_id' => $postId
            ];
        } catch (\Exception $e) {
            error_log('Create post error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to create post'
            ];
        }
    }

    /**
     * Like a post
     */
    public static function likePost($userId, $postId)
    {
        try {
            $db = Database::getInstance();

            // Check if post exists
            $postStmt = $db->execute('SELECT id FROM posts WHERE id = ?', [$postId]);
            if ($postStmt->get_result()->num_rows === 0) {
                return [
                    'success' => false,
                    'error' => 'Post not found'
                ];
            }

            // Check if already liked
            $likeStmt = $db->execute(
                'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
                [$userId, $postId]
            );
            if ($likeStmt->get_result()->num_rows > 0) {
                return [
                    'success' => false,
                    'error' => 'Already liked'
                ];
            }

            // Add like
            $db->execute(
                'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
                [$userId, $postId]
            );

            return [
                'success' => true,
                'message' => 'Post liked'
            ];
        } catch (\Exception $e) {
            error_log('Like post error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to like post'
            ];
        }
    }

    /**
     * Unlike a post
     */
    public static function unlikePost($userId, $postId)
    {
        try {
            $db = Database::getInstance();

            $db->execute(
                'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
                [$userId, $postId]
            );

            return [
                'success' => true,
                'message' => 'Post unliked'
            ];
        } catch (\Exception $e) {
            error_log('Unlike post error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to unlike post'
            ];
        }
    }

    /**
     * Format a post row into API response format
     */
    private static function formatPostRow($row, $currentUserId = null)
    {
        // Convert relative image URLs to absolute
        $imageUrl = $row['image_url'];
        if ($imageUrl && strpos($imageUrl, 'http') !== 0) {
            // Relative URL - make it absolute (images are served directly, not under /api)
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
            $imageUrl = $protocol . '://' . $host . $imageUrl;
        }

        return [
            'id' => $row['id'],
            'author' => [
                'id' => $row['user_id'],
                'username' => $row['username'],
                'display_name' => $row['display_name'],
                'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}"
            ],
            'content' => $row['content'],
            'image' => $imageUrl,
            'likes' => intval($row['likes_count']),
            'comments' => intval($row['comments_count']),
            'reposts' => intval($row['reposts_count']),
            'isLiked' => isset($row['is_liked']) ? boolval($row['is_liked']) : false,
            'createdAt' => $row['created_at']
        ];
    }
}
