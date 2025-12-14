<?php

require_once __DIR__ . '/src/Config/Database.php';

class Seeder
{
    private $db;

    public function __construct()
    {
        $this->db = \App\Config\Database::getInstance();
    }

    public function seed()
    {
        echo "Starting database seeding...\n";

        // Clear existing data
        $this->clearData();

        // Create users
        $users = $this->createUsers();

        // Create follow relationships
        $this->createFollowRelationships($users);

        // Create posts
        $this->createPosts($users);

        // Create communities
        $this->createCommunities();

        // Create tags/hashtags
        $this->createTags();

        echo "Seeding completed successfully!\n";
    }

    private function clearData()
    {
        echo "Clearing existing data...\n";

        $tables = [
            'likes',
            'reposts',
            'comments',
            'post_tags',
            'posts',
            'user_communities',
            'communities',
            'follows',
            'messages',
            'user_settings',
            'users'
        ];

        foreach ($tables as $table) {
            try {
                $this->db->getConnection()->query("TRUNCATE TABLE $table");
                echo "  ✓ Cleared $table\n";
            } catch (\Exception $e) {
                echo "  ✗ Could not clear $table\n";
            }
        }

        // Re-create admin user
        $this->db->execute(
            'INSERT IGNORE INTO users (username, email, password, display_name, is_admin, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())',
            ['admin', 'admin@trendle.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DJm', 'Administrator', true]
        );
    }

    private function createUsers()
    {
        echo "Creating test users...\n";

        $users = [
            [
                'username' => 'artlover',
                'email' => 'artlover@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Art Lover',
                'bio' => 'Passionate about digital art and design',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=artlover'
            ],
            [
                'username' => 'musicfreakk',
                'email' => 'music@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Music Freak',
                'bio' => 'Always listening to something new 🎵',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=musicfreakk'
            ],
            [
                'username' => 'techguru',
                'email' => 'tech@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Tech Guru',
                'bio' => 'Software developer and tech enthusiast',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=techguru'
            ],
            [
                'username' => 'naturejunkie',
                'email' => 'nature@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Nature Junkie',
                'bio' => 'Exploring the beauty of nature 🌿',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=naturejunkie'
            ],
            [
                'username' => 'foodie_adventures',
                'email' => 'foodie@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Foodie Adventures',
                'bio' => 'Trying every food in the city 🍜',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=foodie_adventures'
            ],
            [
                'username' => 'fitnessgyal',
                'email' => 'fitness@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Fitness Gyal',
                'bio' => 'Fitness coach and wellness advocate',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitnessgyal'
            ],
            [
                'username' => 'bookworm_reads',
                'email' => 'books@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Book Worm',
                'bio' => 'Reading one book at a time 📚',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=bookworm_reads'
            ],
            [
                'username' => 'photography_pro',
                'email' => 'photo@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Photography Pro',
                'bio' => 'Capturing moments, creating memories 📸',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=photography_pro'
            ],
            [
                'username' => 'travelers_soul',
                'email' => 'travel@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => "Traveler's Soul",
                'bio' => 'Exploring the world one trip at a time ✈️',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=travelers_soul'
            ],
            [
                'username' => 'gaming_legend',
                'email' => 'gaming@example.com',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'display_name' => 'Gaming Legend',
                'bio' => 'Professional gamer and streamer 🎮',
                'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=gaming_legend'
            ]
        ];

        $createdUsers = [];

        foreach ($users as $userData) {
            try {
                $this->db->execute(
                    'INSERT INTO users (username, email, password, display_name, bio, avatar_url, followers, following, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, 0, 0, NOW())',
                    [
                        $userData['username'],
                        $userData['email'],
                        $userData['password'],
                        $userData['display_name'],
                        $userData['bio'],
                        $userData['avatar_url']
                    ]
                );

                $userId = $this->db->getConnection()->insert_id;
                $createdUsers[$userData['username']] = $userId;

                // Create default settings for user
                $this->db->execute(
                    'INSERT INTO user_settings (user_id, dark_mode, email_notifications, push_notifications, language, privacy_level, two_factor_enabled)
                     VALUES (?, 0, 1, 0, "en", "public", 0)',
                    [$userId]
                );

                echo "  ✓ Created user: {$userData['username']}\n";
            } catch (\Exception $e) {
                echo "  ✗ Failed to create user: {$userData['username']} - {$e->getMessage()}\n";
            }
        }

        return $createdUsers;
    }

