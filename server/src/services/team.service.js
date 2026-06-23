import TeamModel from "../models/team.model.js";
import DepartmentModel from "../models/department.model.js";
import AuthModel from "../models/auth.model.js";
import { ConflictError, NotFoundError, BadRequestError } from "../utils/errorHandler.js";

class TeamService {
  async createTeam({ department_id, name, description, lead_id }) {
    // Verify department exists
    const dept = await DepartmentModel.getById(department_id);
    if (!dept) {
      throw new NotFoundError("Department not found");
    }

    // Verify name is unique within department
    const existing = await TeamModel.getByNameAndDepartment(name, department_id);
    if (existing) {
      throw new ConflictError(`Team with name "${name}" already exists in this department`);
    }

    // Verify lead_id if provided
    if (lead_id) {
      const lead = await AuthModel.getUserById(lead_id);
      if (!lead) {
        throw new NotFoundError("Assigned team lead user not found");
      }
    }

    const result = await TeamModel.create({ department_id, name, description, lead_id });
    const newTeam = await TeamModel.getById(result.insertId);

    // If a lead is specified, automatically add them as a team member
    if (lead_id) {
      await TeamModel.addMember(newTeam.id, lead_id);
    }

    return newTeam;
  }

  async getTeamDetails(id) {
    const team = await TeamModel.getById(id);
    if (!team) {
      throw new NotFoundError("Team not found");
    }
    return team;
  }

  async updateTeam(id, { department_id, name, description, lead_id }) {
    const team = await TeamModel.getById(id);
    if (!team) {
      throw new NotFoundError("Team not found");
    }

    const targetDeptId = department_id || team.department_id;
    const targetName = name || team.name;

    // Verify department exists if changed
    if (department_id && department_id !== team.department_id) {
      const dept = await DepartmentModel.getById(department_id);
      if (!dept) {
        throw new NotFoundError("Department not found");
      }
    }

    // Check unique name in department
    if (name || department_id) {
      const existing = await TeamModel.getByNameAndDepartment(targetName, targetDeptId);
      if (existing && existing.id !== team.id) {
        throw new ConflictError(`Team with name "${targetName}" already exists in this department`);
      }
    }

    // Verify lead_id if provided
    let finalLeadId = lead_id !== undefined ? lead_id : team.lead_id;
    if (lead_id) {
      const lead = await AuthModel.getUserById(lead_id);
      if (!lead) {
        throw new NotFoundError("Assigned team lead user not found");
      }
      // Add lead as member
      await TeamModel.addMember(id, lead_id);
    }

    await TeamModel.update(id, {
      department_id: targetDeptId,
      name: targetName,
      description: description !== undefined ? description : team.description,
      lead_id: finalLeadId,
    });

    return await TeamModel.getById(id);
  }

  async deleteTeam(id) {
    const team = await TeamModel.getById(id);
    if (!team) {
      throw new NotFoundError("Team not found");
    }
    return await TeamModel.delete(id);
  }

  async getTeamList({ limit, offset, departmentId }) {
    const rows = await TeamModel.getAll({ limit, offset, departmentId });
    const total = await TeamModel.count(departmentId);
    return { rows, total };
  }

  async addTeamMember(teamId, userId) {
    const team = await TeamModel.getById(teamId);
    if (!team) {
      throw new NotFoundError("Team not found");
    }

    const user = await AuthModel.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if user belongs to the same department as the team
    // For corporate portals, team members should generally be in the same department
    if (user.department_id && Number(user.department_id) !== Number(team.department_id)) {
      throw new BadRequestError("User belongs to a different department");
    }

    await TeamModel.addMember(teamId, userId);
    return await TeamModel.getMembers(teamId);
  }

  async removeTeamMember(teamId, userId) {
    const team = await TeamModel.getById(teamId);
    if (!team) {
      throw new NotFoundError("Team not found");
    }

    await TeamModel.removeMember(teamId, userId);
    return await TeamModel.getMembers(teamId);
  }

  async getTeamMembers(teamId) {
    const team = await TeamModel.getById(teamId);
    if (!team) {
      throw new NotFoundError("Team not found");
    }
    return await TeamModel.getMembers(teamId);
  }

  async assignTeamToProject(projectId, teamId) {
    const team = await TeamModel.getById(teamId);
    if (!team) {
      throw new NotFoundError("Team not found");
    }
    await TeamModel.assignTeamToProject(projectId, teamId);
    return await TeamModel.getProjectTeams(projectId);
  }

  async removeTeamFromProject(projectId, teamId) {
    await TeamModel.removeTeamFromProject(projectId, teamId);
    return await TeamModel.getProjectTeams(projectId);
  }

  async getProjectTeams(projectId) {
    return await TeamModel.getProjectTeams(projectId);
  }
}

export default new TeamService();
