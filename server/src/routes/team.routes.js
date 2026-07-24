import { Router } from "express";
import TeamController from "../controllers/team.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validate } from "../middlewares/validate.js";
import {
  createTeamValidator,
  updateTeamValidator,
  addTeamMemberValidator,
  assignTeamToProjectValidator,
} from "../validators/team.validator.js";
import {
  teamAccessMiddleware,
  teamManageMiddleware,
} from "../middlewares/teamAccess.middleware.js";
import { cacheResponse, invalidateCacheAfter } from "../middlewares/cache.middleware.js";

const router = Router();

router.use(authMiddleware);

// Create team: accessible to Admins/Super Admins or Department Heads
router.post(
  "/create",
  authorizeRoles("super_admin", "admin", "dept_head"),
  createTeamValidator,
  validate,
  invalidateCacheAfter(["teams", "users", "projects", "dashboard"]),
  TeamController.createTeam
);

// Update team details: checks if user has access to team and has write permissions
router.patch(
  "/:id",
  teamAccessMiddleware,
  teamManageMiddleware,
  updateTeamValidator,
  validate,
  invalidateCacheAfter(["teams", "users", "projects", "dashboard"]),
  TeamController.updateTeam
);

// Delete team: checks team access and permissions
router.delete(
  "/delete/:id",
  teamAccessMiddleware,
  teamManageMiddleware,
  invalidateCacheAfter(["teams", "users", "projects", "dashboard"]),
  TeamController.deleteTeam
);

// List teams
router.get(
  "/",
  cacheResponse({ resource: "teams-list", ttl: 120, scope: "tenant", versionResources: ["teams"] }),
  TeamController.listTeams
);

// Get my teams (must be before /:id)
router.get(
  "/my-teams",
  cacheResponse({ resource: "my-teams", ttl: 30, versionResources: ["teams", "users"] }),
  TeamController.getMyTeams
);

// Get team details
router.get(
  "/:id",
  teamAccessMiddleware,
  cacheResponse({ resource: (req) => `team-${req.params.id}`, ttl: 60, versionResources: ["teams", "users", "departments"], includeQuery: false }),
  TeamController.getTeamDetails
);

// Team members operations
router.post(
  "/:id/members",
  teamAccessMiddleware,
  teamManageMiddleware,
  addTeamMemberValidator,
  validate,
  invalidateCacheAfter(["teams", "users", "projects", "dashboard"]),
  TeamController.addTeamMember
);

router.delete(
  "/:id/members/:userId",
  teamAccessMiddleware,
  teamManageMiddleware,
  invalidateCacheAfter(["teams", "users", "projects", "dashboard"]),
  TeamController.removeTeamMember
);

router.get(
  "/:id/members",
  teamAccessMiddleware,
  cacheResponse({ resource: (req) => `team-${req.params.id}-members`, ttl: 30, versionResources: ["teams", "users"], includeQuery: false }),
  TeamController.getTeamMembers
);

// Team-Project assignment routing
router.post(
  "/assign-project",
  authorizeRoles("super_admin", "admin", "dept_head", "project_manager"),
  assignTeamToProjectValidator,
  validate,
  invalidateCacheAfter(["teams", "projects", "tasks", "users", "dashboard"]),
  TeamController.assignTeamToProject
);

router.delete(
  "/project/:projectId/team/:teamId",
  authorizeRoles("super_admin", "admin", "dept_head", "project_manager"),
  invalidateCacheAfter(["teams", "projects", "tasks", "users", "dashboard"]),
  TeamController.removeTeamFromProject
);

router.get(
  "/project/:projectId",
  cacheResponse({ resource: (req) => `project-${req.params.projectId}-teams`, ttl: 30, versionResources: ["teams", "projects", "users"], includeQuery: false }),
  TeamController.getProjectTeams
);

export default router;
