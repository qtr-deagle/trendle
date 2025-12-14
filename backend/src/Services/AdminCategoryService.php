<?php

namespace App\Services;

use App\Config\Database;

/**
 * AdminCategoryService
 * 
 * Manages category administration:
 * - List categories with display order support
 * - Create categories with slug generation
 * - Update category visibility and ordering
 * - Delete categories with cascade handling
 * - Manage category-tag relationships
 * - Search and filter categories
 * 
 * Database interactions: categories, category_tags, posts
 */
class AdminCategoryService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get all categories with optional search and filtering
     * 
     * @param int $page Current page
     * @param int $limit Records per page
     * @param string $search Optional search query
     * @param string $filter 'active', 'inactive', 'visible', 'hidden', or 'all'
     * @return array Categories with pagination metadata
     */
    public function getAllCategories($page = 1, $limit = 20, $search = '', $filter = 'all')
    {
        $offset = ($page - 1) * $limit;

        try {
            $baseQuery = 'WHERE 1=1';
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
            } elseif ($filter === 'visible') {
                $baseQuery .= ' AND is_visible = 1';
            } elseif ($filter === 'hidden') {
                $baseQuery .= ' AND is_visible = 0';
            }

            // Get total count
            $countStmt = $this->db->execute('SELECT COUNT(*) as total FROM categories ' . $baseQuery, $params);
            $total = (int)$countStmt->get_result()->fetch_assoc()['total'];

            // Get paginated categories
            $query = 'SELECT id, name, slug, description, icon, color, display_order, is_visible, 
                             is_active, created_at, updated_at 
                     FROM categories 
                     ' . $baseQuery . ' 
                     ORDER BY display_order ASC, created_at DESC LIMIT ? OFFSET ?';

            $params[] = $limit;
            $params[] = $offset;

            $stmt = $this->db->execute($query, $params);
            $result = $stmt->get_result();

            $categories = [];
            while ($row = $result->fetch_assoc()) {
                // Get tag count for this category
                $tagStmt = $this->db->execute(
                    'SELECT COUNT(*) as count FROM category_tags WHERE category_id = ?',
                    [$row['id']]
                );
                $row['tag_count'] = (int)$tagStmt->get_result()->fetch_assoc()['count'];

                $categories[] = $row;
            }

            return [
                'categories' => $categories,
                'total' => $total,
                'page' => $page,
                'limit' => $limit
            ];
        } catch (\Exception $e) {
            error_log('Get categories error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get category details including associated tags
     * 
     * @param int $categoryId Category ID
     * @return array Category details with tags
     */
    public function getCategoryDetail($categoryId)
    {
        try {
            $stmt = $this->db->execute(
                'SELECT id, name, slug, description, icon, color, display_order, is_visible, 
                        is_active, created_by, created_at, updated_at 
                 FROM categories WHERE id = ?',
                [$categoryId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                throw new \Exception('Category not found');
            }

            $category = $result->fetch_assoc();

            // Get associated tags
            $tagStmt = $this->db->execute(
                'SELECT t.id, t.name, t.slug FROM tags t 
                 JOIN category_tags ct ON t.id = ct.tag_id 
                 WHERE ct.category_id = ? 
                 ORDER BY t.name',
                [$categoryId]
            );

            $tags = [];
            while ($tag = $tagStmt->get_result()->fetch_assoc()) {
                $tags[] = $tag;
            }

            $category['tags'] = $tags;
            return $category;
        } catch (\Exception $e) {
            error_log('Get category detail error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new category
     * Auto-generates slug from name
     * 
     * @param string $name Category name
     * @param string $slug URL-friendly slug (auto-generated if empty)
     * @param string $description Category description
     * @param string $icon Icon identifier
     * @param string $color Color code
     * @param int $displayOrder Display order
     * @param bool $isVisible Is visible to users
     * @param bool $isActive Is active
     * @param int $createdBy Admin user ID creating category
     * @return array Created category data
     */
    public function createCategory(
        $name,
        $slug,
        $description = '',
        $icon = '',
        $color = '#000000',
        $displayOrder = 0,
        $isVisible = true,
        $isActive = true,
        $createdBy = null
    ) {
        try {
            // Validate input
            if (empty($name)) {
                throw new \Exception('Category name is required');
            }

            // Auto-generate slug if not provided
            if (empty($slug)) {
                $slug = $this->generateSlug($name);
            }

            // Validate slug is unique
            $existStmt = $this->db->execute(
                'SELECT id FROM categories WHERE slug = ?',
                [$slug]
            );

            if ($existStmt->get_result()->num_rows > 0) {
                throw new \Exception('Category slug must be unique');
            }

            // Insert category
            $stmt = $this->db->execute(
                'INSERT INTO categories (name, slug, description, icon, color, display_order, is_visible, is_active, created_by, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [$name, $slug, $description, $icon, $color, $displayOrder, $isVisible ? 1 : 0, $isActive ? 1 : 0, $createdBy]
            );

            $categoryId = $this->db->getConnection()->insert_id;

            // Log admin action
            if ($createdBy) {
                $logData = json_encode(['category_name' => $name, 'slug' => $slug]);
                $this->db->execute(
                    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())',
                    [$createdBy, 'create_category', 'category', $categoryId, $logData]
                );
            }

            return [
                'id' => $categoryId,
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'icon' => $icon,
                'color' => $color,
                'display_order' => $displayOrder,
                'is_visible' => (bool)$isVisible,
                'is_active' => (bool)$isActive,
                'created_at' => date('Y-m-d H:i:s')
            ];
        } catch (\Exception $e) {
            error_log('Create category error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing category
     * 
     * @param int $categoryId Category ID to update
     * @param array $data Fields to update
     * @param int $adminId Admin performing the update
     * @return array Updated category data
     */
    public function updateCategory($categoryId, $data, $adminId = null)
    {
        try {
            // Get existing category
            $stmt = $this->db->execute(
                'SELECT * FROM categories WHERE id = ?',
                [$categoryId]
            );

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                throw new \Exception('Category not found');
            }

            $category = $result->fetch_assoc();

            // Prepare update values
            $name = $data['name'] ?? $category['name'];
            $slug = $data['slug'] ?? $category['slug'];
            $description = $data['description'] ?? $category['description'];
            $icon = $data['icon'] ?? $category['icon'];
            $color = $data['color'] ?? $category['color'];
            $displayOrder = isset($data['display_order']) ? (int)$data['display_order'] : $category['display_order'];
            $isVisible = isset($data['is_visible']) ? (int)$data['is_visible'] : $category['is_visible'];
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : $category['is_active'];

            // Validate slug uniqueness if changed
            if ($slug !== $category['slug']) {
                $existStmt = $this->db->execute(
                    'SELECT id FROM categories WHERE slug = ? AND id != ?',
                    [$slug, $categoryId]
                );

                if ($existStmt->get_result()->num_rows > 0) {
                    throw new \Exception('Category slug must be unique');
                }
            }

            // Update category
            $this->db->execute(
                'UPDATE categories SET name = ?, slug = ?, description = ?, icon = ?, color = ?, 
                        display_order = ?, is_visible = ?, is_active = ?, updated_at = NOW() 
                 WHERE id = ?',
                [$name, $slug, $description, $icon, $color, $displayOrder, $isVisible, $isActive, $categoryId]
            );

            // Log admin action
            if ($adminId) {
                $changes = [];
                foreach ($data as $key => $value) {
                    if ($category[$key] != $value) {
                        $changes[$key] = ['old' => $category[$key], 'new' => $value];
                    }
                }

                if (!empty($changes)) {
                    $logData = json_encode($changes);
                    $this->db->execute(
                        'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                         VALUES (?, ?, ?, ?, ?, NOW())',
                        [$adminId, 'update_category', 'category', $categoryId, $logData]
                    );
                }
            }

            return [
                'id' => $categoryId,
                'name' => $name,
                'slug' => $slug,
                'description' => $description,
                'icon' => $icon,
                'color' => $color,
                'display_order' => $displayOrder,
                'is_visible' => (bool)$isVisible,
                'is_active' => (bool)$isActive
            ];
        } catch (\Exception $e) {
            error_log('Update category error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a category
     * Removes all category-tag associations
     * 
     * @param int $categoryId Category ID to delete
     * @param int $adminId Admin performing the deletion
     * @return array Success response
     */
    public function deleteCategory($categoryId, $adminId = null)
    {
        try {
            // Get category info before deletion
            $stmt = $this->db->execute('SELECT name FROM categories WHERE id = ?', [$categoryId]);
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                throw new \Exception('Category not found');
            }

            $category = $result->fetch_assoc();

            // Delete from category_tags
            $this->db->execute('DELETE FROM category_tags WHERE category_id = ?', [$categoryId]);

            // Delete category
            $this->db->execute('DELETE FROM categories WHERE id = ?', [$categoryId]);

            // Log admin action
            if ($adminId) {
                $logData = json_encode(['category_name' => $category['name']]);
                $this->db->execute(
                    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())',
                    [$adminId, 'delete_category', 'category', $categoryId, $logData]
                );
            }

            return ['success' => true, 'message' => 'Category deleted successfully'];
        } catch (\Exception $e) {
            error_log('Delete category error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Assign a tag to a category
     * 
     * @param int $categoryId Category ID
     * @param int $tagId Tag ID
     * @param int $adminId Admin performing the action
     * @return array Success response
     */
    public function addTagToCategory($categoryId, $tagId, $adminId = null)
    {
        try {
            // Check if already associated
            $stmt = $this->db->execute(
                'SELECT id FROM category_tags WHERE category_id = ? AND tag_id = ?',
                [$categoryId, $tagId]
            );

            if ($stmt->get_result()->num_rows > 0) {
                throw new \Exception('Tag already associated with this category');
            }

            // Add association
            $this->db->execute(
                'INSERT INTO category_tags (category_id, tag_id) VALUES (?, ?)',
                [$categoryId, $tagId]
            );

            if ($adminId) {
                $logData = json_encode(['tag_id' => $tagId]);
                $this->db->execute(
                    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())',
                    [$adminId, 'add_tag_to_category', 'category', $categoryId, $logData]
                );
            }

            return ['success' => true, 'message' => 'Tag added to category'];
        } catch (\Exception $e) {
            error_log('Add tag to category error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove a tag from a category
     * 
     * @param int $categoryId Category ID
     * @param int $tagId Tag ID
     * @param int $adminId Admin performing the action
     * @return array Success response
     */
    public function removeTagFromCategory($categoryId, $tagId, $adminId = null)
    {
        try {
            $this->db->execute(
                'DELETE FROM category_tags WHERE category_id = ? AND tag_id = ?',
                [$categoryId, $tagId]
            );

            if ($adminId) {
                $logData = json_encode(['tag_id' => $tagId]);
                $this->db->execute(
                    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())',
                    [$adminId, 'remove_tag_from_category', 'category', $categoryId, $logData]
                );
            }

            return ['success' => true, 'message' => 'Tag removed from category'];
        } catch (\Exception $e) {
            error_log('Remove tag from category error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate URL-friendly slug from category name
     * 
     * @param string $name Category name
     * @return string Generated slug
     */
    private function generateSlug($name)
    {
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug;
    }
}
