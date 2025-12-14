-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 15, 2025 at 12:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `trendle`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_logs`
--

INSERT INTO `admin_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES
(1, 3, 'update_tag', 'tag', 11, '{\"name\":{\"old\":\"inspiration\",\"new\":\"inspirations\"}}', '2025-12-14 17:15:55'),
(2, 3, 'update_tag', 'tag', 11, '{\"name\":{\"old\":\"inspirations\",\"new\":\"inspirationss\"}}', '2025-12-14 17:15:59'),
(3, 3, 'update_tag', 'tag', 11, '{\"name\":{\"old\":\"inspirationss\",\"new\":\"inspirationssADSADAS\"}}', '2025-12-14 17:16:02'),
(4, 3, 'update_tag', 'tag', 11, '{\"name\":{\"old\":\"inspirationssADSADAS\",\"new\":\"inspirationssADSADASASDAS\"}}', '2025-12-14 17:16:06'),
(5, 3, 'update_tag', 'tag', 3, '{\"name\":{\"old\":\"technology\",\"new\":\"technologyADSAD\"}}', '2025-12-14 17:16:09'),
(6, 3, 'create_tag', 'tag', 25, '{\"tag_name\":\"adAD\",\"slug\":\"ASD\"}', '2025-12-14 17:16:14'),
(7, 3, 'update_tag', 'tag', 10, '{\"name\":{\"old\":\"gaming\",\"new\":\"gamingsad\"}}', '2025-12-14 21:25:46'),
(8, 3, 'update_tag', 'tag', 10, '{\"description\":{\"old\":\"\",\"new\":\"asdad\"}}', '2025-12-14 21:25:51'),
(9, 3, 'update_tag', 'tag', 10, '{\"description\":{\"old\":\"asdad\",\"new\":\"asdaddsada\"}}', '2025-12-14 21:25:54'),
(10, 3, 'create_tag', 'tag', 49, '{\"tag_name\":\"sad\",\"slug\":\"sadsa\"}', '2025-12-14 22:10:41'),
(11, 3, 'update_tag', 'tag', 9, '{\"name\":{\"old\":\"travel\",\"new\":\"travelTESVESTSE\"}}', '2025-12-14 22:48:52');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_visible` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `communities`
--

CREATE TABLE `communities` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `member_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `communities`
--

