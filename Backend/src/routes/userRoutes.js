/**
 * @file routes/userRoutes.js
 * @description Route definitions for user-related endpoints with 3-role RBAC protection.
 *
 * Role access summary:
 *  GET  /profile          → any authenticated user
 *  PUT  /profile          → any authenticated user
 *  GET  /stats            → admin, super-admin
 *  GET  /change-logs      → super-admin only
 *  GET  /                 → admin, super-admin
 *  POST /                 → admin, super-admin
 *  PUT  /:id              → admin, super-admin
 *  DELETE /:id            → admin, super-admin
 */

const express = require("express");
const {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getSystemStats,
  getChangeLogs,
  getOwnProfile,
  updateOwnProfile
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// ── Own-profile routes (any authenticated user) ──────────────────────────────
router.get("/profile", protect, getOwnProfile);
router.put("/profile", protect, updateOwnProfile);

// ── Admin-panel routes (admin + super-admin) ─────────────────────────────────
router.get(
  "/stats",
  protect,
  authorizeRoles("super-admin", "admin"),
  getSystemStats
);

// Change audit log — super-admin only
router.get(
  "/change-logs",
  protect,
  authorizeRoles("super-admin"),
  getChangeLogs
);

router.get("/", protect, authorizeRoles("super-admin", "admin"), getAllUsers);
router.post("/", protect, authorizeRoles("super-admin", "admin"), createUserByAdmin);
router.put("/:id", protect, authorizeRoles("super-admin", "admin"), updateUserByAdmin);
router.delete("/:id", protect, authorizeRoles("super-admin", "admin"), deleteUserByAdmin);

module.exports = router;
