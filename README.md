# MERN Stack RBAC Authentication System 🛡️

A secure, professional, and feature-rich Role-Based Access Control (RBAC) Authentication System built with the MERN stack (MongoDB, Express, React, Node.js). This project demonstrates modern authentication practices, including JWT-based session management using HTTP-only cookies, role-based route protection, and a sleek, premium administrative dashboard.

## 🌟 Key Features

### 🔐 Security & Authentication
- **JWT Authentication**: Secure session management using JSON Web Tokens.
- **HTTP-only Cookies**: Tokens are stored in HTTP-only cookies to prevent XSS attacks.
- **Bcrypt Hashing**: Passwords are securely hashed before being stored in MongoDB.
- **RBAC (Role-Based Access Control)**: Granular permissions for **Admin** and **User** roles.
- **Protected Routes**: Navigation-level and API-level protection for sensitive areas.

### 👤 User Features
- **Registration & Login**: Smooth and validated onboarding flow.
- **User Dashboard**: Personalized dashboard with role-specific insights.
- **Profile Management**: Users can view and update their own profile information (Name, Email).
- **Persistent Sessions**: Automatic session recovery on page refresh.

### 🛠️ Admin Features
- **Centralized User Directory**: View all registered users in a premium data table.
- **User Management (CRUD)**: Create, Read, Update, and Delete users directly from the dashboard.
- **System Statistics**: Real-time stats showing the total number of registered users.
- **Advanced Role Management**: Ability to upgrade or downgrade user roles.

### 🎨 Design & UX
- **Premium UI/UX**: Built with **Tailwind CSS** for a professional, minimal, and modern look.
- **Responsive Layout**: Fully optimized for Desktop, Tablet, and Mobile screens.
- **Rich Interaction**: Smooth transitions, loading states, and clear error handling.
- **Iconography**: Clean and expressive icons powered by **Lucide React**.

---

## 🏗️ Technology Stack

### Backend
- **Node.js & Express**: Scalable and robust API architecture.
- **MongoDB & Mongoose**: Flexible NoSQL database with schema modeling.
- **JSONWebToken (JWT)**: Industry-standard authentication.
- **Cookie Parser**: Middleware for secure cookie handling.
- **Dotenv**: Environment variable management.

### Frontend
- **React 18**: High-performance UI library.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for modern styling.
- **React Router 6**: Dynamic and declarative routing.
- **Axios**: Efficient HTTP client for API communication.
- **Lucide React**: Beautifully simple, pixel-perfect icons.

---

## 📂 Project Structure

```text
├── Backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # API logic and route handlers
│   ├── middleware/     # Auth, Role, and Error middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── utils/          # Helper functions (JWT generation)
│   └── server.js       # Entry point
├── Frontend/
│   ├── src/
│   │   ├── api/        # Axios configuration
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global Auth State management
│   │   ├── pages/      # View components (Login, Dashboards, etc.)
│   │   └── App.jsx     # Main routing and layout logic
│   └── .env            # Environment configurations
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20.17.0 recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)

### 2. Backend Setup
1. Navigate to the backend directory: `cd Backend`
2. Install dependencies: `npm install`
3. Create a `.env` file and configure:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```
4. Start the server: `npm start` (or `npm run dev`)

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file and configure:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Start the development server: `npm run dev`

---

## 📜 API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token
- `POST /api/auth/logout` - Clear authentication cookie
- `GET /api/auth/me` - Get current logged-in user

### User/Admin Routes
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/stats` - Get system statistics (Admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update own profile
- `PUT /api/users/:id` - Update user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user by ID (Admin only)

---
