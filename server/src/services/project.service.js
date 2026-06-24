import AuthModel from "../models/auth.model.js";
import ProjectModel from "../models/project.model.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errorHandler.js";

class ProjectServices {
  async createProject({ name, description, createdBy }) {
    const result = await ProjectModel.createProject({
      name,
      description,
      createdBy,
    });

    const project = await ProjectModel.getProjectById(result.insertId);

    return project;
  }

  async getProjectRoles() {
    return await ProjectModel.getAllProjectRoles();
  }

  async allProjects({ limit, offset, page = 1 }) {
    const result = await ProjectModel.getAllProjects({ limit, offset });
    const total = await ProjectModel.getTotalProjectsCount();

    return {
      data: result || [],
      total,
      page,
      limit,
    };
  }

  async getUserProjects(userId, { limit, offset, page = 1 }) {
    const result = await ProjectModel.getUserProjects(userId, { limit, offset });
    const total = await ProjectModel.getTotalUserProjectsCount(userId);

    return {
      data: result || [],
      total,
      page,
      limit,
    };
  }

  async individualProject({ userId, id }) {
    const result = await ProjectModel.getIndividualProjectById({
      userId,
      projectId: id,
    });

    if (!result || result.length === 0) {
      throw new NotFoundError("Project not found");
    }

    return result;
  }

  async updateProject({ projectId, name, description, status }) {
    const existingProject = await ProjectModel.getProjectById(projectId);

    if (!existingProject) {
      throw new NotFoundError("Project not found");
    }

    const result = await ProjectModel.updateProject({
      projectId,
      name,
      description,
      status,
    });

    const updatedProject = await ProjectModel.getProjectById(projectId);
    return updatedProject;
  }

  async deleteProject(projectId) {
    const existingProject = await ProjectModel.getProjectById(projectId);

    if (!existingProject) {
      throw new NotFoundError("Project not found");
    }

    await ProjectModel.deleteProject(projectId);

    return true;
  }

  async addMember({ projectId, userIds, roleIds }) {
    if (userIds.length !== roleIds.length) {
      throw new BadRequestError("Users and roles count mismatch");
    }

    const existingUsers = await AuthModel.getExistingUsers(userIds);
    const existingUserIds = existingUsers.map((user) => user.id);

    const invalidUserIds = userIds.filter(
      (id) => !existingUserIds.includes(id),
    );

    const addedMembers = [];
    const skippedMembers = [];

    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const roleId = roleIds[i];

      if (invalidUserIds.includes(userId)) {
        continue;
      }

      const existingMember = await ProjectModel.getProjectMember(
        projectId,
        userId,
      );

      if (existingMember && existingMember.isMember) {
        skippedMembers.push(userId);
        continue;
      }

      await ProjectModel.addMember({
        projectId,
        userId,
        roleId,
      });

      addedMembers.push({
        userId,
        roleId,
      });
    }

    return {
      addedMembers,
      skippedMembers,
      invalidUserIds,
    };
  }

  async getProjectMembers(projectId) {
    const project = await ProjectModel.getProjectById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return await ProjectModel.getProjectMembers(projectId);
  }

  async deleteMember({ projectId, userId, currentUserId, currentUserRole }) {
    const project = await ProjectModel.getProjectById(projectId);
    if (!project) {
      throw new NotFoundError("Project Not Found");
    }

    const member = await ProjectModel.getProjectMember(projectId, userId);

    if (!member || !member.isMember) {
      throw new NotFoundError("Member does not exists in project");
    }

    // prevent self removal
    if (Number(currentUserId) === Number(userId)) {
      throw new BadRequestError("You cann't remove yourself");
    }

    // prevent removing the project creator
    if (Number(project.created_by) === Number(userId)) {
      throw new ForbiddenError("Project creator cann't be removed");
    }

    await ProjectModel.deleteMember(projectId, userId);
    return true;
  }

  async getMemberRole(projectId, userId) {
    const query = `
  
    SELECT
      pm.user_id,
      pm.project_id,

      r.id AS role_id,
      r.name AS role

    FROM project_members pm

    JOIN roles r
    ON r.id = pm.role_id

    WHERE pm.project_id = ?
    AND pm.user_id = ?

    LIMIT 1
  `;

    const result = await executeQuery(query, [projectId, userId]);

    return result[0];
  }
}

export default new ProjectServices();
