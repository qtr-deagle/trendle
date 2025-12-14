-- Trendle Social Application Database Schema
-- MySQL 8.0+

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  bio TEXT,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_is_active (is_active),
  INDEX idx_is_admin (is_admin)
);

-- ============================================
-- 2. COMMUNITIES TABLE
-- ============================================
CREATE TABLE communities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  handle VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  members_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_handle (handle),
  INDEX idx_name (name),
  INDEX idx_created_at (created_at),
  INDEX idx_is_active (is_active)
);

-- ============================================
-- 3. USER_COMMUNITIES (Many-to-Many Junction)
-- ============================================
CREATE TABLE user_communities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  community_id BIGINT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_moderator BOOLEAN DEFAULT FALSE,
  
  UNIQUE KEY unique_user_community (user_id, community_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_community_id (community_id),
  INDEX idx_joined_at (joined_at)
);

-- ============================================
-- 4. POSTS TABLE
-- ============================================
CREATE TABLE posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  community_id BIGINT,
  is_global BOOLEAN DEFAULT FALSE,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reposts_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  INDEX idx_author_id (author_id),
  INDEX idx_community_id (community_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_global (is_global),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_author_created (author_id, created_at),
  INDEX idx_community_created (community_id, created_at)
);

-- ============================================
-- 5. POST_HASHTAGS (Many-to-Many for Tags)
-- ============================================
CREATE TABLE hashtags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tag_name VARCHAR(100) NOT NULL UNIQUE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tag_name (tag_name)
);

CREATE TABLE post_hashtags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  hashtag_id BIGINT NOT NULL,
  
  UNIQUE KEY unique_post_hashtag (post_id, hashtag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_hashtag_id (hashtag_id)
);

-- ============================================
-- 6. COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_author_id (author_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_post_created (post_id, created_at)
);

-- ============================================
-- 7. LIKES TABLE (Polymorphic: Posts & Comments)
-- ============================================
CREATE TABLE likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  post_id BIGINT,
  comment_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_post_like (user_id, post_id),
  UNIQUE KEY unique_user_comment_like (user_id, comment_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_post_id (post_id),
  INDEX idx_comment_id (comment_id),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 8. FOLLOWS TABLE (User Follows User)
-- ============================================
CREATE TABLE follows (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  follower_id BIGINT NOT NULL,
  following_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_follow (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (follower_id != following_id),
  INDEX idx_follower_id (follower_id),
  INDEX idx_following_id (following_id),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 9. REPOSTS TABLE
-- ============================================
CREATE TABLE reposts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  post_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_repost (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_post_id (post_id),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 10. MESSAGES TABLE (Direct Messaging)
-- ============================================
CREATE TABLE messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sender_id BIGINT NOT NULL,
  recipient_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (sender_id != recipient_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read),
  INDEX idx_conversation (sender_id, recipient_id, created_at)
);

-- ============================================
-- 11. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  actor_id BIGINT NOT NULL,
  type ENUM('like', 'comment', 'follow', 'repost', 'message') NOT NULL,
  post_id BIGINT,
  comment_id BIGINT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_actor_id (actor_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_user_read_created (user_id, is_read, created_at)
);

-- ============================================
-- 12. REPORTS TABLE
-- ============================================
CREATE TABLE reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reporter_id BIGINT NOT NULL,
  reported_user_id BIGINT,
  post_id BIGINT,
  comment_id BIGINT,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
  assigned_admin_id BIGINT,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_reporter_id (reporter_id),
  INDEX idx_reported_user_id (reported_user_id),
  INDEX idx_assigned_admin_id (assigned_admin_id)
);

-- ============================================
-- 13. CONTACT_MESSAGES TABLE
-- ============================================
CREATE TABLE contact_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'resolved') DEFAULT 'unread',
  assigned_admin_id BIGINT,
  admin_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  replied_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- 14. CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_name (name),
  INDEX idx_slug (slug),
  INDEX idx_is_visible (is_visible),
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order)
);

-- ============================================
-- 15. TAGS TABLE
-- ============================================
CREATE TABLE tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_nsfw BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_slug (slug),
  INDEX idx_is_active (is_active),
  INDEX idx_usage_count (usage_count DESC)
);

-- ============================================
-- 16. CATEGORY_TAGS (Many-to-Many)
-- ============================================
CREATE TABLE category_tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  
  UNIQUE KEY unique_category_tag (category_id, tag_id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  INDEX idx_category_id (category_id),
  INDEX idx_tag_id (tag_id)
);

-- ============================================
-- 17. ADMIN_LOGS TABLE
-- ============================================
CREATE TABLE admin_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id BIGINT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  INDEX idx_admin_action_created (admin_id, action, created_at)
);

-- ============================================
-- Frontend-Ready Query Examples
-- ============================================

-- Get posts for Explore (Global Feed)
-- SELECT p.*, u.username, u.avatar_url, 
--        COUNT(DISTINCT l.id) as likes_count,
--        COUNT(DISTINCT c.id) as comments_count
-- FROM posts p
-- JOIN users u ON p.author_id = u.id
-- LEFT JOIN likes l ON p.id = l.post_id
-- LEFT JOIN comments c ON p.id = c.post_id
-- WHERE p.is_global = TRUE AND p.is_deleted = FALSE
-- GROUP BY p.id
-- ORDER BY p.created_at DESC
-- LIMIT 20;

-- Get community posts
-- SELECT p.*, u.username, u.avatar_url, co.name as community_name,
--        COUNT(DISTINCT l.id) as likes_count,
--        COUNT(DISTINCT c.id) as comments_count
-- FROM posts p
-- JOIN users u ON p.author_id = u.id
-- JOIN communities co ON p.community_id = co.id
-- LEFT JOIN likes l ON p.id = l.post_id
-- LEFT JOIN comments c ON p.id = c.post_id
-- WHERE p.community_id = ? AND p.is_deleted = FALSE
-- GROUP BY p.id
-- ORDER BY p.created_at DESC
-- LIMIT 20;

-- Get user profile info
-- SELECT u.*, 
--        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers,
--        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following,
--        (SELECT COUNT(*) FROM posts WHERE author_id = u.id AND is_deleted = FALSE) as posts_count
-- FROM users u
-- WHERE u.username = ? AND u.is_active = TRUE;

-- Get user's communities
-- SELECT c.*, 
--        (SELECT COUNT(*) FROM user_communities WHERE community_id = c.id) as members_count
-- FROM communities c
-- JOIN user_communities uc ON c.id = uc.community_id
-- WHERE uc.user_id = ? AND c.is_active = TRUE
-- ORDER BY uc.joined_at DESC;

-- Get post with comments and author info
-- SELECT p.*, u.username, u.avatar_url,
--        c.id as comment_id, c.content as comment_content, 
--        c.created_at as comment_created_at,
--        cu.username as comment_author, cu.avatar_url as comment_avatar
-- FROM posts p
-- JOIN users u ON p.author_id = u.id
-- LEFT JOIN comments c ON p.id = c.post_id AND c.is_deleted = FALSE
-- LEFT JOIN users cu ON c.author_id = cu.id
-- WHERE p.id = ? AND p.is_deleted = FALSE
-- ORDER BY c.created_at ASC;
