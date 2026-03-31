# Zora (Intern-Keka) - Technical Documentation

Welcome to the official technical documentation for **Zora**, a comprehensive Human Resource Management System (HRMS) specifically tailored for intern management. This project is a robust, full-stack application designed to mirror advanced platforms like Keka, providing features for attendance tracking, leave management, payroll, and organizational social engagement.

---

## 1. Project Overview

### Purpose
Zora solves the challenge of tracking and managing a large pool of interns. Standard HRMS tools are often too complex or expensive for intern-specific workflows. Zora provides a streamlined, high-performance interface for:
- **Interns**: To track their attendance, apply for leaves, and view payslips.
- **Managers**: To approve requests and monitor team productivity.
- **Admins**: To configure organizational settings, manage user roles, and ensure security.

### High-Level Architecture
Zora follows a **Decoupled Client-Server Architecture**:
- **Frontend**: A modern React Single Page Application (SPA) built with Vite for speed and Shadcn for premium UI components.
- **Backend**: A Node.js/Express REST API (Model-View-Controller pattern) that handles business logic, security, and data persistence.
- **Database**: MongoDB (via Mongoose) chosen for its flexible schema, perfect for evolving HR data.
- **Integrations**: Slack API for automated notifications and SMTP/Nodemailer for email-based verification.

---

## 2. Detailed Tech Stack

### Frontend (The User Interface)
- **React (v19)**: The core library for building the user interface.
- **Vite**: The build tool and dev server, offering near-instant hot module replacement.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn/UI & Radix UI**: Accessible, high-quality component primitives used for modals, tabs, and dropdowns.
- **Lucide React**: A clean and consistent icon library.
- **Axios**: Promised-based HTTP client for making API requests to the backend.
- **Framer Motion**: Used for those smooth, premium transitions and micro-animations.

### Backend (The Brain)
- **Node.js & Express (v5)**: The runtime environment and framework for the REST API.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB, providing schema validation and easy data manipulation.
- **JWT (JSON Web Token)**: Used for secure, stateless authentication.
- **Bcryptjs**: Library for hashing passwords before storing them in the database.
- **Nodemailer**: Used for sending OTPs and notification emails.
- **Node-Cron**: Handles scheduled tasks like generating monthly payroll reports.

### Middlewares & Security
- **Helmet**: Sets various HTTP headers to secure the app against common vulnerabilities.
- **Express Rate Limit**: Prevents brute-force attacks and spamming by limiting request frequency.
- **Mongo-Sanitize & XSS-Clean**: Protects against NoSQL injection and Cross-Site Scripting (XSS) attacks.
- **Cookie-Parser**: Handles secure, HTTP-only cookies for session management (prevents token theft).

---

## 3. Project Structure (Folder-by-Folder)

