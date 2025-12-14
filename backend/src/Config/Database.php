<?php

namespace App\Config;

use mysqli;

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $host = getenv('DB_HOST') ?: 'localhost';
        $user = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: '';
        $database = getenv('DB_NAME') ?: 'trendle';

        $this->connection = new mysqli($host, $user, $password, $database);

        if ($this->connection->connect_error) {
            error_log('DB Connection Error: ' . $this->connection->connect_error);
            die(json_encode(['error' => 'Database connection failed: ' . $this->connection->connect_error]));
        }

        $this->connection->set_charset("utf8mb4");
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    public function query($sql) {
        return $this->connection->query($sql);
    }

    public function execute($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        
        if (!$stmt) {
            error_log('Prepare failed: ' . $this->connection->error . ' SQL: ' . $sql);
            throw new \Exception('Prepare failed: ' . $this->connection->error);
        }

        if (!empty($params)) {
            $types = '';
            foreach ($params as $param) {
                if (is_int($param)) $types .= 'i';
                elseif (is_float($param)) $types .= 'd';
                elseif (is_string($param)) $types .= 's';
                else $types .= 's';
            }

            if (!$stmt->bind_param($types, ...$params)) {
                error_log('Bind failed: ' . $stmt->error);
                throw new \Exception('Bind failed: ' . $stmt->error);
            }
        }

        if (!$stmt->execute()) {
            error_log('Execute failed: ' . $stmt->error . ' SQL: ' . $sql);
            throw new \Exception('Execute failed: ' . $stmt->error);
        }

        return $stmt;
    }

    public function close() {
        $this->connection->close();
    }
}
