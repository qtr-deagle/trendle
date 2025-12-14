# Trendle Social Application - Database Schema Documentation

## Overview
This is a comprehensive MySQL database schema designed for a Twitter/X-like social application with support for communities, user authentication, posts, interactions (likes, comments, reposts), and messaging.

## Database Design Principles

✅ **Normalized Structure** - Avoids data redundancy
✅ **Foreign Keys** - Ensures referential integrity
✅ **Indexes** - Optimized for common queries
✅ **Scalable** - Designed for millions of users
✅ **Frontend-Ready** - Easy to query and display data
✅ **Timestamps** - Tracks creation and updates

---

## Core Tables

### 1. **users**
Stores user account information and authentication data.

**Columns:**
- `id` - Unique user identifier (Primary Key)
- `username` - Unique handle (e.g., @john_doe) - INDEXED
- `display_name` - Full display name
- `email` - Email address (unique) - INDEXED
- `password_hash` - Bcrypt/Argon2 hashed password
- `avatar_url` - Profile picture URL
- `cover_image_url` - Cover/banner image
- `bio` - User biography
- `followers_count` - Denormalized count for quick access
- `following_count` - Denormalized count for quick access
- `created_at` - Account creation timestamp - INDEXED
- `updated_at` - Last update timestamp
- `is_active` - Account status - INDEXED

**Indexes:**
- `username` - For login/profile lookups
- `email` - For authentication
- `created_at` - For user discovery
- `is_active` - For filtering inactive accounts

**Frontend Usage:**
```sql
SELECT username, display_name, avatar_url, bio, followers_count 
FROM users 
WHERE username = 'john_doe';
```

---

### 2. **communities**
Stores community/group information.

**Columns:**
- `id` - Unique community identifier
- `name` - Community display name (unique)
- `handle` - URL-friendly handle (e.g., pokemon) - INDEXED
- `description` - Community description
- `image_url` - Community icon/banner
- `members_count` - Denormalized member count
- `created_at` - Creation timestamp - INDEXED
- `updated_at` - Last update
- `created_by` - User ID of creator
- `is_active` - Active status - INDEXED

**Frontend Usage:**
```sql
SELECT * FROM communities 
WHERE handle = 'pokemon' AND is_active = TRUE;
```

---

### 3. **user_communities** (Junction Table)
Links users to communities (Many-to-Many relationship).

**Purpose:** Track which users are members of which communities.

**Columns:**
- `user_id` - Foreign Key to users
- `community_id` - Foreign Key to communities
- `joined_at` - Membership timestamp
- `is_moderator` - Moderator status
- UNIQUE constraint: Prevents duplicate memberships

**Indexes:**
- `user_id` - Get user's communities
- `community_id` - Get community members
- `joined_at` - Recent joiners

**Frontend Usage:**
```sql
SELECT c.* FROM communities c
JOIN user_communities uc ON c.id = uc.community_id
WHERE uc.user_id = 42;
```

---

### 4. **posts**
Stores post/tweet content.

**Columns:**
- `id` - Unique post identifier
- `author_id` - Creator's user ID - INDEXED
- `content` - Post text (up to 65KB)
- `image_url` - Optional post image
- `community_id` - Community post belongs to (NULL = global)
- `is_global` - TRUE if in Explore feed - INDEXED
- `likes_count` - Denormalized count for performance
- `comments_count` - Denormalized count
- `reposts_count` - Denormalized count
- `created_at` - Post creation time - INDEXED
- `updated_at` - Last edit time
- `is_deleted` - Soft delete flag - INDEXED

**Indexes:**
- `author_id` - Get user's posts
- `community_id` - Get community posts
- `is_global` - Get Explore posts
- `created_at` - Timeline ordering
- Composite: `(author_id, created_at)` - User timeline
- Composite: `(community_id, created_at)` - Community feed

**Frontend Usage:**
```sql
-- Get Explore feed
SELECT p.*, u.username, u.avatar_url
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.is_global = TRUE AND p.is_deleted = FALSE
ORDER BY p.created_at DESC
LIMIT 20;

-- Get community posts
SELECT p.*, u.username, u.avatar_url
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.community_id = 5 AND p.is_deleted = FALSE
ORDER BY p.created_at DESC
LIMIT 20;
```

---

### 5. **hashtags & post_hashtags** (Many-to-Many)
Support for searchable hashtags.

**hashtags table:**
- `id` - Hashtag ID
- `tag_name` - The hashtag text (unique)
- `usage_count` - Trending metric

**post_hashtags table:**
- Links posts to hashtags with UNIQUE constraint

**Frontend Usage:**
```sql
SELECT p.* FROM posts p
JOIN post_hashtags ph ON p.id = ph.post_id
JOIN hashtags h ON ph.hashtag_id = h.id
WHERE h.tag_name = 'pokemon'
ORDER BY p.created_at DESC;
```