### Backend Structure
| Folder | Purpose |
| :--- | :--- |
| **config/** | Database connection (MongoDB) and shared configuration logic. |
| **controllers/** | **The "Thinker" layer.** Contains the actual business logic for each feature. |
| **cron/** | Tasks that run on a timer (e.g., auto-check-out at midnight). |
| **middlewares/** | Logic that runs *before* a request hits a route (Auth, Permissions). |
| **models/** | **The "Blueprint" layer.** Defines what our data looks like in MongoDB. |
| **routes/** | **The "Map" layer.** Connects incoming URLs to the correct controllers. |
| **scripts/** | One-off administrative tools (e.g., creating the first Super Admin). |
| **utils/** | Common helper functions like OTP generation and date formatting. |
| **server.js** | **The Entry Point.** Initializes the Express app and starts the server. |

### Frontend Structure
| Folder | Purpose |
| :--- | :--- |
| **src/api/** | Centralized Axios setup to handle base URLs and error handling. |
| **src/components/** | Reusable buttons, inputs, and the "Islands" of the Dashboard. |
| **src/components/dashboard-tabs/** | Individual page logic for Admin, Attendance, Inbox, and Payroll. |
| **src/layout/** | The Sidebar, Topbar, and the overall frame of the application. |
| **src/lib/** | Low-level utility functions (e.g., `cn` for Tailwind class merging). |
| **App.jsx** | **The Root Component.** Manages global user state and conditional routing. |

---

## 4. Module Deep-Dive

### Authentication & Recovery Module
- **Purpose**: Securely logging users in and rescuing their accounts.
- **Flow**:
    1. **Sign In**: Backend compares hashed password → Signs a JWT → Set in a Secure Cookie.
    2. **Forgot Password**: 
        - Input Email → Backend sends 6-digit OTP via Email.
        - Verify OTP → Temporary grant to reset.
        - Reset Password → Hashes new password and stores it.
- **APIs Used**: `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`.

### HRMS & Attendance Module
- **Purpose**: Tracking daily intern productivity.
- **Features**:
    - **Live Metrics**: Shows active time vs. required time (Effective Hours).
    - **Status Tracking**: Automatically tags logs as "Present", "Late", or "Half Day".
    - **Manager Dashboard**: Reporting Managers can edit or approve employee logs.
- **Logic**: Uses a "Grace Period" rule (defined in settings) to calculate penalties.

### Leave & Request System
- **Purpose**: Handling time-off requests.
- **Workflow**: Intern applies → Notification sent to Manager → Manager approves/denies → User notified.
- **Logic**: Automatically deducts from the user's `Leave Quota` (Sick, Paid, or Casual) upon approval.

---

## 5. API Reference (Core Endpoints)

| Endpoint | Method | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | **POST** | Sign into the dashboard. | No |
| `/api/auth/me` | **GET** | Fetch current logged-in user details. | Yes |
| `/api/attendance/clock-in` | **POST** | Record a new clock-in entry. | Yes |
| `/api/admin/users` | **GET** | List all organization users (Admin only). | Yes |
| `/api/leaves` | **GET** | Fetch My Leave statistics and history. | Yes |
| `/api/requests` | **POST** | Submit a new Leave/Attendance request. | Yes |
| `/api/slack/token-status`| **GET** | Check if Slack integration is active. | Yes |

---

## 6. Database Models (Mongoose Schemas)

Each model represents a collection in MongoDB:

### **User Model** (`User.js`)
Stores user profiles, roles, and settings.
- `role`: Defines access level (`Super Admin`, `Intern`, etc.).
- `internId`: Automatically generated serial (e.g., `TPINT101`).
- `leaveQuotas`: Tracks remaining days for Sick/Paid leave.

### **Attendance Model** (`Attendance.js`)
Stores every clocking event.
- `status`: One of `Present`, `Late`, `Half Day`, or `Absent`.
- `effectiveMinutes`: calculated work time (excluding breaks).

### **Payslip Model** (`Payslip.js`)
Stores historical payroll data.
- Linked to a `User` and includes a breakdown of `Basic`, `HRA`, and `Deductions`.

---

## 7. Security Architecture

1. **JWT-in-Cookie Auth**: We use cookies instead of LocalStorage because cookies marked `httpOnly` are immune to script-based theft (XSS).
2. **Password Hashing**: We use **Bcryptjs** with a salt factor of 10. The original password never touches the database.
3. **RBAC Middleware**:
   ```javascript
   router.put('/settings', protect, authorize(['Super Admin']), updateSettings);
   ```
   This ensures only a `Super Admin` can change organization-wide rules.
4. **Rate Limiting**: Protects login and forgot-password routes from brute-force bot attacks.

---

## 8. Development & Deployment

**Running Locally:**
1. Configure `.env` in `backend/` and `frontend/`.
2. Start Backend: `npm run dev` (Port 5000).
3. Start Frontend: `npm run dev` (Port 5173).

**Deploying to Railway:**
- **Statelessness**: The app stores no images/files locally. It uses MongoDB for all data, making it ready for multi-instance deployment.
- **Process**: Railway build pipeline reads the root `package.json` to start the services.

---

*This document serves as the high-level technical reference for the Zora project. For specific function-level documentation, refer to the comments within the controller and middleware files.*
