# 🚀 Enterprise Task Management System (SaaS Platform)

<div align="center">
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Express%205-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MySQL%208-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Redux%20Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/2FA%20MFA-Microsoft%20Authenticator-0078D4?style=for-the-badge&logo=microsoftauthenticator&logoColor=white" alt="Microsoft Authenticator MFA" />
</div>

<br />

## Premium Marketing Site

This repository also includes a standalone React/Vite marketing site in [`saas_landing_react/`](saas_landing_react/). It presents TaskFlow with a responsive premium landing-page experience and keeps the existing workspace sign-in and provisioning flows available from its calls to action.

- Uses the real TaskFlow dashboard inside a responsive laptop hero composition, plus task-board and attendance product screenshots throughout the story.
- Combines a multi-color premium visual system with lightweight CSS 3D accents, animated headline reveals, and responsive floating status cards.
- Includes a GSAP ScrollTrigger-driven pinned product story with smooth masked transitions, plus a responsive cursor follower and reveal/stagger motion throughout the page.
- Provides compact, dark/light `/login` and `/signup` pages with tenant-aware authentication and a payment-gated provisioning flow using Stripe Checkout or Razorpay Checkout.
- Respects `prefers-reduced-motion` and falls back to a readable, non-pinned mobile story.
- Supports the same dark and light theme preference used across the product.

### Run the Marketing Site

```bash
cd saas_landing_react
npm install
npm run dev
```

The Vite preview runs at `http://localhost:5173` by default. For a production check, run `npm run build`.

---

> **A modern, multi-tenant, enterprise-grade Task Management & Workflow Automation platform.** Built with a high-performance **Next.js 15 (App Router)** frontend and an **Express 5 / MySQL** backend, featuring advanced **Role-Based Access Control (RBAC)**, **Multi-Factor Authentication (MFA)** via **Microsoft Authenticator**, real-time **Socket.IO** collaboration, **Department & Team Scoping**, and comprehensive **HR Attendance & Leave Management**.

---

## ✨ Key Features

### 🛡️ Enterprise Security & Multi-Factor Authentication (MFA)
- **Microsoft Authenticator Integration**: Seamless QR Code scan setup using standard RFC 6238 Time-Based One-Time Passwords (TOTP). No manual 16-digit code typing required!
- **Two-Step Login Protection**: Login flow dynamically issues short-lived temporary JWT verification tokens when 2FA is active, requiring a 6-digit TOTP confirmation before releasing full session access and refresh tokens.
- **Strict Role-Based Access Control (RBAC)**: Multi-tier hierarchical governance (`Super Admin`, `Admin`, `HR`, `Department Head`, `Project Manager`, `Team Lead`, `Manager`, `Senior Employee`, `Employee`, `Intern`).
- **Row-Level Security (RLS) & Visibility Filtering**: Dynamic SQL query scoping ensures users only view projects, tasks, and employee directories within their authorized department or team boundaries.

### 🏢 Department & Team Scoping
- **Department-Scoped Project Management**: Projects can be assigned to specific organizational departments (e.g., *Engineering*, *Marketing*, *Project Management*).
- **Intelligent Member Provisioning**: The **Add Member Drawer** features instant client-side memory search and automatically defaults to showing employees from the project's assigned department, with an admin toggle switch to expand scope organization-wide when cross-functional collaboration is needed.
- **Team Hierarchy**: Create specialized teams within departments with dedicated Team Leads and assign entire teams to complex projects in a single click.

### 📋 Interactive Project & Task Lifecycle
- **Dual-View Dashboard**: Switch effortlessly between sleek **Grid Card View** and density-optimized **Table View** with live department badges and status indicators.
- **Granular Task Governance**: Tasks support priorities (`Low`, `Medium`, `High`, `Urgent`), workflow statuses (`To Do`, `In Progress`, `Review`, `Completed`), due dates, and dedicated assignees.
- **Real-Time Collaboration**: Powered by **Socket.IO** for instantaneous task updates, assignment notifications, and live status broadcasting without page reloads.

### ⏱️ HR Attendance & Leave Management
- **Daily Attendance Tracking**: One-click employee check-in/check-out with work location tagging (`Office`, `Remote`, `Hybrid`) and break duration logging.
- **Leave Policy & Balance Management**: Configurable leave quotas (Annual, Sick, Casual, Maternity/Paternity), automated balance calculation, and hierarchical approval workflows.
- **Admin & HR Analytics**: Comprehensive daily attendance logs, monthly summaries, and salary deduction reporting.

### 🔍 System Audit Logging & Global Search
- **Immutable Audit Logs**: Super Admins have visibility into an immutable trail of system actions, tracking project modifications, task reassignments, and security events.
- **Global Command Search**: Fast, unified search across projects, tasks, and employee directories.

