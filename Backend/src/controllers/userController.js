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
const ChangeLog = require("../models/ChangeLog");
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
    callerRole === "super-admin" || callerRole === "admin" ? ["admin", "user"] : ["user"];

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

  // Log user creation
  const note = `${roleLabel(callerRole)} ${req.user.name} created a new user ${user.name} with role ${assignedRole}`;
  await ChangeLog.create({
    action: "CREATE",
    changedBy: req.user._id,
    targetUser: user._id,
    targetUserName: user.name,
    targetUserEmail: user.email,
    description: note,
    details: { role: assignedRole }
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

  let action = "UPDATE";
  let details = {};
  let descriptionParts = [];

  // ── Update basic fields ──────────────────────────────────────────────────
  if (name && name !== targetUser.name) {
    descriptionParts.push(`name from '${targetUser.name}' to '${name}'`);
    details.oldName = targetUser.name;
    details.newName = name;
    targetUser.name = name;
  }

  if (email && email.toLowerCase() !== targetUser.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(409);
      throw new Error("Email is already in use by another account");
    }
    descriptionParts.push(`email from '${targetUser.email}' to '${email.toLowerCase()}'`);
    details.oldEmail = targetUser.email;
    details.newEmail = email.toLowerCase();
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

    action = "ROLE_CHANGE";
    descriptionParts.push(`role from '${targetUser.role}' to '${role}'`);
    details.oldRole = targetUser.role;
    details.newRole = role;
    targetUser.role = role;
  }

  const updatedUser = await targetUser.save();

  if (descriptionParts.length > 0) {
    const note = `${roleLabel(caller.role)} ${caller.name} updated ${updatedUser.name}: changed ${descriptionParts.join(", ")}`;
    await ChangeLog.create({
      action,
      changedBy: caller._id,
      targetUser: updatedUser._id,
      targetUserName: updatedUser.name,
      targetUserEmail: updatedUser.email,
      description: note,
      details
    });
  }

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

  const note = `${roleLabel(caller.role)} ${caller.name} deleted user ${targetUser.name} (${targetUser.email})`;
  await ChangeLog.create({
    action: "DELETE",
    changedBy: caller._id,
    targetUserName: targetUser.name,
    targetUserEmail: targetUser.email,
    description: note
  });

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
// GET /api/users/change-logs
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @desc    Get all change audit logs
 * @route   GET /api/users/change-logs
 * @access  Private / Super Admin
 */
const getChangeLogs = asyncHandler(async (req, res) => {
  const logs = await ChangeLog.find()
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

  let descriptionParts = [];
  let details = {};

  if (name && name !== user.name) {
    descriptionParts.push(`name from '${user.name}' to '${name}'`);
    details.oldName = user.name;
    details.newName = name;
    user.name = name;
  }

  if (email && email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(409);
      throw new Error("Email is already in use by another account");
    }
    descriptionParts.push(`email from '${user.email}' to '${email.toLowerCase()}'`);
    details.oldEmail = user.email;
    details.newEmail = email.toLowerCase();
    user.email = email.toLowerCase();
  }

  const updatedUser = await user.save();

  if (descriptionParts.length > 0) {
    await ChangeLog.create({
      action: "UPDATE",
      changedBy: updatedUser._id,
      targetUser: updatedUser._id,
      targetUserName: updatedUser.name,
      targetUserEmail: updatedUser.email,
      description: `User ${updatedUser.name} updated own profile: changed ${descriptionParts.join(", ")}`,
      details
    });
  }

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
  getChangeLogs,
  getOwnProfile,
  updateOwnProfile
};
