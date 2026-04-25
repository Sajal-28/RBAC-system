/**
 * @file models/RoleChangeLog.js
 * @description Mongoose schema for auditing role changes.
 * A document is created every time any user's role is modified by an admin or super-admin.
 */

const mongoose = require("mongoose");

/**
 * RoleChangeLog Schema
 */
const roleChangeLogSchema = new mongoose.Schema(
  {
    /**
     * The user who performed the role change (admin / super-admin)
     */
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /**
     * The user whose role was changed
     */
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /**
     * The role before the change
     */
    previousRole: {
      type: String,
      enum: ["super-admin", "admin", "user"],
      required: true
    },

    /**
     * The role after the change
     */
    newRole: {
      type: String,
      enum: ["super-admin", "admin", "user"],
      required: true
    },

    /**
     * Optional human-readable description of the action
     * e.g. "Super Admin Sajal promoted Rahul from user to admin"
     */
    note: {
      type: String,
      default: ""
    }
  },
  {
    // Automatically adds createdAt (used as changedAt) and updatedAt
    timestamps: true
  }
);

const RoleChangeLog = mongoose.model("RoleChangeLog", roleChangeLogSchema);

module.exports = RoleChangeLog;
