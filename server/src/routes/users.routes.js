import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { uploadProfilePic } from "../middlewares/upload.middleware.js";
import { createUserValidator, updateUserValidator } from "../validators/user.validator.js";
import { validate } from "../middlewares/validate.js";
import { cacheResponse, invalidateCacheAfter } from "../middlewares/cache.middleware.js";

const router = Router();

router.use(authMiddleware); // All user management endpoints require active session authentication

// 1. Employee listing & roles (accessible to logged-in employees, but results are visibility restricted at model level)
router.get(
  "/",
  cacheResponse({ resource: "users-list", ttl: 30, versionResources: ["users", "departments", "teams"] }),
  UserController.getAllUsers,
);
router.get(
  "/roles",
  cacheResponse({ resource: "user-roles", ttl: 1800, scope: "tenant", includeQuery: false }),
  UserController.getAllRoles,
);
router.get(
  "/birthdays/today",
  cacheResponse({ resource: "birthdays-today", ttl: 3600, versionResources: ["birthdays"] }),
  UserController.getTodayBirthdays,
);
router.get(
  "/:id",
  cacheResponse({ resource: (req) => `user-${req.params.id}`, ttl: 60, versionResources: ["users", "departments", "teams"], includeQuery: false }),
  UserController.getUserById,
);

// 2. User CRUD administration
// Super Admin and Admin have full access (via authorizeRoles bypass).
// HR role is explicitly granted access here to add/edit/delete employees —
// their scope is enforced at the model/service layer (they see all employees but cannot touch departments).
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "hr"),
  uploadProfilePic.single("avatar"),
  createUserValidator,
  validate,
  invalidateCacheAfter(["users", "departments", "teams", "projects", "tasks", "birthdays", "dashboard"]),
  UserController.createUser
);

router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "hr"),
  uploadProfilePic.single("avatar"),
  updateUserValidator,
  validate,
  invalidateCacheAfter(["users", "departments", "teams", "projects", "tasks", "birthdays", "dashboard"]),
  UserController.updateUser
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin", "hr"),
  invalidateCacheAfter(["users", "departments", "teams", "projects", "tasks", "birthdays", "dashboard"]),
  UserController.deleteUser
);

export default router;