    private function createFollowRelationships($users)
    {
        echo "Creating follow relationships...\n";

        $usernames = array_keys($users);

        // Create a following network
        $relationships = [
            'artlover' => ['musicfreakk', 'techguru', 'photography_pro'],
            'musicfreakk' => ['artlover', 'techguru', 'gaming_legend'],
            'techguru' => ['artlover', 'musicfreakk', 'fitnessgyal'],
            'naturejunkie' => ['artlover', 'photography_pro', 'travelers_soul'],
            'foodie_adventures' => ['fitnessgyal', 'travelers_soul'],
            'fitnessgyal' => ['foodie_adventures', 'techguru'],
            'bookworm_reads' => ['artlover', 'naturejunkie'],
            'photography_pro' => ['artlover', 'naturejunkie', 'travelers_soul'],
            'travelers_soul' => ['photography_pro', 'naturejunkie', 'foodie_adventures'],
            'gaming_legend' => ['musicfreakk', 'techguru']
        ];

        foreach ($relationships as $follower => $following_list) {
            foreach ($following_list as $following) {
                try {
                    $this->db->execute(
                        'INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, NOW())',
                        [$users[$follower], $users[$following]]
                    );

                    // Update counts
                    $this->db->getConnection()->query("UPDATE users SET following = following + 1 WHERE id = {$users[$follower]}");
                    $this->db->getConnection()->query("UPDATE users SET followers = followers + 1 WHERE id = {$users[$following]}");
                } catch (\Exception $e) {
                    // Skip duplicate follows
                }
            }
        }

        echo "  ✓ Follow relationships created\n";
    }

    private function createPosts($users)
    {
        echo "Creating posts...\n";

        $postData = [
            'artlover' => [
                'Just finished a new digital art piece! So proud of how it turned out 🎨',
                'The key to great art is practice and patience. Keep creating!',
                'Digital art tools have come so far. Amazing what we can create today.'
            ],
            'musicfreakk' => [
                'New album drop incoming! Can\'t wait to share my music with you all 🎵',
                'There\'s something special about live music. Nothing beats it.',
                'Music is the universal language that connects us all.'
            ],
            'techguru' => [
                'Just deployed a new feature at work. Feeling accomplished! 💻',
                'JavaScript frameworks are evolving so fast. Hard to keep up!',
                'Remember to always write clean code. Future you will thank you.'
            ],
            'naturejunkie' => [
                'Hiking in the mountains this weekend. Nature is the best medicine 🌲',
                'Protecting our environment is everyone\'s responsibility.',
                'There\'s nothing like sunrise in the mountains. Pure magic.'
            ],
            'foodie_adventures' => [
                'Found the best ramen place in the city! Must visit 🍜',
                'Food is not just fuel, it\'s an experience.',
                'Trying fusion cuisine tonight. Excited to see what they\'ve created!'
            ],
            'fitnessgyal' => [
                'Consistency beats intensity every single time! Keep grinding 💪',
                'Your body is a temple. Treat it with respect.',
                'Remember: progress over perfection. Every workout counts!'
            ],
            'bookworm_reads' => [
                'Just finished an amazing sci-fi novel. Couldn\'t put it down! 📚',
                'Books transport us to different worlds. That\'s pure magic.',
                'Currently reading: A mind-bending thriller. Highly recommend!'
            ],
            'photography_pro' => [
                'Golden hour photography is my favorite. The light is just perfect ✨',
                'Photography is about telling stories without words.',
                'Invested in a new camera lens. Ready to capture more beauty!'
            ],
            'travelers_soul' => [
                'Just landed in Japan! The culture here is absolutely breathtaking 🗾',
                'Travel is the best teacher. Learn the world through experience.',
                'Sometimes the best memories come from getting lost in a new place.'
            ],
            'gaming_legend' => [
                'New gaming setup is complete! Ready for some serious gaming sessions 🎮',
                'Just beat the final boss! What an incredible game journey.',
                'Gaming communities are the most supportive. Love this hobby!'
            ]
        ];

        foreach ($postData as $username => $posts) {
            foreach ($posts as $content) {
                try {
                    $this->db->execute(
                        'INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, NOW())',
                        [$users[$username], $content]
                    );

                    echo "  ✓ Created post by {$username}\n";
                } catch (\Exception $e) {
                    echo "  ✗ Failed to create post by {$username}\n";
                }
            }
        }
    }

