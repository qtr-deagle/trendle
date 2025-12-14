<?php

namespace App\Services;

use App\Config\Database;

/**
 * AdminTagService
 * 
 * Manages all tag-related admin operations:
 * - List all tags with pagination
 * - Create new tags with slug auto-generation
 * - Update tag information (name, description, NSFW status)
 * - Delete/deactivate tags
 * - Track tag usage count
 * - Search and filter tags
 * 
 * Database interactions: tags, post_hashtags, category_tags
 */
class AdminTagService {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Get all tags with optional search and pagination
     * 
     * @param int $page Current page
     * @param int $limit Records per page
     * @param string $search Optional search query
     * @param string $filter 'active', 'inactive', or 'all'
     * @return array Tags list with pagination metadata
     */
    public function getAllTags($page = 1, $limit = 20, $search = '', $filter = 'all') {
        $offset = ($page - 1) * $limit;
        
        try {
            $baseQuery = 'FROM tags WHERE 1=1';
            $params = [];
            
            if (!empty($search)) {
                $baseQuery .= ' AND (name LIKE ? OR slug LIKE ?)';
                $searchParam = '%' . $search . '%';
                $params = [$searchParam, $searchParam];
            }
            
            if ($filter === 'active') {
                $baseQuery .= ' AND is_active = 1';
            } elseif ($filter === 'inactive') {
                $baseQuery .= ' AND is_active = 0';
            }
            
            // Get total count
            $countStmt = $this->db->execute('SELECT COUNT(*) as total ' . $baseQuery, $params);
            $total = (int)$countStmt->get_result()->fetch_assoc()['total'];
            
            // Get paginated tags
            $query = 'SELECT id, name, slug, description, usage_count, is_active, is_nsfw, created_at, updated_at 
                     ' . $baseQuery . ' 
                     ORDER BY usage_count DESC, created_at DESC LIMIT ? OFFSET ?';
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->execute($query, $params);
            $result = $stmt->get_result();
            
            $tags = [];
            while ($row = $result->fetch_assoc()) {
                $tags[] = $row;
            }
            
            return [
                'tags' => $tags,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ];
        } catch (\Exception $e) {
            error_log('Get tags error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new tag
     * Auto-generates slug from name if not provided
     * Validates that slug is unique
     * 
     * @param string $name Tag name
     * @param string $slug URL-friendly slug (auto-generated if empty)
     * @param string $description Optional description
     * @param bool $isNsfw Mark as NSFW content
     * @param bool $isActive Active status
     * @param int $adminId Admin creating the tag
     * @return array Created tag data
     */
    public function createTag($name, $slug, $description = '', $isNsfw = false, $isActive = true, $adminId = null) {
        try {
            // Validate input
            if (empty($name)) {
                throw new \Exception('Tag name is required');
            }
            
            // Auto-generate slug if not provided
            if (empty($slug)) {
                $slug = $this->generateSlug($name);
            }
            
            // Validate slug is unique
            $existStmt = $this->db->execute(
                'SELECT id FROM tags WHERE slug = ?',
                [$slug]
            );
            
            if ($existStmt->get_result()->num_rows > 0) {
                throw new \Exception('Tag slug must be unique');
            }
            
            // Insert tag
            $stmt = $this->db->execute(
                'INSERT INTO tags (name, slug, description, usage_count, is_active, is_nsfw, created_at, updated_at) 
                 VALUES (?, ?, ?, 0, ?, ?, NOW(), NOW())',
                [$name, $slug, $description, $isActive ? 1 : 0, $isNsfw ? 1 : 0]
            );
            
            $tagId = $this->db->getConnection()->insert_id;
            
            // Log admin action
            if ($adminId) {
                $logData = json_encode(['tag_name' => $name, 'slug' => $slug]);
                $this->db->execute(
                    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())',
                    [$adminId, 'create_tag', 'tag', $tagId, $logData]
                );
            }
            
            return [
                'id' => $tagId,
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'usage_count' => 0,
                'is_active' => (bool)$isActive,
                'is_nsfw' => (bool)$isNsfw,
                'created_at' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            error_log('Create tag error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing tag
     * 
     * @param int $tagId Tag ID to update
     * @param array $data Fields to update (name, slug, description, is_active, is_nsfw)
     * @param int $adminId Admin performing the update
     * @return array Updated tag data
     */
    public function updateTag($tagId, $data, $adminId = null) {
        try {
            // Get existing tag
            $stmt = $this->db->execute(
                'SELECT * FROM tags WHERE id = ?',
                [$tagId]
            );
            
            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                throw new \Exception('Tag not found');
            }
            
            $tag = $result->fetch_assoc();
            
            // Prepare update values
            $name = $data['name'] ?? $tag['name'];
            $slug = $data['slug'] ?? $tag['slug'];
            $description = $data['description'] ?? $tag['description'];
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : $tag['is_active'];
            $isNsfw = isset($data['is_nsfw']) ? (int)$data['is_nsfw'] : $tag['is_nsfw'];
            
            // Validate slug uniqueness if slug changed
            if ($slug !== $tag['slug']) {
                $existStmt = $this->db->execute(
                    'SELECT id FROM tags WHERE slug = ? AND id != ?',
                    [$slug, $tagId]
                );
                
                if ($existStmt->get_result()->num_rows > 0) {
                    throw new \Exception('Tag slug must be unique');
                }
            }
            
            // Update tag
            $this->db->execute(
                'UPDATE tags SET name = ?, slug = ?, description = ?, is_active = ?, is_nsfw = ?, updated_at = NOW() 
                 WHERE id = ?',
                [$name, $slug, $description, $isActive, $isNsfw, $tagId]
            );
            
            // Log admin action
            if ($adminId) {
                $changes = [];
                foreach ($data as $key => $value) {
                    if ($tag[$key] != $value) {
                        $changes[$key] = ['old' => $tag[$key], 'new' => $value];
                    }
                }
                
                if (!empty($changes)) {
                    $logData = json_encode($changes);
                    $this->db->execute(
                        'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                         VALUES (?, ?, ?, ?, ?, NOW())',
                        [$adminId, 'update_tag', 'tag', $tagId, $logData]
                    );
                }
            }
            
            return [
                'id' => $tagId,
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'is_active' => (bool)$isActive,
                'is_nsfw' => (bool)$isNsfw
            ];
        } catch (\Exception $e) {
            error_log('Update tag error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a tag and remove all associations
     * 
     * @param int $tagId Tag ID to delete
     * @param int $adminId Admin performing the deletion
     * @return array Success response
     */
    public function deleteTag($tagId, $adminId = null) {
        try {
            // Get tag info before deletion
            $stmt = $this->db->execute('SELECT name FROM tags WHERE id = ?', [$tagId]);
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                throw new \Exception('Tag not found');
            }
            
            $tag = $result->fetch_assoc();
            
            // Delete from category_tags
            $this->db->execute('DELETE FROM category_tags WHERE tag_id = ?', [$tagId]);
            
            // Delete tag
            $this->db->execute('DELETE FROM tags WHERE id = ?', [$tagId]);
            
            // Log admin action
            if ($adminId) {
                $logData = json_encode(['tag_name' => $tag['name']]);
                $this->db->execute(
                    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())',
                    [$adminId, 'delete_tag', 'tag', $tagId, $logData]
                );
            }
            
            return ['success' => true, 'message' => 'Tag deleted successfully'];
        } catch (\Exception $e) {
            error_log('Delete tag error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate URL-friendly slug from tag name
     * 
     * @param string $name Tag name
     * @return string Generated slug
     */
    private function generateSlug($name) {
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug;
    }
}
