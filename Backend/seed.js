/**
 * @file seed.js
 * @description One-time seed script to create the default Super Admin account.
 *
 * Usage (run once from the Backend directory):
 *   node seed.js
 *
 * WARNING: If a user with this email already exists, the script will skip creation.
 */

const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// Import after dotenv so env vars are loaded
const connectDB = require("./src/config/db");
const User = require("./src/models/User");

const SUPER_ADMIN = {
  name: "Super Admin",
  email: "superadmin@gmail.com",
  password: "SuperAdmin@123",
  role: "super-admin"
};

const seed = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: SUPER_ADMIN.email });

    if (existing) {
      console.log(
        `[Seed] Super Admin already exists: ${existing.email} — skipping.`
      );
    } else {
      await User.create(SUPER_ADMIN);
      console.log(`[Seed] ✅ Super Admin created successfully!`);
      console.log(`        Email   : ${SUPER_ADMIN.email}`);
      console.log(`        Password: ${SUPER_ADMIN.password}`);
    }
  } catch (err) {
    console.error("[Seed] ❌ Error:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("[Seed] Database connection closed.");
    process.exit(0);
  }
};

seed();
