import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import cors from "cors";
import compression from "compression";

import { errorHandler } from "./src/middlewares/errorHandlerMiddleware.js";
import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routes/auth.routes.js";
import projectRoutes from "./src/routes/projects.routes.js";
import taskRoutes from "./src/routes/task.routes.js";
import auditRoutes from "./src/routes/audit.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js"
import departmentRoutes from "./src/routes/department.routes.js";
import teamRoutes from "./src/routes/team.routes.js";
import attendanceRoutes from "./src/routes/attendance.routes.js";
import leaveRoutes from "./src/routes/leave.routes.js";
import usersRoutes from "./src/routes/users.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import saasRoutes from "../saas_platform/routes/saas.routes.js";
import SaasController from "../saas_platform/controllers/saas.controller.js";
import { clientIpMiddleware } from "./src/middlewares/clientIp.middleware.js";
import { registerUserSocket, removeUserSocket, setSocketIO } from "./src/socket/socket.js";
import { setAuditServiceIO } from "./src/services/audit.service.js";
import { setupCronJobs } from "./src/utils/cron.js";
import { initializeRedis } from "./src/config/redis.js";

dotenv.config({
  quiet: true,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, file://) or any localhost/127.0.0.1 port
    if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:") || origin.startsWith("file://")) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all during development/SaaS landing preview
    }
  },
  credentials: true,
  exposedHeaders: ["X-Cache"],
};

app.use(cors(corsOptions));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});


// app.use(limiter);

// Payment providers require the exact raw request bytes for webhook signature
// verification. These routes must stay before express.json().
app.post(
  "/v1/saas/webhooks/stripe",
  express.raw({ type: "application/json", limit: "100kb" }),
  SaasController.stripeWebhook,
);
app.post(
  "/v1/saas/webhooks/razorpay",
  express.raw({ type: "application/json", limit: "100kb" }),
  SaasController.razorpayWebhook,
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(clientIpMiddleware);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get(["/swagger.json", "/v1/swagger.json"], (req, res) => {
  try {
    const swaggerData = fs.readFileSync(path.join(__dirname, "../swagger.json"), "utf8");
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerData);
  } catch (err) {
    res.status(404).json({ success: false, message: "Swagger spec not found" });
  }
});

const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Enterprise Task Management System — API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      color: #0f172a;
    }
    .swagger-ui {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }
    .swagger-ui .topbar {
      display: none;
    }
    .swagger-ui .info .title {
      color: #0284c7 !important;
    }
    .swagger-ui .scheme-container {
      background: #ffffff !important;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1
      });
    };
  </script>
</body>
</html>
`;

app.get(["/", "/v1", "/api-docs", "/docs"], (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(swaggerHtml);
});

app.use("/v1/saas", saasRoutes);
app.use("/v1/auth", authRoutes);
app.use("/v1/project", projectRoutes);
app.use("/v1/task", taskRoutes);
app.use("/v1/audit-logs", auditRoutes);
app.use("/v1/notification", notificationRoutes);
app.use('/v1/dashboard', dashboardRoutes);
app.use("/v1/departments", departmentRoutes);
app.use("/v1/teams", teamRoutes);
app.use("/v1/attendance", attendanceRoutes);
app.use("/v1/leaves", leaveRoutes);
app.use("/v1/users", usersRoutes);
app.use("/v1/search", searchRoutes);

app.use(errorHandler);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: corsOptions,
});
// console.log(io)


setAuditServiceIO(io);
setSocketIO(io);
// setRectantelyServiceIO(io)

// Initialize cron jobs
setupCronJobs();

connectDB()
  .then(() => {
    // Redis is an optional optimization. Do not delay API availability while
    // it connects or reconnects; requests safely bypass the cache until ready.
    void initializeRedis();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Failed to start server:", err));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId, role) => {
    registerUserSocket(userId, socket.id);
    console.log(`User ${userId} registered`);
  });

  socket.on("disconnect", () => {
    removeUserSocket(socket.id);

    console.log("User disconnected");
  });
});
