<?php

namespace App\Services;

use App\Config\Database;

class UserPostService
{
<<<<<<< HEAD

    /**
     * Get feed posts for the authenticated user
     * Shows posts from users they follow, sorted by created_at DESC
     */
    public static function getFeedPosts($userId, $limit = 20, $offset = 0)
=======
    /**
     * Get feed posts (user's own posts + posts with tags)
     */
    public static function getFeedPosts($userId, $limit = 50, $offset = 0)
>>>>>>> 86d481d (Finalized Project)
    {
        try {
            $db = Database::getInstance();

<<<<<<< HEAD
            // Get posts from followed users and user's own posts
            $stmt = $db->execute(
                'SELECT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
=======
            $stmt = $db->execute(
                'SELECT DISTINCT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
>>>>>>> 86d481d (Finalized Project)
                        u.username, u.display_name, u.avatar_url,
                        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts_count,
                        CASE WHEN EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
<<<<<<< HEAD
                 WHERE p.user_id IN (
                     SELECT following_id FROM follows WHERE follower_id = ?
                     UNION
                     SELECT ?
                 )
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?',
                [$userId, $userId, $userId, $limit, $offset]
=======
                 WHERE p.user_id = ?
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?',
                [$userId, $userId, $limit, $offset]
>>>>>>> 86d481d (Finalized Project)
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
<<<<<<< HEAD
=======
     * Get ALL posts from all users (For you tab)
     */
    public static function getAllPosts($limit = 50, $offset = 0, $userId = null)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT DISTINCT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
                        u.username, u.display_name, u.avatar_url,
                        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts_count,
                        CASE WHEN EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked,
                        GROUP_CONCAT(t.name SEPARATOR \',\') as tags
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 LEFT JOIN post_tags pt ON p.id = pt.post_id
                 LEFT JOIN tags t ON pt.tag_id = t.id
                 GROUP BY p.id
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?',
                [$userId, $limit, $offset]
            );

            $result = $stmt->get_result();
            $posts = [];

            while ($row = $result->fetch_assoc()) {
                $post = self::formatPostRow($row, $userId);
                if ($row['tags']) {
                    $post['tags'] = array_filter(explode(',', $row['tags']));
                } else {
                    $post['tags'] = [];
                }
                $posts[] = $post;
            }

            return [
                'success' => true,
                'posts' => $posts,
                'count' => count($posts)
            ];
        } catch (\Exception $e) {
            error_log('Get all posts error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch posts'
            ];
        }
    }

    /**
     * Get posts only from users the current user is following (Following tab)
     */
    public static function getFollowingPosts($userId, $limit = 50, $offset = 0)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT DISTINCT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
                        u.username, u.display_name, u.avatar_url,
                        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts_count,
                        CASE WHEN EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked,
                        GROUP_CONCAT(t.name SEPARATOR \',\') as tags
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 LEFT JOIN post_tags pt ON p.id = pt.post_id
                 LEFT JOIN tags t ON pt.tag_id = t.id
                 WHERE p.user_id IN (
                     SELECT following_id FROM follows WHERE follower_id = ?
                 )
                 GROUP BY p.id
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?',
                [$userId, $userId, $limit, $offset]
            );

            $result = $stmt->get_result();
            $posts = [];

            while ($row = $result->fetch_assoc()) {
                $post = self::formatPostRow($row, $userId);
                if ($row['tags']) {
                    $post['tags'] = array_filter(explode(',', $row['tags']));
                } else {
                    $post['tags'] = [];
                }
                $posts[] = $post;
            }

            return [
                'success' => true,
                'posts' => $posts,
                'count' => count($posts)
            ];
        } catch (\Exception $e) {
            error_log('Get following posts error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch following posts'
            ];
        }
    }

