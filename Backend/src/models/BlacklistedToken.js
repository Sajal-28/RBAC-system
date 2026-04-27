/**
 * @file models/BlacklistedToken.js
 * @description Mongoose schema for storing invalidated JWT tokens.
 * A TTL index automatically removes tokens after 7 days to prevent database bloat.
 */

const mongoose = require("mongoose");

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL index: automatically expire documents after 7 days (604800 seconds)
    // This matches the 7d expiration of our JWTs.
    expires: 604800
  }
});

const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema);

module.exports = BlacklistedToken;
