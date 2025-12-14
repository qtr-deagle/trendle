import pool from "../config/database.js";

// ============================================
// ADMIN MIDDLEWARE - Check if user is admin
// ============================================
export const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute("SELECT is_admin FROM users WHERE id = ?", [userId]);
    connection.release();

    if (!users.length || !users[0].is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ============================================
// AUDIT LOGGING
// ============================================
const logAdminAction = async (adminId, action, targetType, targetId, details) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      "INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [adminId, action, targetType, targetId, JSON.stringify(details)]
    );
    connection.release();
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};

// ============================================
// DASHBOARD - Get system metrics
// ============================================
export const getDashboardMetrics = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get all metrics in parallel
    const [totalUsers] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE is_active = TRUE");
    const [totalPosts] = await connection.execute("SELECT COUNT(*) as count FROM posts WHERE is_deleted = FALSE");
    const [totalReports] = await connection.execute("SELECT COUNT(*) as count FROM reports");
    const [pendingReports] = await connection.execute("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'");
    const [flaggedContent] = await connection.execute("SELECT COUNT(*) as count FROM reports WHERE status = 'pending' AND (post_id IS NOT NULL OR comment_id IS NOT NULL)");
    const [totalMessages] = await connection.execute("SELECT COUNT(*) as count FROM contact_messages");
    const [unreadMessages] = await connection.execute("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'");
    const [totalCategories] = await connection.execute("SELECT COUNT(*) as count FROM categories WHERE is_active = TRUE");
    const [totalTags] = await connection.execute("SELECT COUNT(*) as count FROM tags WHERE is_active = TRUE");
    const [bannedUsers] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE is_active = FALSE");

    // Get recent activities
    const [recentActivities] = await connection.execute(`
      SELECT 'user_join' as type, u.id, u.username, u.avatar_url, u.created_at as timestamp 
      FROM users u 
      WHERE u.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'post_created' as type, p.id, u.username, u.avatar_url, p.created_at as timestamp 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 'report_created' as type, r.id, u.username, u.avatar_url, r.created_at as timestamp 
      FROM reports r 
      JOIN users u ON r.reporter_id = u.id 
      WHERE r.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY timestamp DESC 
      LIMIT 10
    `);

    connection.release();

    res.json({
      totalUsers: totalUsers[0].count,
      totalPosts: totalPosts[0].count,
      totalReports: totalReports[0].count,
      pendingReports: pendingReports[0].count,
      flaggedContent: flaggedContent[0].count,
      totalMessages: totalMessages[0].count,
      unreadMessages: unreadMessages[0].count,
      totalCategories: totalCategories[0].count,
      totalTags: totalTags[0].count,
      bannedUsers: bannedUsers[0].count,
      recentActivities
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
};

// ============================================
// USERS MANAGEMENT
// ============================================
export const getAllUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = "SELECT id, username, display_name, email, is_active, created_at FROM users";
    const params = [];

    if (search) {
      query += " WHERE username LIKE ? OR email LIKE ? OR display_name LIKE ?";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    } else if (status === "active") {
      query += " WHERE is_active = TRUE";
    } else if (status === "inactive") {
      query += " WHERE is_active = FALSE";
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [users] = await connection.execute(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as count FROM users";
    const countParams = [];

    if (search) {
      countQuery += " WHERE username LIKE ? OR email LIKE ? OR display_name LIKE ?";
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    } else if (status === "active") {
      countQuery += " WHERE is_active = TRUE";
    } else if (status === "inactive") {
      countQuery += " WHERE is_active = FALSE";
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    const total = countResult[0].count;

    connection.release();

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (!users.length) {
      connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Get user stats
    const [posts] = await connection.execute(
      "SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND is_deleted = FALSE",
      [userId]
    );

    const [followers] = await connection.execute(
      "SELECT COUNT(*) as count FROM follows WHERE following_id = ?",
      [userId]
    );

    const [following] = await connection.execute(
      "SELECT COUNT(*) as count FROM follows WHERE follower_id = ?",
      [userId]
    );

    connection.release();

    res.json({
      user: {
        ...user,
        posts_count: posts[0].count,
        followers: followers[0].count,
        following: following[0].count
      }
    });
  } catch (error) {
    console.error("Error fetching user detail:", error);
    res.status(500).json({ error: "Failed to fetch user detail" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [is_active, userId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await logAdminAction(
      req.user.id,
      is_active ? "user_reactivated" : "user_deactivated",
      "users",
      userId,
      { is_active }
    );

    res.json({ message: "User status updated" });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
};

// ============================================
// REPORTS & MODERATION
// ============================================
export const getAllReports = async (req, res) => {
  try {
    const { status, reason, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT r.*, 
             reporter.username as reporter_username,
             reported_user.username as reported_user_username,
             admin.username as admin_username
      FROM reports r
      LEFT JOIN users reporter ON r.reporter_id = reporter.id
      LEFT JOIN users reported_user ON r.reported_user_id = reported_user.id
      LEFT JOIN users admin ON r.assigned_admin_id = admin.id
    `;

    const params = [];
    const conditions = [];

    if (status) {
      conditions.push("r.status = ?");
      params.push(status);
    }

    if (reason) {
      conditions.push("r.reason = ?");
      params.push(reason);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [reports] = await connection.execute(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as count FROM reports";
    const countParams = [];
    if (status) {
      countQuery += " WHERE status = ?";
      countParams.push(status);
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    const total = countResult[0].count;

    connection.release();

    res.json({ reports, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

export const getReportDetail = async (req, res) => {
  try {
    const { reportId } = req.params;
    const connection = await pool.getConnection();

    const [reports] = await connection.execute(
      `SELECT r.*, 
              reporter.username as reporter_username, reporter.avatar_url as reporter_avatar,
              reported_user.username as reported_user_username,
              admin.username as admin_username
       FROM reports r
       LEFT JOIN users reporter ON r.reporter_id = reporter.id
       LEFT JOIN users reported_user ON r.reported_user_id = reported_user.id
       LEFT JOIN users admin ON r.assigned_admin_id = admin.id
       WHERE r.id = ?`,
      [reportId]
    );

    if (!reports.length) {
      connection.release();
      return res.status(404).json({ error: "Report not found" });
    }

    const report = reports[0];

    // Get reported content
    if (report.post_id) {
      const [posts] = await connection.execute(
        "SELECT * FROM posts WHERE id = ?",
        [report.post_id]
      );
      if (posts.length) {
        report.reported_content = { type: "post", content: posts[0] };
      }
    }

    if (report.comment_id) {
      const [comments] = await connection.execute(
        "SELECT * FROM comments WHERE id = ?",
        [report.comment_id]
      );
      if (comments.length) {
        report.reported_content = { type: "comment", content: comments[0] };
      }
    }

    connection.release();

    res.json({ report });
  } catch (error) {
    console.error("Error fetching report detail:", error);
    res.status(500).json({ error: "Failed to fetch report detail" });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolution_notes } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      "UPDATE reports SET status = ?, resolution_notes = ?, assigned_admin_id = ?, resolved_at = NOW() WHERE id = ?",
      [status, resolution_notes || null, req.user.id, reportId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    await logAdminAction(req.user.id, "report_updated", "reports", reportId, { status, resolution_notes });

    res.json({ message: "Report updated" });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
};

export const takeModeratorAction = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, reason } = req.body; // action: 'warn', 'suspend', 'ban'

    const connection = await pool.getConnection();

    // Get report
    const [reports] = await connection.execute(
      "SELECT * FROM reports WHERE id = ?",
      [reportId]
    );

    if (!reports.length) {
      connection.release();
      return res.status(404).json({ error: "Report not found" });
    }

    const report = reports[0];

    if (action === "warn" || action === "suspend" || action === "ban") {
      if (report.reported_user_id) {
        // Apply action to user
        if (action === "ban") {
          await connection.execute("UPDATE users SET is_active = FALSE WHERE id = ?", [report.reported_user_id]);
        }
        // For warn and suspend, you might want to create a separate warnings/suspensions table
      }

      // Update report status
      await connection.execute(
        "UPDATE reports SET status = 'resolved', assigned_admin_id = ?, resolution_notes = ? WHERE id = ?",
        [req.user.id, `Action taken: ${action}. ${reason || ""}`, reportId]
      );
    }

    connection.release();

    await logAdminAction(req.user.id, `moderation_${action}`, "reports", reportId, { action, reason });

    res.json({ message: `${action} action applied` });
  } catch (error) {
    console.error("Error taking moderator action:", error);
    res.status(500).json({ error: "Failed to take action" });
  }
};

// ============================================
// MESSAGES MANAGEMENT
// ============================================
export const getAllMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = `
      SELECT cm.*, u.username, u.email as user_email, admin.username as admin_username
      FROM contact_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      LEFT JOIN users admin ON cm.assigned_admin_id = admin.id
    `;

    const params = [];

    if (status) {
      query += " WHERE cm.status = ?";
      params.push(status);
    }

    query += " ORDER BY cm.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [messages] = await connection.execute(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as count FROM contact_messages";
    if (status) {
      countQuery += " WHERE status = ?";
      const [countResult] = await connection.execute(countQuery, [status]);
      const total = countResult[0].count;
      connection.release();
      return res.json({ messages, total, page: parseInt(page), limit: parseInt(limit) });
    }

    const [countResult] = await connection.execute(countQuery);
    const total = countResult[0].count;

    connection.release();

    res.json({ messages, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { admin_reply } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      "UPDATE contact_messages SET admin_reply = ?, status = 'resolved', assigned_admin_id = ?, replied_at = NOW() WHERE id = ?",
      [admin_reply, req.user.id, messageId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    await logAdminAction(req.user.id, "message_replied", "contact_messages", messageId, { admin_reply });

    res.json({ message: "Reply sent" });
  } catch (error) {
    console.error("Error replying to message:", error);
    res.status(500).json({ error: "Failed to reply to message" });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      "UPDATE contact_messages SET status = ? WHERE id = ?",
      [status, messageId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    await logAdminAction(req.user.id, "message_status_updated", "contact_messages", messageId, { status });

    res.json({ message: "Message status updated" });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ error: "Failed to update message status" });
  }
};

// ============================================
// CATEGORIES MANAGEMENT
// ============================================
export const getAllCategories = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [categories] = await connection.execute(
      "SELECT * FROM categories ORDER BY display_order ASC"
    );

    connection.release();

    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, color } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    const connection = await pool.getConnection();

    // Check for duplicate slug
    const [existing] = await connection.execute("SELECT id FROM categories WHERE slug = ?", [slug]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: "Slug already exists" });
    }

    const [result] = await connection.execute(
      "INSERT INTO categories (name, slug, description, icon, color, created_by, display_order) VALUES (?, ?, ?, ?, ?, ?, (SELECT COUNT(*) FROM categories))",
      [name, slug, description || null, icon || null, color || null, req.user.id]
    );

    connection.release();

    await logAdminAction(req.user.id, "category_created", "categories", result.insertId, { name, slug });

    res.status(201).json({ id: result.insertId, message: "Category created" });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, color, is_visible, is_active, display_order } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      "UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon), color = COALESCE(?, color), is_visible = COALESCE(?, is_visible), is_active = COALESCE(?, is_active), display_order = COALESCE(?, display_order) WHERE id = ?",
      [name || null, description || null, icon || null, color || null, is_visible !== undefined ? is_visible : null, is_active !== undefined ? is_active : null, display_order !== undefined ? display_order : null, categoryId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    await logAdminAction(req.user.id, "category_updated", "categories", categoryId, req.body);

    res.json({ message: "Category updated" });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const connection = await pool.getConnection();

    const [result] = await connection.execute("DELETE FROM categories WHERE id = ?", [categoryId]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    await logAdminAction(req.user.id, "category_deleted", "categories", categoryId, {});

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

// ============================================
// TAGS MANAGEMENT
// ============================================
export const getAllTags = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [tags] = await connection.execute(
      "SELECT * FROM tags ORDER BY usage_count DESC"
    );

    connection.release();

    res.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

export const createTag = async (req, res) => {
  try {
    const { name, slug, description, is_nsfw } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    const connection = await pool.getConnection();

    // Check for duplicate
    const [existing] = await connection.execute("SELECT id FROM tags WHERE slug = ? OR name = ?", [slug, name]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: "Tag already exists" });
    }

    const [result] = await connection.execute(
      "INSERT INTO tags (name, slug, description, is_nsfw) VALUES (?, ?, ?, ?)",
      [name, slug, description || null, is_nsfw || false]
    );

    connection.release();

    await logAdminAction(req.user.id, "tag_created", "tags", result.insertId, { name, slug });

    res.status(201).json({ id: result.insertId, message: "Tag created" });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
};

export const updateTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const { name, description, is_nsfw, is_active } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      "UPDATE tags SET name = COALESCE(?, name), description = COALESCE(?, description), is_nsfw = COALESCE(?, is_nsfw), is_active = COALESCE(?, is_active) WHERE id = ?",
      [name || null, description || null, is_nsfw !== undefined ? is_nsfw : null, is_active !== undefined ? is_active : null, tagId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    await logAdminAction(req.user.id, "tag_updated", "tags", tagId, req.body);

    res.json({ message: "Tag updated" });
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ error: "Failed to update tag" });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    const connection = await pool.getConnection();

    const [result] = await connection.execute("DELETE FROM tags WHERE id = ?", [tagId]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    await logAdminAction(req.user.id, "tag_deleted", "tags", tagId, {});

    res.json({ message: "Tag deleted" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
};

export const mergeTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const { merge_into_tag_id } = req.body;

    const connection = await pool.getConnection();

    // Get usage counts
    const [sourceTags] = await connection.execute("SELECT usage_count FROM tags WHERE id = ?", [tagId]);
    const [targetTags] = await connection.execute("SELECT usage_count FROM tags WHERE id = ?", [merge_into_tag_id]);

    if (!sourceTags.length || !targetTags.length) {
      connection.release();
      return res.status(404).json({ error: "Tag not found" });
    }

    // Update usage count
    const newCount = sourceTags[0].usage_count + targetTags[0].usage_count;
    await connection.execute("UPDATE tags SET usage_count = ? WHERE id = ?", [newCount, merge_into_tag_id]);

    // Delete source tag
    await connection.execute("DELETE FROM tags WHERE id = ?", [tagId]);

    connection.release();

    await logAdminAction(req.user.id, "tag_merged", "tags", tagId, { merge_into_tag_id });

    res.json({ message: "Tag merged successfully" });
  } catch (error) {
    console.error("Error merging tags:", error);
    res.status(500).json({ error: "Failed to merge tags" });
  }
};

export const assignTagToCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { tag_id } = req.body;

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      "INSERT INTO category_tags (category_id, tag_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE tag_id = tag_id",
      [categoryId, tag_id]
    );

    connection.release();

    await logAdminAction(req.user.id, "tag_assigned_to_category", "category_tags", null, { categoryId, tag_id });

    res.json({ message: "Tag assigned to category" });
  } catch (error) {
    console.error("Error assigning tag:", error);
    res.status(500).json({ error: "Failed to assign tag" });
  }
};

export const getAdminLogs = async (req, res) => {
  try {
    const { admin_id, action, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    let query = "SELECT * FROM admin_logs";
    const params = [];
    const conditions = [];

    if (admin_id) {
      conditions.push("admin_id = ?");
      params.push(admin_id);
    }

    if (action) {
      conditions.push("action = ?");
      params.push(action);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [logs] = await connection.execute(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as count FROM admin_logs";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
      const [countResult] = await connection.execute(countQuery, params.slice(0, -2));
      const total = countResult[0].count;
      connection.release();
      return res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
    }

    const [countResult] = await connection.execute(countQuery);
    const total = countResult[0].count;

    connection.release();

    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    res.status(500).json({ error: "Failed to fetch admin logs" });
  }
};
