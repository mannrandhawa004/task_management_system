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

const router = Router();

router.use(authMiddleware);

// Create team: accessible to Admins/Super Admins or Department Heads
router.post(
  "/create",
  authorizeRoles("super_admin", "admin", "dept_head"),
  createTeamValidator,
  validate,
  TeamController.createTeam
);

// Update team details: checks if user has access to team and has write permissions
router.patch(
  "/:id",
  teamAccessMiddleware,
  teamManageMiddleware,
  updateTeamValidator,
  validate,
  TeamController.updateTeam
);

// Delete team: checks team access and permissions
router.delete(
  "/delete/:id",
  teamAccessMiddleware,
  teamManageMiddleware,
  TeamController.deleteTeam
);

// List teams
router.get(
  "/",
  TeamController.listTeams
);

// Get my teams (must be before /:id)
router.get(
  "/my-teams",
  TeamController.getMyTeams
);

// Get team details
router.get(
  "/:id",
  teamAccessMiddleware,
  TeamController.getTeamDetails
);

// Team members operations
router.post(
  "/:id/members",
  teamAccessMiddleware,
  teamManageMiddleware,
  addTeamMemberValidator,
  validate,
  TeamController.addTeamMember
);

router.delete(
  "/:id/members/:userId",
  teamAccessMiddleware,
  teamManageMiddleware,
  TeamController.removeTeamMember
);

router.get(
  "/:id/members",
  teamAccessMiddleware,
  TeamController.getTeamMembers
);

// Team-Project assignment routing
router.post(
  "/assign-project",
  authorizeRoles("super_admin", "admin", "dept_head", "project_manager"),
  assignTeamToProjectValidator,
  validate,
  TeamController.assignTeamToProject
);

router.delete(
  "/project/:projectId/team/:teamId",
  authorizeRoles("super_admin", "admin", "dept_head", "project_manager"),
  TeamController.removeTeamFromProject
);

router.get(
  "/project/:projectId",
  TeamController.getProjectTeams
);

export default router;
