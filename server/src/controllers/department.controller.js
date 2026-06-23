import DepartmentService from "../services/department.service.js";
import AuditService from "../services/audit.service.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, formatPagination } from "../utils/pagination.js";
import { successResponse } from "../utils/response.js";
import { getSocketIO } from "../socket/socket.js";

class DepartmentController {
  createDepartment = asyncHandler(async (req, res) => {
    const { name, description, status } = req.body;

    const newDept = await DepartmentService.createDepartment({
      name,
      description,
      status,
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.CREATE_DEPARTMENT,
        entity_type: "department",
        entity_id: newDept.id,
        ip_address: req.clientIp,
        details: {
          department_id: newDept.id,
          name: newDept.name,
          summary: `Department "${newDept.name}" created`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for createDepartment:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("department_activity", { action: "CREATE", department: newDept });
    }

    return successResponse(res, "Department created successfully", newDept, 201);
  });

  getDepartmentDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dept = await DepartmentService.getDepartmentDetails(id);
    return successResponse(res, "Department details fetched successfully", dept, 200);
  });

  updateDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const updatedDept = await DepartmentService.updateDepartment(id, {
      name,
      description,
      status,
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.UPDATE_DEPARTMENT,
        entity_type: "department",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          department_id: id,
          name: updatedDept.name,
          summary: `Department "${updatedDept.name}" details updated`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for updateDepartment:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("department_activity", { action: "UPDATE", department: updatedDept });
    }

    return successResponse(res, "Department updated successfully", updatedDept, 200);
  });

  deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const dept = await DepartmentService.getDepartmentDetails(id);
    await DepartmentService.deleteDepartment(id);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.DELETE_DEPARTMENT,
        entity_type: "department",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          department_id: id,
          name: dept.name,
          summary: `Department "${dept.name}" deleted`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for deleteDepartment:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("department_activity", { action: "DELETE", department_id: id });
    }

    return successResponse(res, "Department deleted successfully", null, 200);
  });

  listDepartments = asyncHandler(async (req, res) => {
    const { page, offset, limit } = getPagination(req.query);
    const { rows, total } = await DepartmentService.getDepartmentList({ limit, offset });

    const payload = formatPagination({
      data: rows,
      total,
      page,
      limit,
    });

    return successResponse(res, "Departments list fetched successfully", payload, 200);
  });

  getDepartmentUsers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const users = await DepartmentService.getDepartmentUsers(id);
    return successResponse(res, "Department employees fetched successfully", users, 200);
  });

  getDepartmentStats = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const stats = await DepartmentService.getDepartmentStats(id);
    return successResponse(res, "Department stats fetched successfully", stats, 200);
  });
}

export default new DepartmentController();
