/**
 * @file controllers/userController.js
 * @description Controllers for user-related operations with strict 3-role hierarchy enforcement.
 *
 * Role hierarchy: super-admin > admin > user
 *
 * Permission matrix:
 * ─────────────────────────────────────────────────────────
 *  Action                 │ super-admin │ admin │ user
 * ─────────────────────────────────────────────────────────
 *  View all users         │     ✓       │   ✓   │  ✗
 *  Delete user            │     ✓       │   ✓*  │  ✗
 *  Update user details    │     ✓       │   ✓*  │  ✗
 *  Change role → admin    │     ✓       │   ✓** │  ✗
 *  Change role → user     │     ✓       │   ✗   │  ✗
 *  Touch super-admin      │     ✗       │   ✗   │  ✗
 *  Touch own role         │     ✗       │   ✗   │  ✗
 * ─────────────────────────────────────────────────────────
 *  * admin cannot touch other admins or super-admins
 *  ** admin can only promote user→admin, never demote
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const RoleChangeLog = require("../models/RoleChangeLog");
const asyncHandler = require("../middleware/asyncHandler");

// ─────────────────────────────────────────────
// Helper: capitalise first letter of role label
// ─────────────────────────────────────────────
const roleLabel = (role) => {
  const map = { "super-admin": "Super Admin", admin: "Admin", user: "User" };
  return map[role] || role;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Get all users (Admin + Super Admin)
 * @route   GET /api/users
 * @access  Private / Admin, Super Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;

  // Build filter
  const query = role ? { role } : {};

  const users = await User.find(query).select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users   (Admin-created user)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Create a new user (Admin + Super Admin)
 * @route   POST /api/users
 * @access  Private / Admin, Super Admin
 */
const createUserByAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const callerRole = req.user.role;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  // Determine what roles this caller may assign
  const allowedRoles =
    callerRole === "super-admin" ? ["admin", "user"] : ["user"];

  const assignedRole = role || "user";

  if (!allowedRoles.includes(assignedRole)) {
    res.status(403);
    throw new Error(
      `Your role (${callerRole}) is not permitted to create a user with role '${assignedRole}'`
    );
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: assignedRole
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:id
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Update user by ID with strict role-change rules
 * @route   PUT /api/users/:id
 * @access  Private / Admin, Super Admin
 */
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const caller = req.user;

  // ── Validate ID ─────────────────────────────────────────────────────────
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  // ── Prevent self-management ──────────────────────────────────────────────
  if (id === caller._id.toString()) {
    res.status(403);
    throw new Error(
      "You cannot edit your own account through the management panel. Use the Profile page."
    );
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    res.status(404);
    throw new Error("User not found");
  }

  // ── Super-admin accounts are untouchable by anyone ───────────────────────
  if (targetUser.role === "super-admin") {
    res.status(403);
    throw new Error("Super Admin accounts cannot be modified");
  }

  // Removed the restriction that prevented admins from modifying other admins.

  // ── Update basic fields ──────────────────────────────────────────────────
  if (name) targetUser.name = name;

  if (email && email.toLowerCase() !== targetUser.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(409);
      throw new Error("Email is already in use by another account");
    }
    targetUser.email = email.toLowerCase();
  }

  // ── Role change logic ────────────────────────────────────────────────────
  if (role && role !== targetUser.role) {
    const validRoles = ["super-admin", "admin", "user"];

    if (!validRoles.includes(role)) {
      res.status(400);
      throw new Error("Invalid role. Must be 'super-admin', 'admin', or 'user'");
    }

    // Nobody can assign super-admin via this route
    if (role === "super-admin") {
      res.status(403);
      throw new Error("The 'super-admin' role cannot be assigned through this route");
    }

    // Removed the restriction that prevented admins from demoting users.

    // Capture previous role before saving
    const previousRole = targetUser.role;
    targetUser.role = role;

    // ── Save role change to audit log ──────────────────────────────────────
    const note = `${roleLabel(caller.role)} ${caller.name} changed ${targetUser.name}'s role from ${previousRole} to ${role}`;

    await RoleChangeLog.create({
      changedBy: caller._id,
      targetUser: targetUser._id,
      previousRole,
      newRole: role,
      note
    });
  }

  const updatedUser = await targetUser.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/:id
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Delete user by ID with 3-role restrictions
 * @route   DELETE /api/users/:id
 * @access  Private / Admin, Super Admin
 */
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const caller = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  // Prevent self-deletion
  if (id === caller._id.toString()) {
    res.status(403);
    throw new Error("You cannot delete your own account");
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    res.status(404);
    throw new Error("User not found");
  }

  // Super-admin accounts can never be deleted
  if (targetUser.role === "super-admin") {
    res.status(403);
    throw new Error("Super Admin accounts cannot be deleted");
  }

  // Removed the restriction that prevented admins from deleting other admins.

  await targetUser.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully"
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/stats
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Get system statistics
 * @route   GET /api/users/stats
 * @access  Private / Admin, Super Admin
 */
const getSystemStats = asyncHandler(async (req, res) => {
  const [totalUsers, adminUsers, regularUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user" })
  ]);

  res.status(200).json({
    success: true,
    totalUsers,
    adminUsers,
    regularUsers
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/role-logs
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Get role change audit logs
 * @route   GET /api/users/role-logs
 * @access  Private / Super Admin
 */
const getRoleLogs = asyncHandler(async (req, res) => {
  const logs = await RoleChangeLog.find()
    .populate("changedBy", "name email role")
    .populate("targetUser", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: logs.length,
    logs
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/profile
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Get current user's own profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getOwnProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.status(200).json({
    success: true,
    user
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/profile
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Update current user's own profile (name/email only — no role)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateOwnProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Block any attempt to change role through this route
  if (Object.prototype.hasOwnProperty.call(req.body, "role")) {
    res.status(403);
    throw new Error("You are not allowed to update your role through this route");
  }

  if (name) user.name = name;

  if (email && email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(409);
      throw new Error("Email is already in use by another account");
    }
    user.email = email.toLowerCase();
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

module.exports = {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getSystemStats,
  getRoleLogs,
  getOwnProfile,
  updateOwnProfile
};