---

### 6. **comments**
Stores replies to posts.

**Columns:**
- `id` - Comment ID
- `post_id` - Parent post - INDEXED
- `author_id` - Comment author - INDEXED
- `content` - Comment text
- `likes_count` - Denormalized likes
- `created_at` - Creation timestamp - INDEXED
- `updated_at` - Edit timestamp
- `is_deleted` - Soft delete flag

**Indexes:**
- `post_id` - Get post's comments
- `author_id` - Get user's comments
- Composite: `(post_id, created_at)` - Comment thread ordering

**Frontend Usage:**
```sql
SELECT c.*, u.username, u.avatar_url
FROM comments c
JOIN users u ON c.author_id = u.id
WHERE c.post_id = 123 AND c.is_deleted = FALSE
ORDER BY c.created_at ASC;
```

---

### 7. **likes**
Polymorphic table for likes on posts and comments.

**Columns:**
- `user_id` - Who liked - INDEXED
- `post_id` - Post being liked (NULL if comment) - INDEXED
- `comment_id` - Comment being liked (NULL if post) - INDEXED
- `created_at` - Like timestamp - INDEXED
- UNIQUE constraints: Prevent duplicate likes

**Design Decision:** Using NULL values with multiple UNIQUE constraints is more performant than separate tables for post_likes and comment_likes.

**Frontend Usage:**
```sql
-- Check if user liked post
SELECT * FROM likes 
WHERE user_id = 42 AND post_id = 100;

-- Get like count (already denormalized in posts table)
SELECT likes_count FROM posts WHERE id = 100;
```

---

### 8. **follows**
User-to-user follow relationships.

**Columns:**
- `follower_id` - Who is following
- `following_id` - Who is being followed
- `created_at` - Follow timestamp
- CHECK constraint: `follower_id != following_id`
- UNIQUE constraint: Prevents duplicate follows

**Indexes:**
- `follower_id` - Get user's following list
- `following_id` - Get user's followers

**Frontend Usage:**
```sql
-- Get user's followers
SELECT u.* FROM users u
JOIN follows f ON u.id = f.follower_id
WHERE f.following_id = 42;

-- Check if user follows another
SELECT * FROM follows 
WHERE follower_id = 10 AND following_id = 42;
```

---

### 9. **reposts**
Track which users reposted which posts.

**Columns:**
- `user_id` - Who reposted
- `post_id` - Post that was reposted
- `created_at` - Repost timestamp
- UNIQUE constraint: Prevent duplicate reposts

**Frontend Usage:**
```sql
-- Check if user reposted
SELECT * FROM reposts 
WHERE user_id = 42 AND post_id = 100;
```

---

### 10. **messages**
Direct messaging between users.

**Columns:**
- `sender_id` - Message sender
- `recipient_id` - Message recipient
- `content` - Message text
- `is_read` - Read status - INDEXED
- `created_at` - Timestamp - INDEXED
- CHECK constraint: Prevents self-messaging
- Composite index: `(sender_id, recipient_id, created_at)` for conversations

**Frontend Usage:**
```sql
-- Get conversation between two users
SELECT * FROM messages
WHERE (sender_id = 10 AND recipient_id = 42) OR
      (sender_id = 42 AND recipient_id = 10)
ORDER BY created_at DESC
LIMIT 50;

-- Mark messages as read
UPDATE messages 
SET is_read = TRUE 
WHERE recipient_id = 42 AND sender_id = 10 AND is_read = FALSE;
```

---

### 11. **notifications**
Activity notifications for users.

**Columns:**
- `user_id` - Notification recipient
- `actor_id` - User who performed action
- `type` - ENUM: 'like', 'comment', 'follow', 'repost', 'message'
- `post_id` - Related post (NULL if not applicable)
- `comment_id` - Related comment (NULL if not applicable)
- `is_read` - Read status - INDEXED
- `created_at` - Timestamp - INDEXED

**Composite Index:** `(user_id, is_read, created_at)` - Efficient notification retrieval

**Frontend Usage:**
```sql
-- Get unread notifications
SELECT n.*, u.username, u.avatar_url
FROM notifications n
JOIN users u ON n.actor_id = u.id
WHERE n.user_id = 42 AND n.is_read = FALSE
ORDER BY n.created_at DESC
LIMIT 50;

-- Mark as read
UPDATE notifications 
SET is_read = TRUE 
WHERE user_id = 42 AND id = 100;
```

---

### 12. **admin_logs**
Audit trail for admin actions.

**Columns:**
- `admin_id` - Admin who performed action
- `action` - Action type (delete_post, ban_user, etc.)
- `target_type` - What was modified (post, user, community)
- `target_id` - ID of modified entity
- `details` - JSON object with additional info
- `created_at` - Timestamp

