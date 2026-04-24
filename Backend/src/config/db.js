/**
 * @file config/db.js
 * @description Database configuration and connection logic using Mongoose.
 */

const mongoose = require("mongoose");

/**
 * @function connectDB
 * @description Establishes a connection to the MongoDB database using the URI provided in environment variables.
 * Exits the process with status 1 if the connection fails.
 * @async
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
