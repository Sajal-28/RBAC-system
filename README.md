# MERN Stack RBAC Authentication System 🛡️

A secure, production-ready, and feature-rich **Role-Based Access Control (RBAC)** Authentication System built with the MERN stack (MongoDB, Express, React, Node.js). This project demonstrates modern authentication practices, including JWT-based session management using HTTP-only cookies, granular 3-role route protection, comprehensive audit logging, and a sleek, premium administrative dashboard.

---

## 🌟 Key Features

### 🔐 Security & Authentication
- **JWT Authentication**: Secure session management using JSON Web Tokens with 7-day expiration.
- **HTTP-only Cookies**: Tokens are stored in HTTP-only cookies to prevent XSS attacks.
- **Token Blacklisting**: Invalidated tokens are stored in a blacklist collection with automatic TTL cleanup to prevent replay attacks after logout.
- **Bcrypt Hashing**: Passwords are securely hashed with salt before being stored in MongoDB.
- **RBAC (Role-Based Access Control)**: Granular permissions for **Super Admin**, **Admin**, and **User** roles.
- **Protected Routes**: Navigation-level and API-level protection for sensitive areas with role-based guards.
- **CORS Protection**: Dynamic origin configuration with credentials support.

### 👤 User Features
- **Registration & Login**: Smooth and validated onboarding flow with automatic session creation.
- **User Dashboard**: Personalized dashboard with role-specific insights.
- **Profile Management**: Users can view and update their own profile information (Name, Email) without affecting their role.
- **Persistent Sessions**: Automatic session recovery on page refresh via the `/api/auth/me` endpoint.

### 🛠️ Admin Features
- **Centralized User Directory**: View all registered users in a premium data table with sorting and filtering.
- **User Management (CRUD)**: Create, Read, Update, and Delete users directly from the dashboard.
- **System Statistics**: Real-time stats showing total users, admin count, and regular user count.
- **Advanced Role Management**: Ability to upgrade or downgrade user roles with strict hierarchy enforcement.

### 👑 Super Admin Features
- **Untouchable Account**: Super Admin accounts cannot be modified or deleted by anyone.
- **Audit Trail / Change Logs**: Comprehensive logging of all CREATE, UPDATE, DELETE, and ROLE_CHANGE actions across the system.
- **Full System Visibility**: Access to all admin features plus exclusive change log monitoring.

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
- **Bcrypt.js**: Secure password hashing.
- **Cookie Parser**: Middleware for secure cookie handling.
- **CORS**: Cross-Origin Resource Sharing configuration.
- **Dotenv**: Environment variable management.

### Frontend
- **React 18**: High-performance UI library.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for modern styling.
- **React Router 6**: Dynamic and declarative routing with nested route protection.
- **Axios**: Efficient HTTP client for API communication with interceptors.
- **Lucide React**: Beautifully simple, pixel-perfect icons.

---

## 📂 Project Structure

```text
├── Backend/
│   ├── src/
│   │   ├── config/         # Database configuration (db.js)
│   │   ├── controllers/    # API logic and route handlers
│   │   │   ├── authController.js    # Register, Login, Logout, GetCurrentUser
│   │   │   └── userController.js    # User CRUD, Stats, ChangeLogs, Profile
│   │   ├── middleware/     # Auth, Role, Error, and Async handlers
│   │   │   ├── authMiddleware.js    # JWT verification & token blacklist check
│   │   │   ├── roleMiddleware.js    # Role-based access control
│   │   │   ├── errorMiddleware.js   # 404 and global error handlers
│   │   │   └── asyncHandler.js      # Async wrapper for clean error handling
│   │   ├── models/         # Mongoose schemas
│   │   │   ├── User.js              # User schema with password hashing
│   │   │   ├── ChangeLog.js         # Audit trail for all system changes
│   │   │   └── BlacklistedToken.js  # Invalidated JWT tokens with TTL
│   │   ├── routes/         # API route definitions
│   │   │   ├── authRoutes.js        # Authentication routes
│   │   │   └── userRoutes.js        # User management routes
│   │   └── utils/          # Helper functions
│   │       └── generateToken.js     # JWT signing and cookie attachment
│   ├── seed.js             # One-time script to create default Super Admin
│   ├── server.js           # Entry point
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── api/            # Axios configuration with interceptors
│   │   ├── assets/         # Static assets (images)
│   │   ├── components/
│   │   │   ├── common/     # Reusable UI components & route guards
│   │   │   │   ├── ProtectedRoute.jsx    # General auth protection
│   │   │   │   ├── PublicRoute.jsx       # Redirect authenticated users
│   │   │   │   ├── AdminRoute.jsx        # Admin + Super Admin only
│   │   │   │   ├── SuperAdminRoute.jsx   # Super Admin only
│   │   │   │   ├── CreateUserModal.jsx   # Admin user creation modal
│   │   │   │   └── EditUserModal.jsx     # Admin user editing modal
│   │   │   └── layout/     # Layout components
│   │   │       ├── MainLayout.jsx        # Dashboard layout wrapper
│   │   │       ├── Navbar.jsx            # Top navigation bar
│   │   │       └── Sidebar.jsx           # Side navigation menu
│   │   ├── context/        # Global Auth State management
│   │   │   └── AuthContext.jsx           # Authentication provider & hooks
│   │   ├── pages/          # View components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   └── ChangeLogsPage.jsx
│   │   │   ├── error/
│   │   │   │   ├── Unauthorized.jsx
│   │   │   │   └── NotFound.jsx
│   │   │   └── profile/
│   │   │       └── MyProfile.jsx
│   │   ├── App.jsx         # Main routing and layout logic
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles & Tailwind directives
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20.17.0 recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)

### 2. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd "role based authentication system"
```

