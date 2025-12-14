<?php

// Include required files
require_once __DIR__ . '/config/database.php';

try {
    // $pdo is already created in database.php
    if (!isset($pdo)) {
        throw new Exception("Database connection failed");
    }

    // Sample post content (mix of text-only and text with images)
    $textOnlyPosts = [
        "Just launched my new project! Excited to share it with everyone 🚀",
        "Beautiful morning today, feeling inspired and ready to create 🌅",
        "Coffee and code - the perfect combination ☕💻",
        "Learning something new every day keeps the mind sharp 📚",
        "Grateful for this amazing community! #thankful",
        "Sometimes the best ideas come at the most unexpected times 💡",
        "Working on something cool, stay tuned! 👀",
        "Don't forget to take breaks while working, your health matters 🏃",
        "Just finished reading an amazing article about tech trends 📖",
        "Creating is the best way to learn 🎨",
    ];

    $textWithImagePosts = [
        [
            "text" => "Sunset at the beach, nature's beauty is unmatched 🌅🏖️",
            "image" => "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop"
        ],
        [
            "text" => "My workspace setup, where the magic happens ✨💻",
            "image" => "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"
        ],
        [
            "text" => "Coffee break time! ☕ What's your favorite coffee shop?",
            "image" => "https://images.unsplash.com/photo-1442512595331-e89e5ea48015?w=600&h=400&fit=crop"
        ],
        [
            "text" => "Mountain hiking adventure 🏔️ Nothing beats fresh air and nature",
            "image" => "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
        ],
        [
            "text" => "Coding session at the library 📚 Silent but productive 🧑‍💻",
            "image" => "https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop"
        ],
        [
            "text" => "Urban exploration, finding beauty in the city streets 🏙️",
            "image" => "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop"
        ],
        [
            "text" => "Night coding session with some good music 🎵💻",
            "image" => "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop"
        ],
        [
            "text" => "Git commits be like... 😅 #DeveloperLife",
            "image" => "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"
        ],
        [
            "text" => "New design concept for my portfolio 🎨 What do you think?",
            "image" => "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop"
        ],
        [
            "text" => "Breakfast inspiration 🍳✨ Fueling up for a productive day",
            "image" => "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=400&fit=crop"
        ],
    ];

    // Get all users
    $stmt = $pdo->prepare("SELECT id, username FROM users ORDER BY id ASC");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($users) . " users. Starting to seed posts...\n\n";

    $postCount = 0;
    foreach ($users as $index => $user) {
        // Alternate between text-only and text-with-image posts
        if ($index % 2 === 0) {
            // Text-only post
            $postText = $textOnlyPosts[$index % count($textOnlyPosts)];
            $imageUrl = null;
        } else {
            // Text with image post
            $imagePost = $textWithImagePosts[$index % count($textWithImagePosts)];
            $postText = $imagePost['text'];
            $imageUrl = $imagePost['image'];
        }

        try {
            // Insert post
            $insertStmt = $pdo->prepare("
                INSERT INTO posts (user_id, content, image_url, created_at)
                VALUES (:user_id, :content, :image_url, NOW())
            ");

            $insertStmt->execute([
                ':user_id' => $user['id'],
                ':content' => $postText,
                ':image_url' => $imageUrl
            ]);

            $postCount++;
            $type = $imageUrl ? "with image" : "text-only";
            echo "✓ User ID {$user['id']} (@{$user['username']}): Created $type post\n";
        } catch (Exception $e) {
            echo "✗ User ID {$user['id']} (@{$user['username']}): Error - " . $e->getMessage() . "\n";
        }
    }

    echo "\n✅ Seeding complete! Created $postCount posts.\n";

} catch (Exception $e) {
    echo "Error connecting to database: " . $e->getMessage() . "\n";
}
