import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { register, login, me } from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { 
  adminMiddleware,
  getDashboardMetrics,
  getAllUsers,
  getUserDetail,
  updateUserStatus,
  getAllReports,
  getReportDetail,
  updateReportStatus,
  takeModeratorAction,
  getAllMessages,
  replyToMessage,
  updateMessageStatus,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  mergeTag,
  assignTagToCategory,
  getAdminLogs
} from "./routes/admin.js";
import { runMigrations } from "./migrations/runner.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Run database migrations on startup
await runMigrations();

// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", authMiddleware, me);

// Admin Routes
app.get("/api/admin/dashboard", authMiddleware, adminMiddleware, getDashboardMetrics);

// Users Management
app.get("/api/admin/users", authMiddleware, adminMiddleware, getAllUsers);
app.get("/api/admin/users/:userId", authMiddleware, adminMiddleware, getUserDetail);
app.put("/api/admin/users/:userId/status", authMiddleware, adminMiddleware, updateUserStatus);

// Reports & Moderation
app.get("/api/admin/reports", authMiddleware, adminMiddleware, getAllReports);
app.get("/api/admin/reports/:reportId", authMiddleware, adminMiddleware, getReportDetail);
app.put("/api/admin/reports/:reportId/status", authMiddleware, adminMiddleware, updateReportStatus);
app.post("/api/admin/reports/:reportId/action", authMiddleware, adminMiddleware, takeModeratorAction);

// Messages Management
app.get("/api/admin/messages", authMiddleware, adminMiddleware, getAllMessages);
app.put("/api/admin/messages/:messageId/reply", authMiddleware, adminMiddleware, replyToMessage);
app.put("/api/admin/messages/:messageId/status", authMiddleware, adminMiddleware, updateMessageStatus);

// Categories Management
app.get("/api/admin/categories", authMiddleware, adminMiddleware, getAllCategories);
app.post("/api/admin/categories", authMiddleware, adminMiddleware, createCategory);
app.put("/api/admin/categories/:categoryId", authMiddleware, adminMiddleware, updateCategory);
app.delete("/api/admin/categories/:categoryId", authMiddleware, adminMiddleware, deleteCategory);

// Tags Management
app.get("/api/admin/tags", authMiddleware, adminMiddleware, getAllTags);
app.post("/api/admin/tags", authMiddleware, adminMiddleware, createTag);
app.put("/api/admin/tags/:tagId", authMiddleware, adminMiddleware, updateTag);
app.delete("/api/admin/tags/:tagId", authMiddleware, adminMiddleware, deleteTag);
app.post("/api/admin/tags/:tagId/merge", authMiddleware, adminMiddleware, mergeTag);
app.post("/api/admin/categories/:categoryId/assign-tag", authMiddleware, adminMiddleware, assignTagToCategory);

// Admin Logs
app.get("/api/admin/logs", authMiddleware, adminMiddleware, getAdminLogs);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
