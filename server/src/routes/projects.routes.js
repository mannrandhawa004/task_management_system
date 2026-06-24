import { Router } from "express";
import ProjectController from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validate } from "../middlewares/validate.js";

import {
  createProjectValidator,
  updateProjectValidator,
  addProjectMemberValidator,
} from "../validators/project.validator.js";
import { projectAccessMiddleware } from "../middlewares/projectAccess.middleware.js";
import { authorizeProjectRoles } from "../middlewares/authorizeProjectRoles.middleware.js";
import { authorizePermissions } from "../middlewares/authorizePermissions.middleware.js";

const router = Router();

router.get("/", authMiddleware, authorizeRoles("super_admin"), ProjectController.allProjects);

router.get("/roles", authMiddleware, ProjectController.getProjectRoles);

router.get("/details/:id", authMiddleware, ProjectController.individualProject);

router.post(
  "/create",
  authMiddleware,
  authorizePermissions("create_project"),
  createProjectValidator,
  validate,
  ProjectController.createProject,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizePermissions("update_project"),
  updateProjectValidator,
  validate,
  ProjectController.updateProject,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  authorizePermissions("delete_project"),
  ProjectController.deleteProject,
);

router.get(
  "/:projectId/members",
  authMiddleware,
  projectAccessMiddleware,
  ProjectController.getProjectMembers,
);

// assigning projects to members
router.post(
  "/:id/members",
  authMiddleware,
  authorizePermissions("PROJECT_MEMBER_ADDED"),
  addProjectMemberValidator,
  validate,
  ProjectController.addMember,
);

router.delete(
  "/:projectId/members/:userId",
  authMiddleware,
  authorizePermissions("remove_PROJECT_MEMBER_REMOVED"),
  ProjectController.deleteMemeber,
);
export default router;