---

## 🛠️ Technology Stack

| Layer | Technology | Highlights |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15** (App Router), React 19 | Server Components, Client Components, Server Actions, Optimized Routing |
| **State Management** | **Redux Toolkit** (`@reduxjs/toolkit`), `react-redux` | Modular feature slices (`authSlice`, `projectSlice`, `taskSlice`, `themeSlice`) |
| **Styling & UI** | **Tailwind CSS**, Lucide React, Glassmorphism | Curated dark/light mode tokens, micro-animations, responsive SaaS layouts |
| **Backend API** | **Node.js**, **Express 5** | Async error handling, Express Rate Limit, Helmet, Compression, Cookie Parser |
| **Database** | **MySQL 8**, `mysql2/promise` | Raw parameterized SQL queries, custom connection pooling, transaction safety |
| **Real-Time** | **Socket.IO 4** | WebSocket bi-directional communication, user-specific room broadcasting |
| **Security & MFA** | `otpauth`, `qrcode`, `jsonwebtoken`, `bcrypt` | TOTP generation, Data URL QR codes, HTTP-only refresh cookies, CORS |
| **Media Storage** | **Cloudinary**, Multer | Cloud-based avatar and document storage with automatic image optimization |

---

## 📦 Project Structure

```text
task_management_system/
├── client/                     # Next.js 15 Frontend Application
│   ├── src/
│   │   ├── app/                # App Router pages ((protected)/dashboard/*, (auth)/*)
│   │   ├── components/         # Reusable UI components (projects, tasks, profile, common)
│   │   ├── features/           # Redux slices, thunks, and API service adapters
│   │   ├── lib/                # Permission helpers, toast notifications, axios client
│   │   └── store/              # Redux store configuration
│   └── package.json
│
├── server/                     # Express 5 Backend API Server
│   ├── scripts/                # Database migration and seed utilities (add_2fa_columns.js)
│   ├── src/
│   │   ├── config/             # MySQL database pooling & Cloudinary setup
│   │   ├── controllers/        # Route controllers (auth, project, task, user, attendance)
│   │   ├── middlewares/        # JWT auth, RBAC, rate limiting, file upload, error handler
│   │   ├── models/             # Raw SQL execution models (user.model.js, project.model.js)
│   │   ├── routes/             # REST API endpoints (/v1/auth, /v1/project, /v1/task, etc.)
│   │   ├── services/           # Business logic & TOTP engine (auth.service.js)
│   │   ├── socket/             # Socket.IO connection and event handlers
│   │   ├── utils/              # JWT token generators, async handlers, cron schedules
│   │   └── validators/         # Express-validator request schema validators
│   ├── app.js                  # Server entry point
│   └── package.json
│
├── database_dump.sql           # Full SQL database schema & initial seed data
├── swagger.json                # OpenAPI 3.0.3 API Specification
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **MySQL Server**: v8.0 or higher
- **Microsoft Authenticator**: Installed on iOS or Android (for testing 2FA MFA)

### 2. Database Setup
1. Create a MySQL database named `task_management`:
   ```sql
   CREATE DATABASE task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import the provided SQL schema dump:
   ```bash
   mysql -u root -p task_management < database_dump.sql
   ```
3. *(Optional)* If running migrations manually, execute the 2FA column migration:
   ```bash
   node server/scripts/add_2fa_columns.js
   ```

### 3. Backend Setup (`server/`)
1. Navigate to the server directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file in the `server/` directory:
   ```env
   PORT=8000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=task_management
   DB_PORT=3306
   
   # JWT Secrets
   JWT_SECRET=your_super_secret_access_token_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here
   JWT_TEMP_SECRET=your_super_secret_temp_2fa_token_key_here
   
   # Cloudinary (for avatar uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Frontend CORS Origin
   CLIENT_URL=http://localhost:3000

   # Payment-gated SaaS signup
   STRIPE_SECRET_KEY=sk_test_replace_me
   STRIPE_WEBHOOK_SECRET=whsec_replace_me
   RAZORPAY_KEY_ID=rzp_test_replace_me
   RAZORPAY_KEY_SECRET=replace_me
   RAZORPAY_WEBHOOK_SECRET=replace_with_a_separate_webhook_secret
   RAZORPAY_USD_TO_INR=83
   SAAS_LANDING_URL=http://localhost:5173
   CLIENT_APP_URL=http://localhost:3000
   ```
3. Initialize the SaaS control-plane database and subscription plans:
   ```bash
   node ../saas_platform/database/init_platform_db.js
   ```
4. Start the backend development server:
   ```bash
   npm run start
   # Server running on http://localhost:8000
   ```

