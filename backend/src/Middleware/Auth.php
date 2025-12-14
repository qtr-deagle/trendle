<?php

namespace App\Middleware;

class Auth {
    private static $secret;

    public static function setSecret($secret) {
        self::$secret = $secret;
    }

    public static function generateToken($userId) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'userId' => $userId,
            'iat' => time(),
            'exp' => time() + (7 * 24 * 60 * 60) // 7 days
        ]);

        $header = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
        $payload = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');

        $signature = hash_hmac(
            'sha256',
            $header . '.' . $payload,
            self::$secret,
            true
        );
        $signature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

        return $header . '.' . $payload . '.' . $signature;
    }

    public static function verifyToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        $valid_signature = hash_hmac(
            'sha256',
            $header . '.' . $payload,
            self::$secret,
            true
        );
        $valid_signature = rtrim(strtr(base64_encode($valid_signature), '+/', '-_'), '=');

        if ($signature !== $valid_signature) {
            return null;
        }

        $decoded = json_decode(
            base64_decode(strtr($payload, '-_', '+/')),
            true
        );

        if ($decoded['exp'] < time()) {
            return null;
        }

        return $decoded;
    }

    public static function getToken() {
        // Try getallheaders() first (Apache/Nginx)
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $auth = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
                    return $matches[1];
                }
            }
        }
        
        // Fallback to $_SERVER for other cases
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth = $_SERVER['HTTP_AUTHORIZATION'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
}