INSERT INTO `communities` (`id`, `name`, `description`, `avatar_url`, `member_count`, `created_at`, `updated_at`) VALUES
(1, 'Digital Art', 'A community for digital artists to share their work and learn from each other.', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400', 1, '2025-12-14 13:54:22', '2025-12-14 22:47:01'),
(2, 'Music Lovers', 'Share your favorite music, discover new artists, and discuss all genres.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(3, 'Tech Enthusiasts', 'Discussion about technology, programming, and latest tech news.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(4, 'Nature Explorers', 'Share your outdoor adventures and nature photography.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(5, 'Food & Cooking', 'Share recipes, restaurant reviews, and food photography.', 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(6, 'Fitness & Health', 'Share fitness tips, workout routines, and health advice.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(7, 'Book Club', 'Discuss books, share recommendations, and connect with readers.', 'https://images.unsplash.com/photo-1507842217343-583b8926d889?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(8, 'Photography', 'Share photos, techniques, and photography tips with fellow photographers.', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(9, 'Travel Stories', 'Share your travel experiences, tips, and recommendations.', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 21:27:20'),
(10, 'Gaming', 'Discuss games, gaming setups, streaming, and gaming communities.', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400', 0, '2025-12-14 13:54:22', '2025-12-14 21:27:20');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','resolved') DEFAULT 'unread',
  `admin_reply` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `id` int(11) NOT NULL,
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `follows`
--

INSERT INTO `follows` (`id`, `follower_id`, `following_id`, `created_at`) VALUES
(193, 110, 81, '2025-12-14 21:23:21'),
(194, 110, 77, '2025-12-14 21:23:23'),
(196, 110, 80, '2025-12-14 21:23:47'),
(197, 110, 74, '2025-12-14 21:24:25'),
(198, 110, 82, '2025-12-14 21:24:26');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) DEFAULT NULL,
  `comment_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`) VALUES
(11, 3, 110, 'hey', 1, '2025-12-14 22:57:18'),
(17, 3, 110, 'ga', 1, '2025-12-14 23:07:18'),
(18, 110, 3, 'hello', 0, '2025-12-14 23:07:32');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `content`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 74, 'Just finished a new digital art piece! So proud of how it turned out 🎨', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(2, 74, 'The key to great art is practice and patience. Keep creating!', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(3, 74, 'Digital art tools have come so far. Amazing what we can create today.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(4, 75, 'New album drop incoming! Can\'t wait to share my music with you all 🎵', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(5, 75, 'There\'s something special about live music. Nothing beats it.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(6, 75, 'Music is the universal language that connects us all.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(7, 76, 'Just deployed a new feature at work. Feeling accomplished! 💻', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(8, 76, 'JavaScript frameworks are evolving so fast. Hard to keep up!', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(9, 76, 'Remember to always write clean code. Future you will thank you.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(10, 77, 'Hiking in the mountains this weekend. Nature is the best medicine 🌲', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(11, 77, 'Protecting our environment is everyone\'s responsibility.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(12, 77, 'There\'s nothing like sunrise in the mountains. Pure magic.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(13, 78, 'Found the best ramen place in the city! Must visit 🍜', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(14, 78, 'Food is not just fuel, it\'s an experience.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(15, 78, 'Trying fusion cuisine tonight. Excited to see what they\'ve created!', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(16, 79, 'Consistency beats intensity every single time! Keep grinding 💪', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(17, 79, 'Your body is a temple. Treat it with respect.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(18, 79, 'Remember: progress over perfection. Every workout counts!', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(19, 80, 'Just finished an amazing sci-fi novel. Couldn\'t put it down! 📚', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(20, 80, 'Books transport us to different worlds. That\'s pure magic.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(21, 80, 'Currently reading: A mind-bending thriller. Highly recommend!', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(22, 81, 'Golden hour photography is my favorite. The light is just perfect ✨', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(23, 81, 'Photography is about telling stories without words.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(24, 81, 'Invested in a new camera lens. Ready to capture more beauty!', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(25, 82, 'Just landed in Japan! The culture here is absolutely breathtaking 🗾', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(26, 82, 'Travel is the best teacher. Learn the world through experience.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(27, 82, 'Sometimes the best memories come from getting lost in a new place.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(28, 83, 'New gaming setup is complete! Ready for some serious gaming sessions 🎮', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(29, 83, 'Just beat the final boss! What an incredible game journey.', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(30, 83, 'Gaming communities are the most supportive. Love this hobby!', NULL, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(38, 3, 'Just launched my new project! Excited to share it with everyone 🚀', NULL, '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(42, 74, 'Grateful for this amazing community! #thankful', NULL, '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(43, 75, 'Urban exploration, finding beauty in the city streets 🏙️', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop', '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(44, 76, 'Working on something cool, stay tuned! 👀', NULL, '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(45, 77, 'Git commits be like... 😅 #DeveloperLife', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop', '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(46, 78, 'Just finished reading an amazing article about tech trends 📖', NULL, '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(47, 79, 'Breakfast inspiration 🍳✨ Fueling up for a productive day', 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=400&fit=crop', '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(48, 80, 'Just launched my new project! Excited to share it with everyone 🚀', NULL, '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(49, 81, 'My workspace setup, where the magic happens ✨💻', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop', '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(50, 82, 'Coffee and code - the perfect combination ☕💻', NULL, '2025-12-14 19:15:49', '2025-12-14 19:15:49'),
(51, 83, 'Mountain hiking adventure 🏔️ Nothing beats fresh air and nature', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', '2025-12-14 19:15:49', '2025-12-14 19:15:49');

-- --------------------------------------------------------

--
-- Table structure for table `post_tags`
--

CREATE TABLE `post_tags` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_tags`
--

INSERT INTO `post_tags` (`id`, `post_id`, `tag_id`, `created_at`) VALUES
(162, 38, 9, '2025-12-14 20:13:04'),
(163, 38, 35, '2025-12-14 20:13:04'),
(164, 38, 36, '2025-12-14 20:13:04'),
(165, 38, 4, '2025-12-14 20:13:04'),
(166, 38, 39, '2025-12-14 20:13:04'),
(167, 38, 40, '2025-12-14 20:13:04'),
(168, 2, 9, '2025-12-14 20:13:04'),
(169, 2, 6, '2025-12-14 20:13:04'),
(170, 2, 34, '2025-12-14 20:13:04'),
(171, 2, 10, '2025-12-14 20:13:04'),
(172, 2, 35, '2025-12-14 20:13:04'),
(173, 2, 8, '2025-12-14 20:13:04'),
(174, 2, 39, '2025-12-14 20:13:04'),
(175, 2, 1, '2025-12-14 20:13:04'),
(176, 2, 40, '2025-12-14 20:13:04'),
(177, 2, 41, '2025-12-14 20:13:04'),
(178, 3, 6, '2025-12-14 20:13:04'),
(179, 3, 34, '2025-12-14 20:13:04'),
(180, 3, 36, '2025-12-14 20:13:04'),
(181, 3, 4, '2025-12-14 20:13:04'),
(182, 3, 40, '2025-12-14 20:13:04'),
(183, 3, 41, '2025-12-14 20:13:04'),
(184, 42, 34, '2025-12-14 20:13:04'),
(185, 42, 35, '2025-12-14 20:13:04'),
(186, 42, 8, '2025-12-14 20:13:04'),
(187, 4, 34, '2025-12-14 20:13:04'),
(188, 4, 10, '2025-12-14 20:13:04'),
(189, 4, 35, '2025-12-14 20:13:04'),
(190, 4, 36, '2025-12-14 20:13:04'),
(191, 4, 39, '2025-12-14 20:13:04'),
(192, 4, 40, '2025-12-14 20:13:04'),
(193, 4, 41, '2025-12-14 20:13:04'),
(194, 6, 9, '2025-12-14 20:13:04'),
(195, 6, 10, '2025-12-14 20:13:04'),
(196, 6, 8, '2025-12-14 20:13:04'),
(197, 6, 4, '2025-12-14 20:13:04'),
(198, 7, 9, '2025-12-14 20:13:04'),
(199, 7, 6, '2025-12-14 20:13:04'),
(200, 7, 34, '2025-12-14 20:13:04'),
(201, 7, 10, '2025-12-14 20:13:04'),
(202, 7, 8, '2025-12-14 20:13:04'),
(203, 7, 36, '2025-12-14 20:13:04'),
(204, 7, 4, '2025-12-14 20:13:04'),
(205, 7, 39, '2025-12-14 20:13:04'),
(206, 7, 1, '2025-12-14 20:13:04'),
(207, 7, 40, '2025-12-14 20:13:04'),
(208, 7, 41, '2025-12-14 20:13:04'),
(209, 8, 9, '2025-12-14 20:13:04'),
(210, 8, 6, '2025-12-14 20:13:04'),
(211, 8, 34, '2025-12-14 20:13:04'),
(212, 8, 10, '2025-12-14 20:13:04'),
(213, 8, 35, '2025-12-14 20:13:04'),
(214, 8, 8, '2025-12-14 20:13:04'),
(215, 8, 36, '2025-12-14 20:13:04'),
(216, 8, 4, '2025-12-14 20:13:04'),
(217, 8, 39, '2025-12-14 20:13:04'),
(218, 8, 1, '2025-12-14 20:13:04'),
(219, 8, 40, '2025-12-14 20:13:04'),
(220, 8, 41, '2025-12-14 20:13:04'),
(221, 9, 9, '2025-12-14 20:13:04'),
(222, 9, 34, '2025-12-14 20:13:04'),
(223, 9, 35, '2025-12-14 20:13:04'),
(224, 9, 39, '2025-12-14 20:13:04'),
(225, 9, 1, '2025-12-14 20:13:04'),
(226, 9, 40, '2025-12-14 20:13:04'),
(227, 44, 6, '2025-12-14 20:13:04'),
(228, 44, 10, '2025-12-14 20:13:04'),
(229, 44, 8, '2025-12-14 20:13:04'),
(230, 44, 40, '2025-12-14 20:13:04'),
(231, 10, 9, '2025-12-14 20:13:04'),
(232, 10, 6, '2025-12-14 20:13:04'),
(233, 10, 34, '2025-12-14 20:13:04'),
(234, 10, 10, '2025-12-14 20:13:04'),
(235, 10, 35, '2025-12-14 20:13:04'),
(236, 10, 8, '2025-12-14 20:13:04'),
(237, 10, 36, '2025-12-14 20:13:04'),
(238, 10, 4, '2025-12-14 20:13:04'),
(239, 10, 39, '2025-12-14 20:13:04'),
(240, 10, 1, '2025-12-14 20:13:04'),
(241, 10, 40, '2025-12-14 20:13:04'),
(242, 10, 41, '2025-12-14 20:13:04'),
(243, 11, 6, '2025-12-14 20:13:04'),
(244, 11, 34, '2025-12-14 20:13:04'),
(245, 11, 10, '2025-12-14 20:13:04'),
(246, 11, 35, '2025-12-14 20:13:04'),
(247, 11, 8, '2025-12-14 20:13:04'),
(248, 11, 36, '2025-12-14 20:13:04'),
(249, 11, 4, '2025-12-14 20:13:04'),
(250, 11, 39, '2025-12-14 20:13:04'),
(251, 11, 1, '2025-12-14 20:13:04'),
(252, 11, 40, '2025-12-14 20:13:04'),
(253, 11, 41, '2025-12-14 20:13:04'),
(254, 12, 9, '2025-12-14 20:13:04'),
(255, 12, 34, '2025-12-14 20:13:04'),
(256, 12, 10, '2025-12-14 20:13:04'),
(257, 12, 35, '2025-12-14 20:13:04'),
(258, 12, 36, '2025-12-14 20:13:04'),
(259, 12, 4, '2025-12-14 20:13:04'),
(260, 12, 39, '2025-12-14 20:13:04'),
(261, 12, 1, '2025-12-14 20:13:04'),
(262, 12, 40, '2025-12-14 20:13:04'),
(263, 12, 41, '2025-12-14 20:13:04'),
(264, 45, 9, '2025-12-14 20:13:04'),
(265, 45, 4, '2025-12-14 20:13:04'),
(266, 45, 40, '2025-12-14 20:13:04'),
(267, 45, 41, '2025-12-14 20:13:04'),
(268, 13, 9, '2025-12-14 20:13:04'),
(269, 13, 6, '2025-12-14 20:13:04'),
(270, 13, 34, '2025-12-14 20:13:04'),
(271, 13, 10, '2025-12-14 20:13:04'),
(272, 13, 35, '2025-12-14 20:13:04'),
(273, 13, 8, '2025-12-14 20:13:04'),
(274, 13, 36, '2025-12-14 20:13:04'),
(275, 13, 41, '2025-12-14 20:13:04'),
(276, 14, 9, '2025-12-14 20:13:04'),
(277, 14, 34, '2025-12-14 20:13:04'),
(278, 14, 10, '2025-12-14 20:13:04'),
(279, 14, 35, '2025-12-14 20:13:04'),
(280, 14, 8, '2025-12-14 20:13:04'),
(281, 14, 36, '2025-12-14 20:13:04'),
(282, 14, 4, '2025-12-14 20:13:04'),
(283, 14, 39, '2025-12-14 20:13:04'),
(284, 14, 1, '2025-12-14 20:13:04'),
(285, 14, 41, '2025-12-14 20:13:04'),
(286, 15, 6, '2025-12-14 20:13:04'),
(287, 15, 34, '2025-12-14 20:13:04'),
(288, 15, 35, '2025-12-14 20:13:04'),
(289, 15, 40, '2025-12-14 20:13:04'),
(290, 15, 41, '2025-12-14 20:13:04'),
(291, 46, 9, '2025-12-14 20:13:04'),
(292, 46, 6, '2025-12-14 20:13:04'),
(293, 46, 34, '2025-12-14 20:13:04'),
(294, 46, 35, '2025-12-14 20:13:04'),
(295, 46, 8, '2025-12-14 20:13:04'),
(296, 46, 36, '2025-12-14 20:13:04'),
(297, 46, 4, '2025-12-14 20:13:04'),
(298, 46, 41, '2025-12-14 20:13:04'),
(299, 16, 9, '2025-12-14 20:13:04'),
(300, 16, 6, '2025-12-14 20:13:04'),
(301, 16, 34, '2025-12-14 20:13:04'),
(302, 16, 35, '2025-12-14 20:13:04'),
(303, 16, 36, '2025-12-14 20:13:04'),
(304, 16, 39, '2025-12-14 20:13:04'),
(305, 17, 6, '2025-12-14 20:13:04'),
(306, 17, 34, '2025-12-14 20:13:04'),
(307, 17, 10, '2025-12-14 20:13:04'),
(308, 17, 35, '2025-12-14 20:13:04'),
(309, 17, 36, '2025-12-14 20:13:04'),
(310, 17, 1, '2025-12-14 20:13:04'),
(311, 18, 35, '2025-12-14 20:13:04'),
(312, 18, 36, '2025-12-14 20:13:04'),
(313, 18, 4, '2025-12-14 20:13:04'),
(314, 18, 1, '2025-12-14 20:13:04'),
(315, 18, 41, '2025-12-14 20:13:04'),
(316, 47, 9, '2025-12-14 20:13:04'),
(317, 47, 6, '2025-12-14 20:13:04'),
(318, 47, 34, '2025-12-14 20:13:04'),
(319, 47, 10, '2025-12-14 20:13:04'),
(320, 47, 35, '2025-12-14 20:13:04'),
(321, 47, 8, '2025-12-14 20:13:04'),
(322, 47, 36, '2025-12-14 20:13:04'),
(323, 47, 4, '2025-12-14 20:13:04'),
(324, 47, 39, '2025-12-14 20:13:04'),
(325, 47, 1, '2025-12-14 20:13:04'),
(326, 47, 40, '2025-12-14 20:13:04'),
(327, 47, 41, '2025-12-14 20:13:04'),
(328, 19, 6, '2025-12-14 20:13:04'),
(329, 19, 8, '2025-12-14 20:13:04'),
(330, 19, 39, '2025-12-14 20:13:04'),
(331, 20, 9, '2025-12-14 20:13:04'),
(332, 20, 6, '2025-12-14 20:13:04'),
(333, 20, 34, '2025-12-14 20:13:04'),
(334, 20, 10, '2025-12-14 20:13:04'),
(335, 20, 35, '2025-12-14 20:13:04'),
(336, 20, 8, '2025-12-14 20:13:04'),
(337, 20, 36, '2025-12-14 20:13:04'),
(338, 20, 4, '2025-12-14 20:13:04'),
(339, 20, 39, '2025-12-14 20:13:04'),
(340, 20, 1, '2025-12-14 20:13:04'),
(341, 20, 40, '2025-12-14 20:13:04'),
(342, 20, 41, '2025-12-14 20:13:04'),
(343, 21, 8, '2025-12-14 20:13:04'),
(344, 21, 4, '2025-12-14 20:13:04'),
(345, 21, 39, '2025-12-14 20:13:04'),
(346, 21, 40, '2025-12-14 20:13:04'),
(347, 21, 41, '2025-12-14 20:13:04'),
(348, 48, 9, '2025-12-14 20:13:04'),
(349, 48, 35, '2025-12-14 20:13:04'),
(350, 48, 8, '2025-12-14 20:13:04'),
(351, 48, 39, '2025-12-14 20:13:04'),
(352, 22, 9, '2025-12-14 20:13:04'),
(353, 22, 10, '2025-12-14 20:13:04'),
(354, 22, 35, '2025-12-14 20:13:04'),
(355, 22, 8, '2025-12-14 20:13:04'),
(356, 22, 36, '2025-12-14 20:13:04'),
(357, 22, 39, '2025-12-14 20:13:04'),
(358, 22, 1, '2025-12-14 20:13:04'),
(359, 22, 40, '2025-12-14 20:13:04'),
(360, 22, 41, '2025-12-14 20:13:04'),
(361, 23, 9, '2025-12-14 20:13:04'),
(362, 23, 6, '2025-12-14 20:13:04'),
(363, 23, 34, '2025-12-14 20:13:04'),
(364, 23, 10, '2025-12-14 20:13:04'),
(365, 23, 35, '2025-12-14 20:13:04'),
(366, 23, 8, '2025-12-14 20:13:04'),
(367, 23, 4, '2025-12-14 20:13:04'),
(368, 23, 39, '2025-12-14 20:13:04'),
(369, 23, 1, '2025-12-14 20:13:04'),
(370, 23, 40, '2025-12-14 20:13:04'),
(371, 23, 41, '2025-12-14 20:13:04'),
(372, 24, 9, '2025-12-14 20:13:04'),
(373, 24, 6, '2025-12-14 20:13:04'),
(374, 24, 34, '2025-12-14 20:13:04'),
(375, 24, 10, '2025-12-14 20:13:04'),
(376, 24, 35, '2025-12-14 20:13:04'),
(377, 24, 8, '2025-12-14 20:13:04'),
(378, 24, 36, '2025-12-14 20:13:04'),
(379, 24, 4, '2025-12-14 20:13:04'),
(380, 24, 39, '2025-12-14 20:13:04'),
(381, 24, 1, '2025-12-14 20:13:04'),
(382, 24, 40, '2025-12-14 20:13:04'),
(383, 24, 41, '2025-12-14 20:13:04'),
(384, 49, 9, '2025-12-14 20:13:04'),
(385, 49, 6, '2025-12-14 20:13:04'),
(386, 49, 34, '2025-12-14 20:13:04'),
(387, 49, 10, '2025-12-14 20:13:04'),
(388, 49, 35, '2025-12-14 20:13:04'),
(389, 49, 8, '2025-12-14 20:13:04'),
(390, 49, 36, '2025-12-14 20:13:04'),
(391, 49, 4, '2025-12-14 20:13:04'),
(392, 49, 40, '2025-12-14 20:13:04'),
(393, 25, 9, '2025-12-14 20:13:04'),
(394, 25, 34, '2025-12-14 20:13:04'),
(395, 25, 8, '2025-12-14 20:13:04'),
(396, 25, 36, '2025-12-14 20:13:04'),
(397, 25, 39, '2025-12-14 20:13:04'),
(398, 25, 1, '2025-12-14 20:13:04'),
(399, 25, 41, '2025-12-14 20:13:04'),
(400, 26, 34, '2025-12-14 20:13:04'),
(401, 26, 36, '2025-12-14 20:13:04'),
(402, 26, 4, '2025-12-14 20:13:04'),
(403, 27, 9, '2025-12-14 20:13:04'),
(404, 27, 6, '2025-12-14 20:13:04'),
(405, 27, 34, '2025-12-14 20:13:04'),
(406, 27, 10, '2025-12-14 20:13:04'),
(407, 27, 35, '2025-12-14 20:13:04'),
(408, 27, 8, '2025-12-14 20:13:04'),
(409, 27, 36, '2025-12-14 20:13:04'),
(410, 27, 4, '2025-12-14 20:13:04'),
(411, 27, 39, '2025-12-14 20:13:04'),
(412, 27, 1, '2025-12-14 20:13:04'),
(413, 27, 40, '2025-12-14 20:13:04'),
(414, 27, 41, '2025-12-14 20:13:04'),
(415, 50, 35, '2025-12-14 20:13:04'),
(416, 28, 9, '2025-12-14 20:13:04'),
(417, 28, 6, '2025-12-14 20:13:04'),
(418, 28, 34, '2025-12-14 20:13:04'),
(419, 28, 10, '2025-12-14 20:13:04'),
(420, 28, 35, '2025-12-14 20:13:04'),
(421, 28, 4, '2025-12-14 20:13:04'),
(422, 28, 39, '2025-12-14 20:13:04'),
(423, 28, 1, '2025-12-14 20:13:04'),
(424, 28, 41, '2025-12-14 20:13:04'),
(425, 29, 9, '2025-12-14 20:13:04'),
(426, 29, 6, '2025-12-14 20:13:04'),
(427, 29, 34, '2025-12-14 20:13:04'),
(428, 29, 10, '2025-12-14 20:13:04'),
(429, 29, 35, '2025-12-14 20:13:04'),
(430, 29, 8, '2025-12-14 20:13:04'),
(431, 29, 4, '2025-12-14 20:13:04'),
(432, 29, 39, '2025-12-14 20:13:04'),
(433, 29, 1, '2025-12-14 20:13:04'),
(434, 29, 40, '2025-12-14 20:13:04'),
(435, 30, 9, '2025-12-14 20:13:04'),
(436, 30, 6, '2025-12-14 20:13:04'),
(437, 30, 34, '2025-12-14 20:13:04'),
(438, 30, 35, '2025-12-14 20:13:04'),
(439, 30, 8, '2025-12-14 20:13:04'),
(440, 30, 36, '2025-12-14 20:13:04'),
(441, 30, 4, '2025-12-14 20:13:04'),
(442, 30, 39, '2025-12-14 20:13:04'),
(443, 30, 1, '2025-12-14 20:13:04'),
(444, 30, 40, '2025-12-14 20:13:04'),
(445, 30, 41, '2025-12-14 20:13:04'),
(446, 51, 6, '2025-12-14 20:13:04'),
(447, 51, 34, '2025-12-14 20:13:04'),
(448, 51, 10, '2025-12-14 20:13:04'),
(449, 51, 35, '2025-12-14 20:13:04'),
(450, 51, 8, '2025-12-14 20:13:04'),
(451, 51, 36, '2025-12-14 20:13:04'),
(452, 51, 4, '2025-12-14 20:13:04'),
(453, 51, 39, '2025-12-14 20:13:04'),
(454, 51, 1, '2025-12-14 20:13:04'),
(455, 51, 40, '2025-12-14 20:13:04'),
(456, 51, 41, '2025-12-14 20:13:04');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `reported_user_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  `comment_id` int(11) DEFAULT NULL,
  `reason` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','resolved','dismissed') DEFAULT 'pending',
  `admin_id` int(11) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reposts`
--

CREATE TABLE `reposts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `is_nsfw` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `slug`, `description`, `usage_count`, `is_active`, `is_nsfw`, `created_at`, `updated_at`) VALUES
(1, 'art', 'art', NULL, 1250, 1, 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(4, 'nature', 'nature', NULL, 890, 1, 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(6, 'fitness', 'fitness', NULL, 1020, 1, 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(8, 'photography', 'photography', NULL, 2100, 1, 0, '2025-12-14 13:54:22', '2025-12-14 13:54:22'),
(9, 'travelTESVESTSE', 'travel', '', 1780, 1, 0, '2025-12-14 13:54:22', '2025-12-14 22:48:52'),
(10, 'gamingsad', 'gaming', 'asdaddsada', 2450, 1, 0, '2025-12-14 13:54:22', '2025-12-14 21:25:54'),
(34, 'Cooking', 'cooking', 'Cooking lifestyle content', 0, 1, 0, '2025-12-14 20:11:12', '2025-12-14 20:11:12'),
(35, 'Reading', 'reading', 'Reading lifestyle content', 0, 1, 0, '2025-12-14 20:11:12', '2025-12-14 20:11:12'),
(36, 'Fashion', 'fashion', 'Fashion lifestyle content', 0, 1, 0, '2025-12-14 20:11:12', '2025-12-14 20:11:12'),
(39, 'Technology', 'technology', 'Technology lifestyle content', 0, 1, 0, '2025-12-14 20:12:52', '2025-12-14 20:12:52'),
(40, 'Wellness', 'wellness', 'Wellness lifestyle content', 0, 1, 0, '2025-12-14 20:12:52', '2025-12-14 20:12:52'),
(41, 'Design', 'design', 'Design lifestyle content', 0, 1, 0, '2025-12-14 20:12:52', '2025-12-14 20:12:52'),
(42, 'fsa', 'fsa', NULL, 0, 1, 0, '2025-12-14 20:49:08', '2025-12-14 20:49:08'),
(43, 'safafafas', 'safafafas', NULL, 0, 1, 0, '2025-12-14 20:49:08', '2025-12-14 20:49:08'),
(44, 'fsafa', 'fsafa', NULL, 0, 1, 0, '2025-12-14 20:49:08', '2025-12-14 20:49:08'),
(45, 'gdg', 'gdg', NULL, 0, 1, 0, '2025-12-14 21:51:20', '2025-12-14 21:51:20'),
(46, 'jkl', 'jkl', NULL, 0, 1, 0, '2025-12-14 21:51:20', '2025-12-14 21:51:20'),
(47, 'k', 'k', NULL, 0, 1, 0, '2025-12-14 21:51:20', '2025-12-14 21:51:20'),
(48, 'j', 'j', NULL, 0, 1, 0, '2025-12-14 21:51:20', '2025-12-14 21:51:20'),
(49, 'sad', 'sadsa', 'dasdas', 0, 1, 0, '2025-12-14 22:10:41', '2025-12-14 22:10:41'),
(50, 'yes', 'yes', NULL, 0, 1, 0, '2025-12-14 22:46:29', '2025-12-14 22:46:29'),
(51, 'yo', 'yo', NULL, 0, 1, 0, '2025-12-14 22:46:29', '2025-12-14 22:46:29'),
(52, 'ye', 'ye', NULL, 0, 1, 0, '2025-12-14 22:46:29', '2025-12-14 22:46:29'),
(53, 'yee', 'yee', NULL, 0, 1, 0, '2025-12-14 22:46:29', '2025-12-14 22:46:29'),
(54, 'yeet', 'yeet', NULL, 0, 1, 0, '2025-12-14 22:46:29', '2025-12-14 22:46:29');

-- --------------------------------------------------------

--
-- Table structure for table `trending_data`
--

CREATE TABLE `trending_data` (
  `id` int(11) NOT NULL,
  `type` enum('hashtag','user','post') NOT NULL,
  `entity_id` int(11) NOT NULL,
  `score` int(11) DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `interests` text DEFAULT NULL,
  `followers` int(11) DEFAULT 0,
  `following` int(11) DEFAULT 0,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `display_name`, `bio`, `avatar_url`, `interests`, `followers`, `following`, `is_admin`, `created_at`, `updated_at`) VALUES
(3, 'admin', 'admin@trendle.com', '$2y$12$A3B1zARJt5JrtnwlmfEhHOCfEnNVnomTQjyMhWjsQel73oJELlGMi', 'admin', NULL, 'https://api.dicebear.com/7.x/lorelei/svg?seed=admin', NULL, 0, 0, 1, '2025-12-14 09:35:16', '2025-12-14 23:04:57'),
(74, 'artlover', 'artlover@example.com', '$2y$10$4ryhV6.iX1tSCgJuRP637egcoPbyxNu/Wtg/xlUayBMTqQUMNLw1.', 'Art Lover', 'Passionate about digital art and design', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar4', NULL, 14, 0, 0, '2025-12-14 13:54:21', '2025-12-14 22:54:13'),
(75, 'musicfreakk', 'music@example.com', '$2y$10$Wa00tkMIiPXQvuKKrSJvz.Y1p7oSyZJTLRnupgQuujQXfS4PUxcbq', 'Music Freak', 'Always listening to something new 🎵', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar5', NULL, 5, 0, 0, '2025-12-14 13:54:21', '2025-12-14 22:54:24'),
(76, 'techguru', 'tech@example.com', '$2y$10$yoqv54ZN9LGn0vw0wt447.Z8pSn3IV.bhFQQuw/4rHd/gZkMukPLO', 'Tech Guru', 'Software developer and tech enthusiast', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar6', NULL, 4, 0, 0, '2025-12-14 13:54:21', '2025-12-14 22:54:15'),
(77, 'naturejunkie', 'nature@example.com', '$2y$10$syZkt2Voon5vec9ydH8Cne9fSwXq7dp/0s9OpDUI/a1OUj12nSSJy', 'Nature Junkie', 'Exploring the beauty of nature 🌿', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar7', NULL, 14, 0, 0, '2025-12-14 13:54:21', '2025-12-14 22:54:15'),
(78, 'foodie_adventures', 'foodie@example.com', '$2y$10$6b7BFIzMcXdpqGkvsjeZoeaOpxq8q3mOlr4ASrXG//VSH6T9kojmi', 'Foodie Adventures', 'Trying every food in the city 🍜', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar8', NULL, 2, 0, 0, '2025-12-14 13:54:21', '2025-12-14 22:02:41'),
(79, 'fitnessgyal', 'fitness@example.com', '$2y$10$XX0mE9SghuRlwudAS0aRXuMzh4J2sA3xT/r.x0.dNyfgZiblJ9YHS', 'Fitness Gyal', 'Fitness coach and wellness advocate', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar9', NULL, 4, 0, 0, '2025-12-14 13:54:21', '2025-12-14 20:24:09'),
(80, 'bookworm_reads', 'books@example.com', '$2y$10$kYiS0928.RAX4YCzh/oq7eEGMuT6Xnwblkedv9VjFMj9J1qH04OuK', 'Book Worm', 'Reading one book at a time 📚', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar10', NULL, 16, 0, 0, '2025-12-14 13:54:21', '2025-12-14 22:44:46'),
(81, 'photography_pro', 'photo@example.com', '$2y$10$r5rNK1.XefFTVV8k6xikdu8vrKI9OTk7tjZRg1JAFwCXc0mVxl6/2', 'Photography Pro', 'Capturing moments, creating memories 📸', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar1', NULL, 14, 0, 0, '2025-12-14 13:54:21', '2025-12-14 22:54:13'),
(82, 'travelers_soul', 'travel@example.com', '$2y$10$BywS0tGOIcHRXeajVZ2xfuWJTZyN1Dp8r2jMfAhxkHEuBBkuGBUJ6', 'Traveler\'s Soul', 'Exploring the world one trip at a time ✈️', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar2', NULL, 8, 0, 0, '2025-12-14 13:54:21', '2025-12-14 22:02:48'),
(83, 'gaming_legend', 'gaming@example.com', '$2y$10$iCBNyqN/wRi7hOCjll/u4.1acpjSp.MsaCyMgHge47caK7HRlOVPO', 'Gaming Legend', 'Professional gamer and streamer 🎮', 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar3', NULL, 2, 0, 0, '2025-12-14 13:54:21', '2025-12-14 20:24:08'),
(110, 'account', 'account@account.com', '$2y$12$eY0461a.fJel22ZWTNHl/uB1g/zUZ4lm29/U/5PKIKwzgGoR4HxhK', 'account', NULL, 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar5', '', 0, 6, 0, '2025-12-14 21:23:04', '2025-12-14 22:02:41');

-- --------------------------------------------------------

--
-- Table structure for table `user_communities`
--

CREATE TABLE `user_communities` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `community_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `dark_mode` tinyint(1) DEFAULT 0,
  `email_notifications` tinyint(1) DEFAULT 1,
  `push_notifications` tinyint(1) DEFAULT 0,
  `language` varchar(10) DEFAULT 'en',
  `privacy_level` enum('public','private') DEFAULT 'public',
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_settings`
--

INSERT INTO `user_settings` (`id`, `user_id`, `dark_mode`, `email_notifications`, `push_notifications`, `language`, `privacy_level`, `two_factor_enabled`, `created_at`, `updated_at`) VALUES
(8, 110, 0, 1, 0, 'en', 'public', 0, '2025-12-14 21:23:54', '2025-12-14 21:23:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_id` (`admin_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_target_type` (`target_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `communities`
--
ALTER TABLE `communities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `follower_id` (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`user_id`,`post_id`,`comment_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_comment_id` (`comment_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sender_id` (`sender_id`),
  ADD KEY `idx_recipient_id` (`recipient_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `post_tags`
--
ALTER TABLE `post_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_post_tag` (`post_id`,`tag_id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_tag_id` (`tag_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `comment_id` (`comment_id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_reporter_id` (`reporter_id`),
  ADD KEY `idx_reported_user_id` (`reported_user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `reposts`
--
ALTER TABLE `reposts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_repost` (`user_id`,`post_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_post_id` (`post_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_token` (`token`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_usage_count` (`usage_count`);

--
-- Indexes for table `trending_data`
--
ALTER TABLE `trending_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_score` (`score`),
  ADD KEY `idx_last_updated` (`last_updated`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `user_communities`
--
ALTER TABLE `user_communities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_membership` (`user_id`,`community_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_community_id` (`community_id`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `communities`
--
ALTER TABLE `communities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `follows`
--
ALTER TABLE `follows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=236;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `post_tags`
--
ALTER TABLE `post_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=469;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reposts`
--
ALTER TABLE `reposts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `trending_data`
--
ALTER TABLE `trending_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `user_communities`
--
ALTER TABLE `user_communities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_3` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_tags`
--
ALTER TABLE `post_tags`
  ADD CONSTRAINT `post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reports_ibfk_4` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reports_ibfk_5` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reposts`
--
ALTER TABLE `reposts`
  ADD CONSTRAINT `reposts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reposts_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_communities`
--
ALTER TABLE `user_communities`
  ADD CONSTRAINT `user_communities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_communities_ibfk_2` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
