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

const router = Router();

router.use(authMiddleware);

// Only Super Admins can create, update, or delete departments
// (Admins are intentionally excluded — department structure is a super_admin responsibility)
router.post(
  "/create",
  authorizeRoles("super_admin"),
  createDepartmentValidator,
  validate,
  DepartmentController.createDepartment
);

router.patch(
  "/:id",
  authorizeRoles("super_admin"),
  updateDepartmentValidator,
  validate,
  DepartmentController.updateDepartment
);

router.delete(
  "/delete/:id",
  authorizeRoles("super_admin"),
  DepartmentController.deleteDepartment
);

// All authenticated employees can list departments (e.g. for selection in forms)
router.get(
  "/",
  DepartmentController.listDepartments
);

// Department detail access is filtered by department membership or admin roles
router.get(
  "/:id",
  departmentAccessMiddleware,
  DepartmentController.getDepartmentDetails
);

router.get(
  "/:id/users",
  departmentAccessMiddleware,
  DepartmentController.getDepartmentUsers
);

router.get(
  "/:id/stats",
  departmentAccessMiddleware,
  DepartmentController.getDepartmentStats
);

export default router;
