<?php

namespace App\Routes;

use App\Config\Database;
use App\Middleware\Auth;

class AuthRoutes
{

    public static function register()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields are required']);
            return;
        }

        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address']);
            return;
        }

        // Validate username (alphanumeric and underscore only)
        if (!preg_match('/^[a-zA-Z0-9_]{3,30}$/', $data['username'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Username must be 3-30 characters and contain only letters, numbers, and underscores']);
            return;
        }

        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        try {
            $db = Database::getInstance();
            $conn = $db->getConnection();

            // Check if user exists
            $stmt = $db->execute(
                'SELECT id FROM users WHERE email = ? OR username = ?',
                [$data['email'], $data['username']]
            );

            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                http_response_code(400);
                echo json_encode(['error' => 'User already exists']);
                return;
            }

            // Hash password
            $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

            // Create user
            $stmt = $db->execute(
                'INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)',
                [$data['username'], $data['email'], $hashedPassword, $data['username']]
            );

            $userId = $conn->insert_id;
            $token = Auth::generateToken($userId);

            http_response_code(201);
            echo json_encode([
                'message' => 'User created successfully',
                'token' => $token,
                'user' => [
                    'id' => $userId,
                    'username' => $data['username'],
                    'email' => $data['email']
                ]
            ]);
        } catch (\Exception $e) {
            error_log('Register error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
    }

    public static function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        try {
            $db = Database::getInstance();

            // Get user - exclude admin accounts
            $stmt = $db->execute(
                'SELECT id, username, email, password FROM users WHERE email = ? AND is_admin = 0',
                [$data['email']]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid email or password']);
                return;
            }

            $user = $result->fetch_assoc();

            // Verify password
            if (!password_verify($data['password'], $user['password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid email or password']);
                return;
            }

            $token = Auth::generateToken($user['id']);

            http_response_code(200);
            echo json_encode([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email']
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Login failed']);
        }
    }

    public static function adminLogin()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        try {
            $db = Database::getInstance();

            // Get admin user
            $stmt = $db->execute(
                'SELECT id, username, email, password, is_admin FROM users WHERE email = ? AND is_admin = 1',
                [$data['email']]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid admin credentials']);
                return;
            }

            $user = $result->fetch_assoc();

            // Verify password
            if (!password_verify($data['password'], $user['password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid admin credentials']);
                return;
            }

            $token = Auth::generateToken($user['id']);

            http_response_code(200);
            echo json_encode([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'is_admin' => $user['is_admin']
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Admin login failed']);
        }
    }

    public static function me()
    {
        $token = Auth::getToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            return;
        }

        $decoded = Auth::verifyToken($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            return;
        }

        try {
            $db = Database::getInstance();

            $stmt = $db->execute(
                'SELECT id, username, email, display_name, bio, avatar_url, interests, followers, following FROM users WHERE id = ?',
                [$decoded['userId']]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                return;
            }

            $user = $result->fetch_assoc();

            // Parse interests if they exist
            if ($user['interests']) {
                $user['interests'] = array_map('trim', explode(',', $user['interests']));
            } else {
                $user['interests'] = [];
            }

            http_response_code(200);
            echo json_encode(['user' => $user]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch user']);
        }
    }
}