    private function createCommunities()
    {
        echo "Creating communities...\n";

        $communities = [
            [
                'name' => 'Digital Art',
                'description' => 'A community for digital artists to share their work and learn from each other.',
                'avatar_url' => 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'
            ],
            [
                'name' => 'Music Lovers',
                'description' => 'Share your favorite music, discover new artists, and discuss all genres.',
                'avatar_url' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'
            ],
            [
                'name' => 'Tech Enthusiasts',
                'description' => 'Discussion about technology, programming, and latest tech news.',
                'avatar_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'
            ],
            [
                'name' => 'Nature Explorers',
                'description' => 'Share your outdoor adventures and nature photography.',
                'avatar_url' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
            ],
            [
                'name' => 'Food & Cooking',
                'description' => 'Share recipes, restaurant reviews, and food photography.',
                'avatar_url' => 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400'
            ],
            [
                'name' => 'Fitness & Health',
                'description' => 'Share fitness tips, workout routines, and health advice.',
                'avatar_url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'
            ],
            [
                'name' => 'Book Club',
                'description' => 'Discuss books, share recommendations, and connect with readers.',
                'avatar_url' => 'https://images.unsplash.com/photo-1507842217343-583b8926d889?w=400'
            ],
            [
                'name' => 'Photography',
                'description' => 'Share photos, techniques, and photography tips with fellow photographers.',
                'avatar_url' => 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'
            ],
            [
                'name' => 'Travel Stories',
                'description' => 'Share your travel experiences, tips, and recommendations.',
                'avatar_url' => 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'
            ],
            [
                'name' => 'Gaming',
                'description' => 'Discuss games, gaming setups, streaming, and gaming communities.',
                'avatar_url' => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400'
            ]
        ];

        foreach ($communities as $communityData) {
            try {
                $this->db->execute(
                    'INSERT INTO communities (name, description, avatar_url, member_count, created_at)
                     VALUES (?, ?, ?, 0, NOW())',
                    [
                        $communityData['name'],
                        $communityData['description'],
                        $communityData['avatar_url']
                    ]
                );

                echo "  ✓ Created community: {$communityData['name']}\n";
            } catch (\Exception $e) {
                echo "  ✗ Failed to create community: {$communityData['name']}\n";
            }
        }
    }

    private function createTags()
    {
        echo "Creating tags...\n";

        $tags = [
            ['name' => 'art', 'slug' => 'art', 'usage_count' => 1250],
            ['name' => 'music', 'slug' => 'music', 'usage_count' => 2340],
            ['name' => 'technology', 'slug' => 'technology', 'usage_count' => 3100],
            ['name' => 'nature', 'slug' => 'nature', 'usage_count' => 890],
            ['name' => 'food', 'slug' => 'food', 'usage_count' => 1560],
            ['name' => 'fitness', 'slug' => 'fitness', 'usage_count' => 1020],
            ['name' => 'books', 'slug' => 'books', 'usage_count' => 640],
            ['name' => 'photography', 'slug' => 'photography', 'usage_count' => 2100],
            ['name' => 'travel', 'slug' => 'travel', 'usage_count' => 1780],
            ['name' => 'gaming', 'slug' => 'gaming', 'usage_count' => 2450],
            ['name' => 'inspiration', 'slug' => 'inspiration', 'usage_count' => 3200],
            ['name' => 'lifestyle', 'slug' => 'lifestyle', 'usage_count' => 2800]
        ];

        foreach ($tags as $tagData) {
            try {
                $this->db->execute(
                    'INSERT INTO tags (name, slug, usage_count, is_active, is_nsfw, created_at)
                     VALUES (?, ?, ?, 1, 0, NOW())',
                    [
                        $tagData['name'],
                        $tagData['slug'],
                        $tagData['usage_count']
                    ]
                );

                echo "  ✓ Created tag: {$tagData['name']}\n";
            } catch (\Exception $e) {
                echo "  ✗ Failed to create tag: {$tagData['name']}\n";
            }
        }
    }
}

// Run seeder
try {
    $seeder = new Seeder();
    $seeder->seed();
    echo "\n✅ Database seeding completed successfully!\n\n";
} catch (\Exception $e) {
    echo "\n❌ Seeding failed: " . $e->getMessage() . "\n\n";
    exit(1);
}
