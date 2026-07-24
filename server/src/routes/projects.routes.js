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
import { cacheResponse, invalidateCacheAfter } from "../middlewares/cache.middleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  cacheResponse({ resource: "projects-list", ttl: 30, versionResources: ["projects", "tasks", "users", "departments"] }),
  ProjectController.allProjects,
);

router.get(
  "/roles",
  authMiddleware,
  cacheResponse({ resource: "project-roles", ttl: 1800, scope: "tenant", includeQuery: false }),
  ProjectController.getProjectRoles,
);

router.get(
  "/details/:id",
  authMiddleware,
  cacheResponse({ resource: (req) => `project-${req.params.id}`, ttl: 60, versionResources: ["projects", "tasks", "users", "departments"], includeQuery: false }),
  ProjectController.individualProject,
);

router.post(
  "/create",
  authMiddleware,
  authorizePermissions("create_project"),
  createProjectValidator,
  validate,
  invalidateCacheAfter(["projects", "tasks", "departments", "dashboard"]),
  ProjectController.createProject,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizePermissions("update_project"),
  updateProjectValidator,
  validate,
  invalidateCacheAfter(["projects", "tasks", "departments", "dashboard"]),
  ProjectController.updateProject,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  authorizePermissions("delete_project"),
  invalidateCacheAfter(["projects", "tasks", "departments", "dashboard"]),
  ProjectController.deleteProject,
);

router.get(
  "/:projectId/members",
  authMiddleware,
  projectAccessMiddleware,
  cacheResponse({ resource: (req) => `project-${req.params.projectId}-members`, ttl: 30, versionResources: ["projects", "users"], includeQuery: false }),
  ProjectController.getProjectMembers,
);

// assigning projects to members
router.post(
  "/:id/members",
  authMiddleware,
  authorizePermissions("PROJECT_MEMBER_ADDED"),
  addProjectMemberValidator,
  validate,
  invalidateCacheAfter(["projects", "tasks", "users", "dashboard"]),
  ProjectController.addMember,
);

router.delete(
  "/:projectId/members/:userId",
  authMiddleware,
  authorizePermissions("remove_PROJECT_MEMBER_REMOVED"),
  invalidateCacheAfter(["projects", "tasks", "users", "dashboard"]),
  ProjectController.deleteMemeber,
);
export default router;
