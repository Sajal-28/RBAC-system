/**
 * @file models/User.js
 * @description Mongoose schema and model for Users, including password hashing and verification logic.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema definition
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // Do not return password by default in queries
      select: false
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "user"],
      default: "user"
    }
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true
  }
);

/**
 * @desc Pre-save middleware to hash the password before saving it to the database.
 */
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * @function comparePassword
 * @description Compares a plain text password with the hashed password in the database.
 * @param {string} enteredPassword - The plain text password provided by the user.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
