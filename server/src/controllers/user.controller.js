import UserService from "../services/user.service.js";
import AuditService from "../services/audit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getPagination } from "../utils/pagination.js";

class UserController {
  getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const {
      departmentId,
      roleId,
      teamId,
      status,
      managerId,
      employeeId,
      attendanceStatus,
      name,
    } = req.query;

    const result = await UserService.getAllUsers({
      page,
      limit,
      offset,
      filters: {
        departmentId,
        roleId,
        teamId,
        status,
        managerId,
        employeeId,
        attendanceStatus,
        name,
      },
      requestingUser: req.user,
    });

    return successResponse(res, "Employees fetched successfully", result, 200);
  });

  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    return successResponse(res, "Employee details fetched successfully", user, 200);
  });

  getAllRoles = asyncHandler(async (req, res) => {
    const roles = await UserService.getAllRoles();
    return successResponse(res, "System roles fetched successfully", roles, 200);
  });

  getTodayBirthdays = asyncHandler(async (req, res) => {
    const birthdays = await UserService.getTodayBirthdays({
      requestingUser: req.user,
    });
    return successResponse(res, "Today's birthdays fetched successfully", birthdays, 200);
  });

  createUser = asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      employeeId,
      departmentId,
      roleId,
      teamId,
      managerId,
      status,
      password,
      dob,
    } = req.body;

    let profilePicUrl = null;
    if (req.file) {
      profilePicUrl = req.file.path;
    }

    const newUser = await UserService.createUser({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      employee_id: employeeId,
      department_id: departmentId,
      role_id: roleId,
      team_id: teamId,
      reporting_manager_id: managerId,
      status: status || "active",
      password,
      dob: dob || null,
      avatar: profilePicUrl,
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: "USER_CREATE",
        entity_type: "user",
        entity_id: newUser.id,
        ip_address: req.clientIp,
        details: {
          user_id: newUser.id,
          user_email: email,
          user_name: newUser.name,
          employee_id: employeeId,
          summary: `Employee created: ${newUser.name} (${email}) - ${employeeId}`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for user creation:", error.message);
    }

    return successResponse(res, "Employee record created successfully", newUser, 201);
  });

  updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      employeeId,
      departmentId,
      roleId,
      teamId,
      managerId,
      status,
      dob,
    } = req.body;

    let profilePicUrl = null;
    if (req.file) {
      profilePicUrl = req.file.path;
    }

    const updatedUser = await UserService.updateUser(id, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      employee_id: employeeId,
      department_id: departmentId,
      role_id: roleId,
      team_id: teamId,
      reporting_manager_id: managerId,
      status,
      dob: dob !== undefined ? (dob || null) : undefined,
      avatar: profilePicUrl,
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: "USER_UPDATE",
        entity_type: "user",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          user_id: id,
          user_name: updatedUser.name,
          summary: `Employee updated: ${updatedUser.name} (${email})`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for user update:", error.message);
    }

    return successResponse(res, "Employee record updated successfully", updatedUser, 200);
  });

  deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await UserService.deleteUser(id);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: "USER_DELETE",
        entity_type: "user",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          user_id: id,
          summary: `Employee deleted permanently`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for user deletion:", error.message);
    }

    return successResponse(res, "Employee record deleted successfully", result, 200);
  });
}

export default new UserController();
