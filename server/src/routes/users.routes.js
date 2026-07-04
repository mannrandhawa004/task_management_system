import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { uploadProfilePic } from "../middlewares/upload.middleware.js";
import { createUserValidator, updateUserValidator } from "../validators/user.validator.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

router.use(authMiddleware); // All user management endpoints require active session authentication

// 1. Employee listing & roles (accessible to logged-in employees, but results are visibility restricted at model level)
router.get("/", UserController.getAllUsers);
router.get("/roles", UserController.getAllRoles);
router.get("/birthdays/today", UserController.getTodayBirthdays);
router.get("/:id", UserController.getUserById);

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
  UserController.createUser
);

router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "hr"),
  uploadProfilePic.single("avatar"),
  updateUserValidator,
  validate,
  UserController.updateUser
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin", "hr"),
  UserController.deleteUser
);

export default router;
