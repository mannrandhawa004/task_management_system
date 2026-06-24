import LeaveService from "../services/leave.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import AuditService from "../services/audit.service.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

class LeaveController {
  applyLeave = asyncHandler(async (req, res) => {
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user.id;

    const leave = await LeaveService.applyLeave({ userId, type, startDate, endDate, reason });

    try {
      await AuditService.log({
        user_id: userId,
        action: AUDIT_ACTIONS.CREATE_PROJECT, // Repurposing or ideally add CREATE_LEAVE
        entity_type: "leave",
        entity_id: leave.id,
        ip_address: req.clientIp,
        details: { type, startDate, endDate },
      });
    } catch (e) {}

    return successResponse(res, "Leave applied successfully", leave, 201);
  });

  getMyLeaves = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const leaves = await LeaveService.getMyLeaves(userId);
    return successResponse(res, "My leaves fetched", leaves, 200);
  });

  getColleaguesOnLeave = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    let departmentId = req.user.department_id;

    // If departmentId is missing from JWT, fetch it from DB
    if (!departmentId) {
       const { executeQuery } = await import('../utils/dbQuery.js');
       const rows = await executeQuery('SELECT department_id FROM users WHERE id = ?', [userId]);
       if (rows && rows.length > 0) {
          departmentId = rows[0].department_id;
       }
    }

    if (!departmentId) {
      return res.status(400).json({ success: false, message: "Department ID not found for user" });
    }

    const leaves = await LeaveService.getColleaguesOnLeave(departmentId, userId);
    return successResponse(res, "Colleagues on leave fetched", leaves, 200);
  });

  getManageLeaves = asyncHandler(async (req, res) => {
    let leaves = [];
    const role = req.user.role;
    if (role === 'admin' || role === 'super_admin' || role === 'hr') {
      leaves = await LeaveService.getAllLeaves();
    } else if (role === 'dept_head') {
      leaves = await LeaveService.getDepartmentLeaves(req.user.department_id);
    } else {
      leaves = [];
    }
    return successResponse(res, "Manage leaves fetched", leaves, 200);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const updated = await LeaveService.updateLeaveStatus({
      id,
      status,
      approvedBy: req.user.id,
      userRole: req.user.role,
      userDepartmentId: req.user.department_id
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: "UPDATE_LEAVE",
        entity_type: "leave",
        entity_id: id,
        ip_address: req.clientIp,
        details: { status },
      });
    } catch (e) {}

    return successResponse(res, "Leave status updated", updated, 200);
  });
}

export default new LeaveController();
