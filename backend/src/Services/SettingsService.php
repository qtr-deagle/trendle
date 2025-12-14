<?php

namespace App\Services;

use App\Config\Database;

class SettingsService
{

    /**
     * Get user settings
     */
    public static function getUserSettings($userId)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT id, user_id, dark_mode, email_notifications, push_notifications, language, privacy_level, two_factor_enabled
                 FROM user_settings
                 WHERE user_id = ?',
                [$userId]
            );

            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                // Create default settings if they don't exist
                self::createDefaultSettings($userId);
                $result = $db->execute(
                    'SELECT id, user_id, dark_mode, email_notifications, push_notifications, language, privacy_level, two_factor_enabled
                     FROM user_settings
                     WHERE user_id = ?',
                    [$userId]
                )->get_result();
            }

            $settings = $result->fetch_assoc();

            return [
                'success' => true,
                'settings' => [
                    'id' => $settings['id'],
                    'userId' => $settings['user_id'],
                    'darkMode' => boolval($settings['dark_mode']),
                    'emailNotifications' => boolval($settings['email_notifications']),
                    'pushNotifications' => boolval($settings['push_notifications']),
                    'language' => $settings['language'],
                    'privacyLevel' => $settings['privacy_level'],
                    'twoFactorEnabled' => boolval($settings['two_factor_enabled'])
                ]
            ];
        } catch (\Exception $e) {
            error_log('Get user settings error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to fetch settings'
            ];
        }
    }

    /**
     * Update user settings
     */
    public static function updateUserSettings($userId, $settings)
    {
        try {
            $db = Database::getInstance();

            // Check if settings exist
            $checkStmt = $db->execute(
                'SELECT id FROM user_settings WHERE user_id = ?',
                [$userId]
            );

            $updates = [];
            $params = [];

            // Build dynamic update query based on provided settings
            if (isset($settings['darkMode'])) {
                $updates[] = 'dark_mode = ?';
                $params[] = boolval($settings['darkMode']) ? 1 : 0;
            }

            if (isset($settings['emailNotifications'])) {
                $updates[] = 'email_notifications = ?';
                $params[] = boolval($settings['emailNotifications']) ? 1 : 0;
            }

            if (isset($settings['pushNotifications'])) {
                $updates[] = 'push_notifications = ?';
                $params[] = boolval($settings['pushNotifications']) ? 1 : 0;
            }

            if (isset($settings['language'])) {
                $updates[] = 'language = ?';
                $params[] = $settings['language'];
            }

            if (isset($settings['privacyLevel'])) {
                $updates[] = 'privacy_level = ?';
                $params[] = $settings['privacyLevel'];
            }

            if (isset($settings['twoFactorEnabled'])) {
                $updates[] = 'two_factor_enabled = ?';
                $params[] = boolval($settings['twoFactorEnabled']) ? 1 : 0;
            }

            if (empty($updates)) {
                return [
                    'success' => false,
                    'error' => 'No settings to update'
                ];
            }

            $params[] = $userId;

            if ($checkStmt->get_result()->num_rows === 0) {
                // Create settings if they don't exist
                self::createDefaultSettings($userId);
            }

            // Update settings
            $sql = 'UPDATE user_settings SET ' . implode(', ', $updates) . ' WHERE user_id = ?';
            $db->execute($sql, $params);

            // Fetch and return updated settings
            return self::getUserSettings($userId);
        } catch (\Exception $e) {
            error_log('Update user settings error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to update settings'
            ];
        }
    }

    /**
     * Update user account settings (email, password, etc.)
     */
    public static function updateAccountSettings($userId, $updates)
    {
        try {
            $db = Database::getInstance();

            $updateFields = [];
            $params = [];

            if (isset($updates['email'])) {
                // Check if email already exists
                $existStmt = $db->execute(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [$updates['email'], $userId]
                );
                if ($existStmt->get_result()->num_rows > 0) {
                    return [
                        'success' => false,
                        'error' => 'Email already in use'
                    ];
                }
                $updateFields[] = 'email = ?';
                $params[] = $updates['email'];
            }

            if (isset($updates['display_name'])) {
                $updateFields[] = 'display_name = ?';
                $params[] = $updates['display_name'];
            }

            if (isset($updates['bio'])) {
                $updateFields[] = 'bio = ?';
                $params[] = $updates['bio'];
            }

            if (isset($updates['password'])) {
                $updateFields[] = 'password = ?';
                $params[] = password_hash($updates['password'], PASSWORD_BCRYPT);
            }

            if (empty($updateFields)) {
                return [
                    'success' => false,
                    'error' => 'No fields to update'
                ];
            }

            $params[] = $userId;
            $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
            $db->execute($sql, $params);

            return [
                'success' => true,
                'message' => 'Account settings updated successfully'
            ];
        } catch (\Exception $e) {
            error_log('Update account settings error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Failed to update account settings'
            ];
        }
    }

    /**
     * Create default settings for a user
     */
    private static function createDefaultSettings($userId)
    {
        try {
            $db = Database::getInstance();

            $db->execute(
                'INSERT INTO user_settings (user_id, dark_mode, email_notifications, push_notifications, language, privacy_level, two_factor_enabled)
                 VALUES (?, ?, ?, ?, ?, ?, ?)',
                [$userId, false, true, false, 'en', 'public', false]
            );
        } catch (\Exception $e) {
            error_log('Create default settings error: ' . $e->getMessage());
        }
    }

    /**
     * Check if two-factor authentication is enabled
     */
    public static function isTwoFactorEnabled($userId)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT two_factor_enabled FROM user_settings WHERE user_id = ?',
                [$userId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                return false;
            }

            $row = $result->fetch_assoc();
            return boolval($row['two_factor_enabled']);
        } catch (\Exception $e) {
            error_log('Check 2FA error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get privacy settings
     */
    public static function getPrivacySettings($userId)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT privacy_level FROM user_settings WHERE user_id = ?',
                [$userId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                return 'public';
            }

            $row = $result->fetch_assoc();
            return $row['privacy_level'];
        } catch (\Exception $e) {
            error_log('Get privacy settings error: ' . $e->getMessage());
            return 'public';
        }
    }

    /**
     * Get notification preferences
     */
    public static function getNotificationPreferences($userId)
    {
        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT email_notifications, push_notifications FROM user_settings WHERE user_id = ?',
                [$userId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                return [
                    'emailNotifications' => true,
                    'pushNotifications' => false
                ];
            }

            $row = $result->fetch_assoc();
            return [
                'emailNotifications' => boolval($row['email_notifications']),
                'pushNotifications' => boolval($row['push_notifications'])
            ];
        } catch (\Exception $e) {
            error_log('Get notification preferences error: ' . $e->getMessage());
            return [
                'emailNotifications' => true,
                'pushNotifications' => false
            ];
        }
    }
}
