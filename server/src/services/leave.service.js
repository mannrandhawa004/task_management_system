import LeaveModel from "../models/leave.model.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/errorHandler.js";

class LeaveService {
  async applyLeave({ userId, type, startDate, endDate, reason }) {
    if (!type || !startDate || !endDate) {
      throw new BadRequestError("Type, start date, and end date are required");
    }
    return await LeaveModel.applyLeave({ userId, type, startDate, endDate, reason });
  }

  async getMyLeaves(userId) {
    return await LeaveModel.getMyLeaves(userId);
  }

  async getColleaguesOnLeave(departmentId, currentUserId) {
    const today = new Date().toISOString().split('T')[0];
    return await LeaveModel.getColleaguesOnLeave(departmentId, currentUserId, today);
  }

  async getDepartmentLeaves(departmentId) {
    return await LeaveModel.getDepartmentLeaves(departmentId);
  }

  async getAllLeaves() {
    return await LeaveModel.getAllLeaves();
  }

  async updateLeaveStatus({ id, status, approvedBy, userRole, userDepartmentId }) {
    const leave = await LeaveModel.getLeaveById(id);
    if (!leave) throw new NotFoundError("Leave request not found");

    const role = userRole ? userRole.toLowerCase() : "";

    if (role === 'dept_head') {
      if (leave.user_department_id !== userDepartmentId) {
        throw new ForbiddenError("Not authorized to approve leaves for other departments");
      }
    } else if (role !== 'admin' && role !== 'super_admin' && role !== 'hr') {
      throw new ForbiddenError("Not authorized to approve leaves");
    }

    return await LeaveModel.updateLeaveStatus(id, status, approvedBy);
  }
}

export default new LeaveService();