### 4. Frontend Setup (`client/`)
1. Open a new terminal, navigate to the client directory, and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Create a `.env.local` file in the `client/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
   NEXT_PUBLIC_LANDING_URL=http://localhost:5173
   ```
3. Start the Next.js frontend development server:
   ```bash
   npm run dev
   # Application running on http://localhost:3000
   ```

### 5. Subscription Checkout Setup

The `/signup` flow creates a checkout first and provisions the tenant database and Super Admin only after the backend verifies a successful payment.

- **Stripe:** add a test or live `STRIPE_SECRET_KEY`. Customers are redirected to Stripe-hosted Checkout, then the backend retrieves the Checkout Session and confirms the expected paid amount.
- **Razorpay:** add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. The backend creates the Order, verifies the returned HMAC signature, and confirms/captures the payment before provisioning.
- **Webhooks:** register `POST /v1/saas/webhooks/stripe` for Stripe Checkout completion events and `POST /v1/saas/webhooks/razorpay` for Razorpay `payment.captured`/`order.paid` events. Set the matching `STRIPE_WEBHOOK_SECRET` and a separate `RAZORPAY_WEBHOOK_SECRET`; both endpoints verify the untouched raw request body and are idempotent.
- **Razorpay currency:** plan prices are stored in USD. `RAZORPAY_USD_TO_INR` controls the server-side conversion used to create INR Orders; update it to your production pricing policy.
- **Landing site:** optionally set `VITE_API_URL=http://localhost:8000` and `VITE_APP_URL=http://localhost:3000` in `saas_landing_react/.env.local`.

Use gateway test keys while developing. Replace them with live keys only after completing each provider's go-live checklist, configuring the webhook endpoints on a public HTTPS deployment, and reviewing capture settings in the provider dashboard.

---

## 📚 API Documentation (OpenAPI / Swagger)

The complete **OpenAPI 3.0.3 (Swagger)** REST API specification is included in the project root as [`swagger.json`](file:///c:/Users/hp/Desktop/task_management_system/swagger.json).

### How to View the Swagger Docs
1. **VS Code / IDE**: Open `swagger.json` with extensions like *Swagger Viewer* or *OpenAPI (Swagger) Editor*.
2. **Swagger UI Online**: Copy the contents of `swagger.json` into [editor.swagger.io](https://editor.swagger.io/) or [postman.com](https://www.postman.com/) to interactively test endpoints.
3. **Local Swagger UI**: You can serve `swagger.json` using packages like `swagger-ui-express`.

### Key API Endpoints Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth & MFA** | `POST` | `/v1/auth/login` | Authenticates credentials; returns `requires2FA: true` if MFA is active |
| **Auth & MFA** | `POST` | `/v1/auth/login/2fa-verify` | Verifies 6-digit TOTP code from Microsoft Authenticator |
| **Auth & MFA** | `POST` | `/v1/auth/2fa/generate` | Generates TOTP secret & Data URL QR code image for scanning |
| **Auth & MFA** | `POST` | `/v1/auth/2fa/verify-setup` | Validates initial OTP and activates 2FA on user account |
| **Projects** | `GET` | `/v1/project?departmentId={id}` | Lists projects with visibility rules and optional department filter |
| **Projects** | `POST` | `/v1/project/create` | Creates a new project scoped to an optional department |
| **Projects** | `POST` | `/v1/project/{id}/members` | Provisions team members with custom role assignments (`Member` / `Manager`) |
| **Tasks** | `POST` | `/v1/task/{projectId}/tasks` | Creates a new task with priority, status, and due date |
| **Tasks** | `PATCH` | `/v1/task/update/{taskId}/status` | Updates task status (`todo`, `in_progress`, `review`, `completed`) |
| **Departments** | `GET` | `/v1/departments` | Lists all active organizational departments |
| **Users** | `GET` | `/v1/users?departmentId={id}` | Lists employee directory with optional department and role filtering |
| **Attendance** | `POST` | `/v1/attendance/check-in` | Records employee check-in timestamp and work location |
| **Leaves** | `POST` | `/v1/leaves/apply` | Submits leave application with date range and leave type |

---

## 🔒 Security & Permissions Governance

The system implements strict row-level security and middleware checks:
- **`authMiddleware`**: Verifies HTTP-only JWT access tokens and attaches authenticated user context.
- **`authorizeRoles(...roles)`**: Restricts administrative endpoints to specified hierarchical roles.
- **`projectAccessMiddleware` & `taskAccessMiddleware`**: Ensures users cannot read or modify projects/tasks outside their assigned teams or departments.
- **`authorizePermissions(permission)`**: Validates granular action capabilities (e.g., `create_project`, `assign_task`).

---

<div align="center">
  <p>Built with ❤️ by <strong>Manpreet Singh</strong></p>
  <p>© 2026 Task Management System. All rights reserved.</p>
</div>