    /**
>>>>>>> 86d481d (Finalized Project)
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

<<<<<<< HEAD
            // Get post details
=======
>>>>>>> 86d481d (Finalized Project)
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

<<<<<<< HEAD
            // Get comments
=======
>>>>>>> 86d481d (Finalized Project)
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

<<<<<<< HEAD
            $post['comments'] = $comments;
=======
            $post['comments_list'] = $comments;
>>>>>>> 86d481d (Finalized Project)

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
<<<<<<< HEAD
    public static function createPost($userId, $content, $imageUrl = null)
=======
    public static function createPost($userId, $content, $imageUrl = null, $tags = [])
>>>>>>> 86d481d (Finalized Project)
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

<<<<<<< HEAD
=======
            // Add tags if provided
            if (!empty($tags) && is_array($tags)) {
                foreach ($tags as $tagName) {
                    $tagName = trim(strtolower($tagName));
                    if (empty($tagName)) continue;

                    // First, check if tag exists or create it
                    $tagStmt = $db->execute(
                        'SELECT id FROM tags WHERE name = ?',
                        [$tagName]
                    );
                    $tagResult = $tagStmt->get_result();

                    if ($tagResult->num_rows === 0) {
                        // Create new tag
                        $db->execute(
                            'INSERT INTO tags (name, slug) VALUES (?, ?)',
                            [$tagName, str_replace(' ', '-', $tagName)]
                        );
                        $tagId = $db->getConnection()->insert_id;
                    } else {
                        $row = $tagResult->fetch_assoc();
                        $tagId = $row['id'];
                    }

                    // Link tag to post
                    $db->execute(
                        'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)',
                        [$postId, $tagId]
                    );
                }
            }

>>>>>>> 86d481d (Finalized Project)
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

<<<<<<< HEAD
            // Check if post exists
=======
>>>>>>> 86d481d (Finalized Project)
            $postStmt = $db->execute('SELECT id FROM posts WHERE id = ?', [$postId]);
            if ($postStmt->get_result()->num_rows === 0) {
                return [
                    'success' => false,
                    'error' => 'Post not found'
                ];
            }

<<<<<<< HEAD
            // Check if already liked
=======
>>>>>>> 86d481d (Finalized Project)
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

<<<<<<< HEAD
            // Add like
=======
>>>>>>> 86d481d (Finalized Project)
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
<<<<<<< HEAD
=======
     * Get posts by tags with matching followers
     */
    public static function getPostsByTagsWithFollowers($userId, $limit = 20, $offset = 0)
    {
        try {
            $db = Database::getInstance();

            // Get user's interests
            $userStmt = $db->execute('SELECT interests FROM users WHERE id = ?', [$userId]);
            $userResult = $userStmt->get_result()->fetch_assoc();
            
            // Parse interests - they are stored as comma-separated string, not JSON
            $userInterests = [];
            if ($userResult['interests']) {
                $userInterests = array_map('trim', explode(',', $userResult['interests']));
            }

            // If user has no interests, return empty
            if (empty($userInterests)) {
                return [
                    'success' => true,
                    'posts' => [],
                    'count' => 0
                ];
            }

            // Build the IN clause for user's interests
            $placeholders = implode(',', array_fill(0, count($userInterests), '?'));

            // Get all posts that have tags matching USER'S interests
            $stmt = $db->execute(
                'SELECT DISTINCT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
                        u.username, u.display_name, u.avatar_url,
                        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
                        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as reposts_count,
                        CASE WHEN EXISTS (SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked,
                        GROUP_CONCAT(DISTINCT t.name SEPARATOR \',\') as tags
                 FROM posts p
                 INNER JOIN users u ON p.user_id = u.id
                 INNER JOIN post_tags pt ON p.id = pt.post_id
                 INNER JOIN tags t ON pt.tag_id = t.id AND t.name IN (' . $placeholders . ')
                 GROUP BY p.id
                 ORDER BY p.created_at DESC
                 LIMIT ? OFFSET ?',
                array_merge([$userId], $userInterests, [$limit, $offset])
            );

            $result = $stmt->get_result();
            $posts = [];
            $rowCount = 0;

            while ($row = $result->fetch_assoc()) {
                $rowCount++;
                $post = self::formatPostRow($row, $userId);

                if (!empty($row['tags'])) {
                    $post['tags'] = array_filter(explode(',', $row['tags']));
                } else {
                    $post['tags'] = [];
                }

                // Get matching followers
                $postTags = $post['tags'];
                $matchingFollowers = [];

                if (!empty($postTags)) {
                    $followersStmt = $db->execute(
                        'SELECT f.follower_id, u.id, u.username, u.display_name, u.avatar_url, u.interests
                         FROM follows f
                         JOIN users u ON f.follower_id = u.id
                         WHERE f.following_id = ?',
                        [$userId]
                    );

                    $followersResult = $followersStmt->get_result();
                    while ($follower = $followersResult->fetch_assoc()) {
                        // Parse follower interests - they are comma-separated strings, not JSON
                        $followerInterests = [];
                        if ($follower['interests']) {
                            $followerInterests = array_map('trim', explode(',', $follower['interests']));
                        }
                        
                        $commonTags = array_intersect($postTags, $followerInterests);

                        if (!empty($commonTags)) {
                            $matchingFollowers[] = [
                                'id' => $follower['id'],
                                'username' => $follower['username'],
                                'display_name' => $follower['display_name'],
                                'avatar' => $follower['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$follower['username']}",
                                'matching_tags' => array_values($commonTags)
                            ];
                        }
                    }
                }

                $post['matching_followers'] = $matchingFollowers;
                $posts[] = $post;
            }

            error_log("[GetPostsByTagsWithFollowers] User {$userId}: Interests: " . implode(',', $userInterests) . " - Found {$rowCount} posts");

            return [
                'success' => true,
                'posts' => $posts,
                'count' => count($posts)
            ];
        } catch (\Exception $e) {
            error_log('Get posts by tags with followers error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch posts',
                'posts' => []
            ];
        }
    }

    /**
>>>>>>> 86d481d (Finalized Project)
     * Format a post row into API response format
     */
    private static function formatPostRow($row, $currentUserId = null)
    {
<<<<<<< HEAD
        // Convert relative image URLs to absolute
        $imageUrl = $row['image_url'];
        if ($imageUrl && strpos($imageUrl, 'http') !== 0) {
            // Relative URL - make it absolute (images are served directly, not under /api)
=======
        $imageUrl = $row['image_url'];
        if ($imageUrl && strpos($imageUrl, 'http') !== 0) {
>>>>>>> 86d481d (Finalized Project)
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
            $imageUrl = $protocol . '://' . $host . $imageUrl;
        }

<<<<<<< HEAD
=======
        // Fetch tags for this post
        $tags = [];
        try {
            $db = Database::getInstance();
            $tagStmt = $db->execute(
                'SELECT t.name FROM tags t
                 JOIN post_tags pt ON t.id = pt.tag_id
                 WHERE pt.post_id = ?
                 ORDER BY t.name',
                [$row['id']]
            );
            $tagResult = $tagStmt->get_result();
            while ($tagRow = $tagResult->fetch_assoc()) {
                $tags[] = $tagRow['name'];
            }
        } catch (\Exception $e) {
            error_log('Error fetching tags: ' . $e->getMessage());
        }

>>>>>>> 86d481d (Finalized Project)
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
<<<<<<< HEAD
            'createdAt' => $row['created_at']
=======
            'createdAt' => $row['created_at'],
            'tags' => $tags
>>>>>>> 86d481d (Finalized Project)
        ];
    }
}
