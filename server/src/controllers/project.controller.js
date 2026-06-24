import ProjectServices from "../services/project.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AuditService from "../services/audit.service.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import ProjectModel from "../models/project.model.js";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import NotificationService from "../services/notification.service.js";
import { getPagination } from "../utils/pagination.js";
import { getSocketIO } from "../socket/socket.js";


const buildChanges = (before, after, fields) => {
  return fields.reduce((changes, field) => {
    const beforeValue = before?.[field] ?? null;
    const afterValue = after?.[field] ?? null;

    if (String(beforeValue) !== String(afterValue)) {
      changes[field] = {
        from: beforeValue,
        to: afterValue,
      };
    }

    return changes;
  }, {});
};

class ProjectController {
  createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const createdBy = req.user.id;

    const newProject = await ProjectServices.createProject({
      name,
      description,
      createdBy,
    });

    try {
      await AuditService.log({
        user_id: createdBy,
        action: AUDIT_ACTIONS.CREATE_PROJECT,
        entity_type: "project",
        entity_id: newProject.id,
        ip_address: req.clientIp,
        details: {
          project_id: newProject.id,
          project_name: newProject.name,
        },
      });
    } catch (err) {
      console.error("Audit log failed for create project:", err.message);
    }

    return successResponse(
      res,
      "Project created successfully",
      newProject,
      201,
    );
  });

  getProjectRoles = asyncHandler(async (req, res) => {
    const roles = await ProjectServices.getProjectRoles();
    return successResponse(res, "Project roles fetched successfully", roles, 200);
  });

  allProjects = asyncHandler(async (req, res) => {
    const { limit, offset, page } = getPagination(req.query);

    let projects = [];
    if (req.user.role === "super_admin" || "admin") {
      projects = await ProjectServices.allProjects({ limit, offset, page });
    } else {
      projects = await ProjectServices.getUserProjects(req.user.id, { limit, offset, page });
    }

    return successResponse(res, "Projects fetched successfully", projects, 200);
  });

  individualProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const specificProject = await ProjectServices.individualProject({ userId, id });
    return successResponse(
      res,
      "Project fetched successfully",
      specificProject,
      200,
    );
  });

  updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const existingProject = await ProjectModel.getProjectById(id);

    const updatedProject = await ProjectServices.updateProject({
      projectId: id,
      name,
      description,
      status,
    });

    const requestedFields = Object.entries({
      name,
      description,
      status,
    })
      .filter(([, value]) => value !== undefined)
      .map(([field]) => field);

    const changes = buildChanges(existingProject, updatedProject, requestedFields);
    const changedFields = Object.keys(changes);

    const members = await ProjectModel.getProjectMembersIds(id);

    try {
      await NotificationService.send({
        userIds: members.map((member) => member.user_id),
        title: "Project Updated",
        message: `Project "${updatedProject.name}" was updated`,
        type: NOTIFICATION_TYPES.PROJECT_UPDATED,
        entity_type: "project",
        entity_id: updatedProject.id,
      });
    } catch (error) {
      console.error("Notification failed for project update:", error.message);
    }

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.UPDATE_PROJECT,
        entity_type: "project",
        entity_id: updatedProject.id,
        ip_address: req.clientIp,
        details: {
          project_id: updatedProject.id,
          project_name: updatedProject.name,
          summary: changedFields.length
            ? `Project "${updatedProject.name}" updated: ${changedFields.join(", ")}`
            : `Project "${updatedProject.name}" update requested, but no values changed`,
          changed_fields: changedFields,
          changes,
        },
      });
    } catch (err) {
      console.error("Audit log failed updateProject:", err.message);
    }

    return successResponse(
      res,
      "Project updated successfully",
      updatedProject,
      200,
    );
  });

  deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existingProject = await ProjectModel.getProjectById(id);

    await ProjectServices.deleteProject(id);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.DELETE_PROJECT,
        entity_type: "project",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          project_id: id,
          project_name: existingProject?.name,
          deleted_project: {
            id: existingProject?.id || Number(id),
            name: existingProject?.name,
            description: existingProject?.description,
            status: existingProject?.status,
          },
          summary: `Project "${existingProject?.name || id}" was deleted`,
        },
      });
    } catch (err) {
      console.error("Audit log failed updateProject:", err.message);
    }

    return successResponse(res, "Project deleted successfully", null, 200);
  });

  addMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId, roleId } = req.body;
    // console.log(roleId)

    const userIds = Array.isArray(userId) ? userId : [userId];
    const roleIds = Array.isArray(roleId) ? roleId : [roleId];

    const member = await ProjectServices.addMember({
      projectId: id,
      userIds,
      roleIds,
    });

    try {
      await NotificationService.send({
        userIds: member.addedMembers.map((member) => member.userId),
        title: "Added To Project",
        message: `You were added to project`,
        type: "PROJECT_MEMBER_ADDED",
        entity_type: "project",
        entity_id: id,
      });
    } catch (error) {
      console.error("Notification failed for add members:", error.message);
    }

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.PROJECT_MEMBER_ADDED,
        entity_type: "project",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          projectId: id,
          added_users_ids: member.addedMembers,
          skipped_members: member.skippedMembers,
          summary: `${member.addedMembers.length} member(s) added to project`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for add member:", error.message);
    }

    // Emit socket events for real-time updates
    const io = getSocketIO();
    if (io) {
      io.emit("member_added", {
        project_id: id,
        action: "PROJECT_MEMBER_ADDED",
        added_members: member.addedMembers,
      });
      io.emit("project_activity_updated", { project_id: id });
    }

    return successResponse(res, "Member added successfully", member, 201);
  });

  getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const members = await ProjectServices.getProjectMembers(projectId);

    return successResponse(
      res,
      "Project members fetched successfully",
      members,
      200,
    );
  });

  deleteMemeber = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;

    await ProjectServices.deleteMember({
      projectId,
      userId,
      currentUserId: req.user.id,
      currentUserRole: req.user.role,
    });

    await NotificationService.send({
      userIds: [Number(userId)],
      title: "Removed From Project",
      message: `You were removed from project`,
      type: "PROJECT_MEMBER_REMOVED_REMOVED",
      entity_type: "project",
      entity_id: projectId,
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.PROJECT_MEMBER_REMOVED,
        entity_type: "project",
        entity_id: projectId,
        ip_address: req.clientIp,
        details: {
          projectId,
          removed_user_id: userId,
          summary: `Member removed from project`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for delete member:", error.message);
    }

    // Emit socket events for real-time updates
    const io = getSocketIO();
    if (io) {
      io.emit("member_removed", {
        project_id: projectId,
        action: "PROJECT_MEMBER_REMOVED",
        removed_member: userId,
      });
      io.emit("project_activity_updated", { project_id: projectId });
    }

    return successResponse(res, "Member removed successfully", null, 200);
  });
}

export default new ProjectController();
