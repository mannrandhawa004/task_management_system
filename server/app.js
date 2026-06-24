import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";

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
import { clientIpMiddleware } from "./src/middlewares/clientIp.middleware.js";
import { registerUserSocket, removeUserSocket, setSocketIO } from "./src/socket/socket.js";
import { setAuditServiceIO } from "./src/services/audit.service.js";
import { setupCronJobs } from "./src/utils/cron.js";

dotenv.config({
  quiet: true,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});


// app.use(limiter);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(clientIpMiddleware);
app.get("/", (req, res) => {
  res.send("Server running");
});

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

app.use(errorHandler);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});
// console.log(io)


setAuditServiceIO(io);
setSocketIO(io);
// setRectantelyServiceIO(io)

// Initialize cron jobs
setupCronJobs();

connectDB()
  .then(() => {
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
