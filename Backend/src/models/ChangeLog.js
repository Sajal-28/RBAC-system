/**
 * @file models/ChangeLog.js
 * @description Mongoose schema for auditing system-wide changes.
 * Tracks CREATE, UPDATE, DELETE, and ROLE_CHANGE actions.
 */

const mongoose = require("mongoose");

const changeLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "ROLE_CHANGE"],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // Optional, because if a user is deleted, we might still store the ID but not require the ref to exist, actually mongoose ref doesn't strictly require the doc to exist
    },
    targetUserName: {
      type: String,
      required: false // Storing the name helps if the user is deleted
    },
    targetUserEmail: {
      type: String,
      required: false // Storing the email helps if the user is deleted
    },
    description: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const ChangeLog = mongoose.model("ChangeLog", changeLogSchema);

module.exports = ChangeLog;
