<?php

require_once __DIR__ . '/src/Config/Database.php';

use App\Config\Database;

echo "📦 Running database migration...\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Check if is_admin column exists
    $result = $conn->query("SHOW COLUMNS FROM users LIKE 'is_admin'");

    if ($result->num_rows === 0) {
        echo "⏳ Adding is_admin column to users table...\n";

        $sql = "ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE AFTER following";

        if ($conn->query($sql)) {
            echo "✓ is_admin column added successfully\n";
        } else {
            echo "✗ Error adding column: " . $conn->error . "\n";
        }
    } else {
        echo "✓ is_admin column already exists\n";
    }

    // Check if avatar_url exists
    $result = $conn->query("SHOW COLUMNS FROM users LIKE 'avatar_url'");

    if ($result->num_rows === 0) {
        echo "⏳ Adding avatar_url column to users table...\n";

        $sql = "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) AFTER bio";

        if ($conn->query($sql)) {
            echo "✓ avatar_url column added successfully\n";
        } else {
            echo "✗ Error adding column: " . $conn->error . "\n";
        }
    } else {
        echo "✓ avatar_url column already exists\n";
    }

    // Check if interests exists
    $result = $conn->query("SHOW COLUMNS FROM users LIKE 'interests'");

    if ($result->num_rows === 0) {
        echo "⏳ Adding interests column to users table...\n";

        $sql = "ALTER TABLE users ADD COLUMN interests TEXT AFTER avatar_url";

        if ($conn->query($sql)) {
            echo "✓ interests column added successfully\n";
        } else {
            echo "✗ Error adding column: " . $conn->error . "\n";
        }
    } else {
        echo "✓ interests column already exists\n";
    }

    // Create admin_logs table if it doesn't exist
    $result = $conn->query("SHOW TABLES LIKE 'admin_logs'");

    if ($result->num_rows === 0) {
        echo "⏳ Creating admin_logs table...\n";

        $sql = "CREATE TABLE IF NOT EXISTS admin_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          admin_id INT NOT NULL,
          action VARCHAR(50) NOT NULL,
          target_type VARCHAR(50),
          target_id INT,
          details JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_admin_id (admin_id),
          INDEX idx_action (action),
          INDEX idx_target_type (target_type),
          INDEX idx_created_at (created_at)
        )";

        if ($conn->query($sql)) {
            echo "✓ admin_logs table created successfully\n";
        } else {
            echo "✗ Error creating table: " . $conn->error . "\n";
        }
    } else {
        echo "✓ admin_logs table already exists\n";
    }

    // Create categories table if it doesn't exist
    $result = $conn->query("SHOW TABLES LIKE 'categories'");

    if ($result->num_rows === 0) {
        echo "⏳ Creating categories table...\n";

        $sql = "CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          icon VARCHAR(50),
          color VARCHAR(7),
          display_order INT DEFAULT 0,
          is_visible BOOLEAN DEFAULT TRUE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_slug (slug),
          INDEX idx_display_order (display_order)
        )";

        if ($conn->query($sql)) {
            echo "✓ categories table created successfully\n";
        } else {
            echo "✗ Error creating table: " . $conn->error . "\n";
        }
    } else {
        echo "✓ categories table already exists\n";
    }

    // Create tags table if it doesn't exist
    $result = $conn->query("SHOW TABLES LIKE 'tags'");

    if ($result->num_rows === 0) {
        echo "⏳ Creating tags table...\n";

        $sql = "CREATE TABLE IF NOT EXISTS tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
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
          INDEX idx_usage_count (usage_count)
        )";

        if ($conn->query($sql)) {
            echo "✓ tags table created successfully\n";
        } else {
            echo "✗ Error creating table: " . $conn->error . "\n";
        }
    } else {
        echo "✓ tags table already exists\n";
    }

    // Create reports table if it doesn't exist
    $result = $conn->query("SHOW TABLES LIKE 'reports'");

    if ($result->num_rows === 0) {
        echo "⏳ Creating reports table...\n";

        $sql = "CREATE TABLE IF NOT EXISTS reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          reporter_id INT NOT NULL,
          reported_user_id INT,
          post_id INT,
          comment_id INT,
          reason VARCHAR(100) NOT NULL,
          description TEXT,
          status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
          admin_id INT,
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
          FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE SET NULL,
          FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_status (status),
          INDEX idx_reporter_id (reporter_id),
          INDEX idx_reported_user_id (reported_user_id),
          INDEX idx_created_at (created_at)
        )";

        if ($conn->query($sql)) {
            echo "✓ reports table created successfully\n";
        } else {
            echo "✗ Error creating table: " . $conn->error . "\n";
        }
    } else {
        echo "✓ reports table already exists\n";
    }

    // Create contact_messages table if it doesn't exist
    $result = $conn->query("SHOW TABLES LIKE 'contact_messages'");

    if ($result->num_rows === 0) {
        echo "⏳ Creating contact_messages table...\n";

        $sql = "CREATE TABLE IF NOT EXISTS contact_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('unread', 'read', 'resolved') DEFAULT 'unread',
          admin_reply TEXT,
          replied_at TIMESTAMP NULL,
          admin_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_status (status),
          INDEX idx_email (email),
          INDEX idx_created_at (created_at)
        )";

        if ($conn->query($sql)) {
            echo "✓ contact_messages table created successfully\n";
        } else {
            echo "✗ Error creating table: " . $conn->error . "\n";
        }
    } else {
        echo "✓ contact_messages table already exists\n";
    }

    echo "\n✅ Migration complete!\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