---

## Key Design Decisions

### 1. **Denormalized Counts**
```
followers_count, following_count, likes_count, comments_count
```
**Why?** Counting from relationships is slow at scale. Denormalized counts are:
- ✅ Updated via triggers or application logic
- ✅ O(1) query time for display
- ✅ Can be recalculated from relationships if corrupted

### 2. **Soft Deletes**
```
is_deleted BOOLEAN DEFAULT FALSE
```
**Why?** Allows:
- ✅ Preserve referential integrity
- ✅ Compliance with data retention policies
- ✅ Easy un-deletion if needed
- ✅ Audit trails

### 3. **Polymorphic Likes Table**
```
post_id BIGINT, comment_id BIGINT
```
**Why?** Instead of separate `post_likes` and `comment_likes` tables:
- ✅ Simpler queries for total likes on a user
- ✅ Fewer joins
- ✅ CHECK constraints ensure data validity

### 4. **Composite Indexes**
```
INDEX (community_id, created_at)
INDEX (user_id, created_at)
```
**Why?** The most common query pattern is:
```sql
WHERE community_id = X ORDER BY created_at DESC LIMIT 20
```
Composite indexes cover both the WHERE and ORDER BY clauses.

### 5. **No Recursive Comments**
Comments can't have replies (for simplicity). Design can be extended with `parent_comment_id` if needed.

---

## Performance Optimization Tips

### 1. Use Denormalized Counts Wisely
```sql
-- DON'T do this every query:
SELECT COUNT(*) FROM likes WHERE post_id = 100;

-- DO this instead:
SELECT likes_count FROM posts WHERE id = 100;
```

### 2. Pagination with Cursor
```sql
-- Get posts after a certain timestamp
SELECT * FROM posts
WHERE created_at < '2024-12-14 10:00:00'
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Batch Updates for Counts
Use database triggers or application-level batch updates:
```sql
-- Update post like count when a like is inserted
TRIGGER posts_update_likes_count
AFTER INSERT ON likes
FOR EACH ROW
UPDATE posts SET likes_count = likes_count + 1 
WHERE id = NEW.post_id;
```

### 4. Archive Old Data
For large-scale applications, archive posts/comments older than X days to a separate table.

---

## Query Examples for Frontend

### Get Home Feed (Followed Users)
```sql
SELECT p.*, u.username, u.avatar_url, u.display_name,
       COUNT(DISTINCT l.id) as likes_count,
       COUNT(DISTINCT c.id) as comments_count
FROM posts p
JOIN users u ON p.author_id = u.id
JOIN follows f ON p.author_id = f.following_id
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
WHERE f.follower_id = ? AND p.is_deleted = FALSE
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 20;
```

### Get User Profile Card
```sql
SELECT u.username, u.display_name, u.avatar_url, u.bio,
       (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers,
       (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following,
       (SELECT COUNT(*) FROM posts WHERE author_id = u.id AND is_deleted = FALSE) as posts
FROM users u
WHERE u.id = ? AND u.is_active = TRUE;
```

### Get Community Page
```sql
SELECT c.*, 
       COUNT(DISTINCT uc.user_id) as members
FROM communities c
LEFT JOIN user_communities uc ON c.id = uc.community_id
WHERE c.id = ? AND c.is_active = TRUE
GROUP BY c.id;
```

---

## Scalability Considerations

### 1. Sharding
- Shard by `user_id` for posts and comments
- Distribute communities across shards based on load

### 2. Read Replicas
- Use read replicas for SELECT queries (timeline, explore, profiles)
- Direct writes to primary

### 3. Caching Layer
- Cache: User profiles, Community info, Hot posts
- Use Redis with 5-15 minute TTL

### 4. Search Index
- Use Elasticsearch for:
  - Full-text search on posts/comments
  - Trending hashtags
  - User search

### 5. Partitioning
- Partition `posts` and `comments` by date ranges
- Automatically archive old data

---

## Setup Instructions

1. **Create Database:**
```sql
CREATE DATABASE trendle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trendle;
```

2. **Run Schema:**
```bash
mysql -u root -p trendle < database_schema.sql
```

3. **Create Indexes for Performance:**
Indexes are included in the schema file.

4. **Set Triggers (Optional):**
Create triggers to maintain denormalized counts automatically.

---

## Summary

This schema provides:
✅ Complete user authentication support
✅ Multi-community posting
✅ Global (Explore) and community feeds
✅ Like and comment interactions
✅ User relationships (follow/unfollow)
✅ Direct messaging
✅ Notification system
✅ Admin audit trail
✅ Optimized for frontend queries
✅ Scalable architecture
