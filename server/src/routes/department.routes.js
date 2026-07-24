import { Router } from "express";
import DepartmentController from "../controllers/department.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validate } from "../middlewares/validate.js";
import {
  createDepartmentValidator,
  updateDepartmentValidator,
} from "../validators/department.validator.js";
import {
  departmentAccessMiddleware,
} from "../middlewares/departmentAccess.middleware.js";
import { cacheResponse, invalidateCacheAfter } from "../middlewares/cache.middleware.js";

const router = Router();

router.use(authMiddleware);

// Only Super Admins can create, update, or delete departments
// (Admins are intentionally excluded — department structure is a super_admin responsibility)
router.post(
  "/create",
  authorizeRoles("super_admin"),
  createDepartmentValidator,
  validate,
  invalidateCacheAfter(["departments", "teams", "users", "projects", "dashboard"]),
  DepartmentController.createDepartment
);

router.patch(
  "/:id",
  authorizeRoles("super_admin"),
  updateDepartmentValidator,
  validate,
  invalidateCacheAfter(["departments", "teams", "users", "projects", "dashboard"]),
  DepartmentController.updateDepartment
);

router.delete(
  "/delete/:id",
  authorizeRoles("super_admin"),
  invalidateCacheAfter(["departments", "teams", "users", "projects", "dashboard"]),
  DepartmentController.deleteDepartment
);

// All authenticated employees can list departments (e.g. for selection in forms)
router.get(
  "/",
  cacheResponse({ resource: "departments-list", ttl: 300, scope: "tenant", versionResources: ["departments"] }),
  DepartmentController.listDepartments
);

// Department detail access is filtered by department membership or admin roles
router.get(
  "/:id",
  departmentAccessMiddleware,
  cacheResponse({ resource: (req) => `department-${req.params.id}`, ttl: 60, versionResources: ["departments", "users", "teams", "projects"], includeQuery: false }),
  DepartmentController.getDepartmentDetails
);

router.get(
  "/:id/users",
  departmentAccessMiddleware,
  cacheResponse({ resource: (req) => `department-${req.params.id}-users`, ttl: 45, versionResources: ["departments", "users", "teams"], includeQuery: false }),
  DepartmentController.getDepartmentUsers
);

router.get(
  "/:id/stats",
  departmentAccessMiddleware,
  cacheResponse({ resource: (req) => `department-${req.params.id}-stats`, ttl: 45, versionResources: ["departments", "users", "teams", "projects", "tasks"], includeQuery: false }),
  DepartmentController.getDepartmentStats
);

export default router;
