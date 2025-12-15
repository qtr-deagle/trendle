<?php

namespace App\Services;

use App\Config\Database;

class MessageService
{

    /**
     * Get all conversations for a user (only users they follow)
     */
    public static function getConversations($userId)
    {
        try {
            $db = Database::getInstance();

            // Get last message with each followed user
            $stmt = $db->execute(
                'SELECT DISTINCT 
                    IF(m.sender_id = ?, m.recipient_id, m.sender_id) as user_id,
                    u.username, u.display_name, u.avatar_url, u.bio,
                    MAX(m.created_at) as last_message_time
                 FROM messages m
                 JOIN users u ON (
                    (m.sender_id = ? AND m.recipient_id = u.id) OR
                    (m.recipient_id = ? AND m.sender_id = u.id)
                 )
                 WHERE m.sender_id = ? OR m.recipient_id = ?
                 GROUP BY user_id
                 ORDER BY last_message_time DESC',
                [$userId, $userId, $userId, $userId, $userId]
            );

            $result = $stmt->get_result();
            $conversations = [];

            while ($row = $result->fetch_assoc()) {
                // Show all conversations regardless of follow status
                // (Admin messages and user-to-user messages both work)
                $conversations[] = self::formatConversationRow($row);
            }

            return [
                'success' => true,
                'conversations' => $conversations,
                'count' => count($conversations)
            ];
        } catch (\Exception $e) {
            error_log('Get conversations error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch conversations'
            ];
        }
    }

    /**
     * Get all followers who can receive messages
     */
    public static function getFollowersForMessaging($userId)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio
                 FROM users u
                 JOIN follows f ON f.follower_id = u.id
                 WHERE f.following_id = ?
                 ORDER BY u.display_name ASC',
                [$userId]
            );

            $result = $stmt->get_result();
            $followers = [];

            while ($row = $result->fetch_assoc()) {
                $followers[] = [
                    'id' => $row['id'],
                    'username' => $row['username'],
                    'display_name' => $row['display_name'],
                    'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}",
                    'bio' => $row['bio']
                ];
            }

            return [
                'success' => true,
                'followers' => $followers,
                'count' => count($followers)
            ];
        } catch (\Exception $e) {
            error_log('Get followers for messaging error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch followers'
            ];
        }
    }

    /**
     * Get messages between two users
     */
    public static function getConversation($userId, $otherUserId, $limit = 50)
    {
        try {
            $db = Database::getInstance();

            // Get messages
            $stmt = $db->execute(
                'SELECT id, sender_id, recipient_id, content, is_read, created_at
                 FROM messages
                 WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
                 ORDER BY created_at ASC
                 LIMIT ?',
                [$userId, $otherUserId, $otherUserId, $userId, $limit]
            );

            $result = $stmt->get_result();
            $messages = [];

            while ($row = $result->fetch_assoc()) {
                $messages[] = [
                    'id' => $row['id'],
                    'senderId' => $row['sender_id'],
                    'recipientId' => $row['recipient_id'],
                    'content' => $row['content'],
                    'isRead' => boolval($row['is_read']),
                    'createdAt' => $row['created_at']
                ];
            }

            // Mark messages as read
            $db->execute(
                'UPDATE messages SET is_read = TRUE WHERE recipient_id = ? AND sender_id = ? AND is_read = FALSE',
                [$userId, $otherUserId]
            );

            return [
                'success' => true,
                'messages' => $messages,
                'count' => count($messages)
            ];
        } catch (\Exception $e) {
            error_log('Get conversation error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch conversation'
            ];
        }
    }

    /**
     * Send a message
     */
    public static function sendMessage($senderId, $recipientId, $content)
    {
        try {
            if (empty($content)) {
                return [
                    'success' => false,
                    'error' => 'Message content cannot be empty'
                ];
            }

            if ($senderId === $recipientId) {
                return [
                    'success' => false,
                    'error' => 'Cannot send message to yourself'
                ];
            }

            $db = Database::getInstance();

            // Check if recipient exists
            $recipientCheck = $db->execute(
                'SELECT id FROM users WHERE id = ?',
                [$recipientId]
            );

            if ($recipientCheck->get_result()->num_rows === 0) {
                return [
                    'success' => false,
                    'error' => 'Recipient not found'
                ];
            }

            // Send message
            $stmt = $db->execute(
                'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)',
                [$senderId, $recipientId, $content]
            );

            $messageId = $db->getConnection()->insert_id;

            return [
                'success' => true,
                'message' => 'Message sent successfully',
                'message_id' => $messageId
            ];
        } catch (\Exception $e) {
            error_log('Send message error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to send message'
            ];
        }
    }

    /**
     * Get unread message count
     */
    public static function getUnreadCount($userId)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT COUNT(*) as unread FROM messages WHERE recipient_id = ? AND is_read = FALSE',
                [$userId]
            );

            $result = $stmt->get_result()->fetch_assoc();

            return [
                'success' => true,
                'unread_count' => intval($result['unread'])
            ];
        } catch (\Exception $e) {
            error_log('Get unread count error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to get unread count'
            ];
        }
    }

    /**
     * Format a conversation row
     */
    private static function formatConversationRow($row)
    {
        // Get last message preview
        $db = Database::getInstance();
        $lastMsgStmt = $db->execute(
            'SELECT content FROM messages 
             WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
             ORDER BY created_at DESC LIMIT 1',
            [$row['user_id'], $GLOBALS['current_user'] ?? 0, $GLOBALS['current_user'] ?? 0, $row['user_id']]
        );

        $lastMsg = $lastMsgStmt->get_result()->fetch_assoc();

        return [
            'id' => $row['user_id'],
            'user' => [
                'name' => $row['display_name'],
                'handle' => $row['username'],
                'avatar' => $row['avatar_url'] ?: "https://api.dicebear.com/7.x/avataaars/svg?seed={$row['username']}",
                'bio' => $row['bio']
            ],
            'lastMessage' => $lastMsg['content'] ?? '',
            'timestamp' => $row['last_message_time']
        ];
    }

    /**
     * Get all messages between two users
     */
    public static function getMessages($userId, $otherUserId, $limit = 50, $offset = 0)
    {
        try {
            $db = Database::getInstance();

            // Get all messages

            $stmt = $db->execute(
                'SELECT id, sender_id, recipient_id, content, is_read, created_at
                 FROM messages
                 WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
                 ORDER BY created_at ASC
                 LIMIT ? OFFSET ?',
                [$userId, $otherUserId, $otherUserId, $userId, $limit, $offset]
            );

            $result = $stmt->get_result();
            $messages = [];

            while ($row = $result->fetch_assoc()) {
                $messages[] = [
                    'id' => $row['id'],
                    'sender_id' => $row['sender_id'],
                    'recipient_id' => $row['recipient_id'],
                    'content' => $row['content'],
                    'is_read' => boolval($row['is_read']),
                    'created_at' => $row['created_at'],
                    'is_sent_by_current' => $row['sender_id'] == $userId
                ];
            }

            return [
                'success' => true,
                'messages' => $messages,
                'count' => count($messages)
            ];
        } catch (\Exception $e) {
            error_log('Get messages error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch messages'
            ];
        }
    }

    /**
     * Mark messages from a specific user as read
     */
    public static function markAsRead($userId, $senderId)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'UPDATE messages SET is_read = TRUE WHERE recipient_id = ? AND sender_id = ?',
                [$userId, $senderId]
            );

            return [
                'success' => true,
                'message' => 'Messages marked as read'
            ];
        } catch (\Exception $e) {
            error_log('Mark as read error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to mark messages as read'
            ];
        }
    }
}
