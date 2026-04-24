/**
 * @file server.js
 * @description Entry point for the MERN Stack RBAC Authentication System backend.
 * Configures Express, connects to MongoDB, sets up middleware, and defines API routes.
 * @author Antigravity AI
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

/**
 * Middleware Configuration
 */

// Enable CORS with dynamic origin and credentials support for cookies
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for JWT handling via HTTP-only cookies
app.use(cookieParser());

/**
 * API Routes
 */

/**
 * @route   GET /
 * @desc    Health check route to verify API status
 * @access  Public
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RBAC Authentication API is running"
  });
});

// Mount modular routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

/**
 * Error Handling Middleware
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