### 3. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_super_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Start the server:**

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

### 4. Seed the Super Admin (One-Time)

Run the seed script to create the default Super Admin account:

```bash
cd Backend
node seed.js
```

**Default Super Admin Credentials:**
- **Email:** `superadmin@gmail.com`
- **Password:** `SuperAdmin@123`

> ⚠️ **Note:** If a user with this email already exists, the script will skip creation.

### 5. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```

**Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🔑 Role Hierarchy & Permissions

The system implements a strict **3-role hierarchy**:

```
super-admin > admin > user
```

### Permission Matrix

| Action | Super Admin | Admin | User |
|--------|-------------|-------|------|
| View own profile | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| View all users | ✅ | ✅ | ❌ |
| Create new users | ✅ | ✅ | ❌ |
| Update other users | ✅ | ✅* | ❌ |
| Delete other users | ✅ | ✅* | ❌ |
| Change role → admin | ✅ | ✅** | ❌ |
| Change role → user | ✅ | ❌ | ❌ |
| View system statistics | ✅ | ✅ | ❌ |
| View change logs (audit trail) | ✅ | ❌ | ❌ |
| Modify super-admin accounts | ❌ | ❌ | ❌ |
| Delete super-admin accounts | ❌ | ❌ | ❌ |

> \* Admin cannot modify or delete other admins or super-admins.  
> \*\* Admin can only promote users to admin, never demote admins to users.

---

## 📜 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user (default role: `user`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & set JWT cookie |
| `POST` | `/api/auth/logout` | Private | Clear authentication cookie & blacklist token |
| `GET` | `/api/auth/me` | Private | Get current logged-in user details |

### User Routes (`/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/users/profile` | Any Authenticated | Get current user's own profile |
| `PUT` | `/api/users/profile` | Any Authenticated | Update own profile (name/email only) |
| `GET` | `/api/users/stats` | Admin, Super Admin | Get system statistics (total, admin, user counts) |
| `GET` | `/api/users/change-logs` | Super Admin Only | Get full audit trail of all system changes |
| `GET` | `/api/users` | Admin, Super Admin | Get all users (optional `?role=` filter) |
| `POST` | `/api/users` | Admin, Super Admin | Create a new user by admin |
| `PUT` | `/api/users/:id` | Admin, Super Admin | Update user by ID with role restrictions |
| `DELETE` | `/api/users/:id` | Admin, Super Admin | Delete user by ID with role restrictions |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | Bcrypt with salt rounds (10) |
| **Session Tokens** | JWT signed with secret, 7-day expiration |
| **Cookie Security** | HTTP-only, Secure in production, SameSite protection |
| **Token Invalidation** | Blacklist collection with 7-day TTL auto-cleanup |
| **Role Enforcement** | Middleware-level checks on every protected route |
| **Self-Protection** | Users cannot delete/modify their own account via admin panel |
| **Super Admin Protection** | Super Admin accounts are completely immutable |
| **Input Validation** | Mongoose schema validation and controller-level checks |
| **Error Handling** | Generic error messages for auth failures to prevent information leakage |

---

## 🧪 Postman Collection

A Postman collection is included for easy API testing:

```
Backend/RBAC-Auth.postman_collection.json
```

Import this file into Postman to test all available endpoints with pre-configured examples.

---

## 📝 Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret key for JWT signing |
| `NODE_ENV` | No | `development` | Environment mode (`development` / `production`) |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed CORS origin for frontend |

### Frontend (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:3000` | Backend API base URL |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- Built with the MERN stack ecosystem
- Icons by [Lucide React](https://lucide.dev/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

---