import UserModel from "../models/user.model.js";
import ProjectModel from "../models/project.model.js";
import TaskModel from "../models/task.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { formatPagination } from "../utils/pagination.js";

class UserService {
  async getAllUsers({ page, limit, offset, filters, requestingUser }) {
    // if (requestingUser && requestingUser.id && (requestingUser.department_id === undefined || requestingUser.team_id === undefined)) {
    //   const dbUser = await UserModel.getUserById(requestingUser.id);
    //   if (dbUser) {
    //     requestingUser.department_id = dbUser.department_id;
    //     requestingUser.team_id = dbUser.team_id;
    //     requestingUser.reporting_manager_id = dbUser.reporting_manager_id;
    //   }
    // }

    const { rows, total } = await UserModel.getAllUsers({
      limit,
      offset,
      filters,
      requestingUser,
    });

    return formatPagination({
      data: rows,
      total,
      page,
      limit,
    });
  }

  async getUserById(id) {
    const user = await UserModel.getUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const [projects, tasks] = await Promise.all([
      ProjectModel.getUserProjects(id, { limit: 50, offset: 0 }).catch(() => []),
      TaskModel.getMyTasks(id).catch(() => []),
    ]);
    return {
      ...user,
      projects: projects || [],
      tasks: tasks || [],
    };
  }

  async getAllRoles() {
    return await UserModel.getAllRoles();
  }

  async getTodayBirthdays({ requestingUser }) {
    return await UserModel.getTodayBirthdays({ requestingUser });
  }

  async validateUserRelations({ department_id, role_id, team_id, reporting_manager_id }) {
    // 1. Department must exist
    const dept = await UserModel.getDepartmentById(department_id);
    if (!dept) {
      throw new NotFoundError("Selected department does not exist");
    }

    // 2. Role must exist
    const role = await UserModel.getRoleById(role_id);
    if (!role) {
      throw new NotFoundError("Selected role does not exist");
    }

    // 3. Team must belong to selected Department (if team is provided)
    if (team_id) {
      const team = await UserModel.getTeamById(team_id);
      if (!team) {
        throw new NotFoundError("Selected team does not exist");
      }
      if (team.department_id !== Number(department_id)) {
        throw new BadRequestError(`Selected team does not belong to the ${dept.name} department`);
      }
    }

    // 4. Manager must belong to same Department (unless explicitly allowed, e.g. Admin or Super Admin)
    if (reporting_manager_id) {
      const manager = await UserModel.getUserById(reporting_manager_id);
      if (!manager) {
        throw new NotFoundError("Selected reporting manager does not exist");
      }
      const managerRoleId = Number(manager.role_id);
      const isGlobalManager = managerRoleId === 1 || managerRoleId === 5; // Admin / Super Admin
      if (!isGlobalManager && manager.department_id !== Number(department_id)) {
        throw new BadRequestError(
          `Selected reporting manager belongs to the ${manager.department_name} department. Must belong to the same department (${dept.name}) unless they are an Administrator.`
        );
      }
    }
  }

  async createUser(data) {
    const existingEmail = await UserModel.getUserByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError("Email address is already in use");
    }

    const existingEmpId = await UserModel.getUserByEmployeeId(data.employee_id);
    if (existingEmpId) {
      throw new ConflictError("Employee ID is already in use");
    }

    await this.validateUserRelations({
      department_id: data.department_id,
      role_id: data.role_id,
      team_id: data.team_id,
      reporting_manager_id: data.reporting_manager_id,
    });

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const fullName = `${data.first_name} ${data.last_name}`.trim();

    const result = await UserModel.createUser({
      ...data,
      name: fullName,
      password: hashedPassword,
    });

    return await UserModel.getUserById(result.insertId);
  }

  async updateUser(id, data) {
    const user = await UserModel.getUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await UserModel.getUserByEmail(data.email);
      if (existingEmail) {
        throw new ConflictError("Email address is already in use");
      }
    }

    if (data.employee_id && data.employee_id !== user.employee_id) {
      const existingEmpId = await UserModel.getUserByEmployeeId(data.employee_id);
      if (existingEmpId) {
        throw new ConflictError("Employee ID is already in use");
      }
    }

    await this.validateUserRelations({
      department_id: data.department_id,
      role_id: data.role_id,
      team_id: data.team_id,
      reporting_manager_id: data.reporting_manager_id,
    });

    const fullName = `${data.first_name} ${data.last_name}`.trim();

    await UserModel.updateUser(id, {
      ...data,
      name: fullName,
    });

    return await UserModel.getUserById(id);
  }

  async deleteUser(id) {
    const user = await UserModel.getUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await UserModel.deleteUser(id);
    return { id };
  }
}

export default new UserService();
