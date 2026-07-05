import TeamService from "../services/team.service.js";
import AuditService from "../services/audit.service.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, formatPagination } from "../utils/pagination.js";
import { successResponse } from "../utils/response.js";
import { getSocketIO } from "../socket/socket.js";

class TeamController {
  createTeam = asyncHandler(async (req, res) => {
    const { department_id, name, description, lead_id } = req.body;

    const newTeam = await TeamService.createTeam({
      department_id,
      name,
      description,
      lead_id,
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.CREATE_TEAM,
        entity_type: "team",
        entity_id: newTeam.id,
        ip_address: req.clientIp,
        details: {
          team_id: newTeam.id,
          name: newTeam.name,
          department_id: newTeam.department_id,
          summary: `Team "${newTeam.name}" created`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for createTeam:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("team_activity", { action: "CREATE", team: newTeam });
    }

    return successResponse(res, "Team created successfully", newTeam, 201);
  });

  getTeamDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const team = await TeamService.getTeamDetails(id);
    return successResponse(res, "Team details fetched successfully", team, 200);
  });

  updateTeam = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { department_id, name, description, lead_id } = req.body;

    const updatedTeam = await TeamService.updateTeam(id, {
      department_id,
      name,
      description,
      lead_id,
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.UPDATE_TEAM,
        entity_type: "team",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          team_id: id,
          name: updatedTeam.name,
          department_id: updatedTeam.department_id,
          summary: `Team "${updatedTeam.name}" updated`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for updateTeam:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("team_activity", { action: "UPDATE", team: updatedTeam });
    }

    return successResponse(res, "Team updated successfully", updatedTeam, 200);
  });

  deleteTeam = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const team = await TeamService.getTeamDetails(id);
    await TeamService.deleteTeam(id);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.DELETE_TEAM,
        entity_type: "team",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          team_id: id,
          name: team.name,
          summary: `Team "${team.name}" deleted`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for deleteTeam:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("team_activity", { action: "DELETE", team_id: id });
    }

    return successResponse(res, "Team deleted successfully", null, 200);
  });

  getMyTeams = asyncHandler(async (req, res) => {
    const teams = await TeamService.getMyTeams(req.user.id);
    return successResponse(res, "My teams fetched successfully", teams, 200);
  });

  listTeams = asyncHandler(async (req, res) => {
    const { page, offset, limit } = getPagination(req.query);
    const departmentId = req.query.departmentId;

    const { rows, total } = await TeamService.getTeamList({ limit, offset, departmentId });

    const payload = formatPagination({
      data: rows,
      total,
      page,
      limit,
    });

    return successResponse(res, "Teams list fetched successfully", payload, 200);
  });

  addTeamMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const members = await TeamService.addTeamMember(id, userId);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.TEAM_MEMBER_ADDED,
        entity_type: "team",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          team_id: id,
          added_user_id: userId,
          summary: `Member added to team`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for addTeamMember:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("team_members_updated", { team_id: id, action: "ADD", user_id: userId });
    }

    return successResponse(res, "Team member added successfully", members, 200);
  });

  removeTeamMember = asyncHandler(async (req, res) => {
    const { id, userId } = req.params;

    const members = await TeamService.removeTeamMember(id, userId);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.TEAM_MEMBER_REMOVED,
        entity_type: "team",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          team_id: id,
          removed_user_id: userId,
          summary: `Member removed from team`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for removeTeamMember:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("team_members_updated", { team_id: id, action: "REMOVE", user_id: userId });
    }

    return successResponse(res, "Team member removed successfully", members, 200);
  });

  getTeamMembers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const members = await TeamService.getTeamMembers(id);
    return successResponse(res, "Team members fetched successfully", members, 200);
  });

  assignTeamToProject = asyncHandler(async (req, res) => {
    const { projectId, teamId } = req.body;

    const teams = await TeamService.assignTeamToProject(projectId, teamId);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.UPDATE_PROJECT,
        entity_type: "project",
        entity_id: projectId,
        ip_address: req.clientIp,
        details: {
          project_id: projectId,
          assigned_team_id: teamId,
          summary: `Team assigned to project`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for assignTeamToProject:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("project_activity_updated", { project_id: projectId });
    }

    return successResponse(res, "Team assigned to project successfully", teams, 200);
  });

  removeTeamFromProject = asyncHandler(async (req, res) => {
    const { projectId, teamId } = req.params;

    const teams = await TeamService.removeTeamFromProject(projectId, teamId);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.UPDATE_PROJECT,
        entity_type: "project",
        entity_id: projectId,
        ip_address: req.clientIp,
        details: {
          project_id: projectId,
          removed_team_id: teamId,
          summary: `Team removed from project`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for removeTeamFromProject:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("project_activity_updated", { project_id: projectId });
    }

    return successResponse(res, "Team removed from project successfully", teams, 200);
  });

  getProjectTeams = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const teams = await TeamService.getProjectTeams(projectId);
    return successResponse(res, "Project teams fetched successfully", teams, 200);
  });
}

export default new TeamController();
