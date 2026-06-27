import LeaveModel from "../models/leave.model.js";
import LeavePolicyModel from "../models/leavePolicy.model.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/errorHandler.js";

class LeaveService {
  async applyLeave({ userId, type, leavePolicyId, startDate, endDate, totalDays, reason, attachment }) {
    if (!type || !startDate || !endDate) {
      throw new BadRequestError("Type, start date, and end date are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    let calculatedDays = totalDays ? Number(totalDays) : Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    if (type === 'half_day') {
      calculatedDays = 0.5;
    }

    // Determine leave policy
    let policyId = leavePolicyId;
    if (!policyId) {
      const typeMapping = { casual: 1, sick: 2, earned: 3, wfh: 6, half_day: 1 };
      policyId = typeMapping[type] || 1;
    }

    const currentYear = start.getFullYear() || new Date().getFullYear();
    const balance = await LeavePolicyModel.getBalanceByPolicy(userId, policyId, currentYear);

    let lwpDays = 0;
    if (balance && balance.remaining < calculatedDays) {
      lwpDays = Number((calculatedDays - Math.max(0, balance.remaining)).toFixed(1));
    }

    const leave = await LeaveModel.applyLeave({
      userId,
      type,
      leavePolicyId: policyId,
      startDate,
      endDate,
      totalDays: calculatedDays,
      lwpDays,
      attachment,
      reason
    });

    if (lwpDays > 0) {
      await LeaveModel.recordLwp({
        employeeId: userId,
        leaveRequestId: leave.id,
        lwpDays
      });
    }

    return leave;
  }

  async getMyLeaves(userId, { page, limit } = {}) {
    return await LeaveModel.getMyLeaves(userId, { page, limit });
  }

  async getColleaguesOnLeave(departmentId, currentUserId) {
    const today = new Date().toISOString().split('T')[0];
    return await LeaveModel.getColleaguesOnLeave(departmentId, currentUserId, today);
  }

  async getDepartmentLeaves(departmentId, { page, limit } = {}) {
    return await LeaveModel.getDepartmentLeaves(departmentId, { page, limit });
  }

  async getAllLeaves({ page, limit } = {}) {
    return await LeaveModel.getAllLeaves({ page, limit });
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

    const oldStatus = leave.status;
    const updatedLeave = await LeaveModel.updateLeaveStatus(id, status, approvedBy);

    // Adjust balances if transitioning into or out of 'approved'
    if (leave.leave_policy_id) {
      const year = new Date(leave.start_date).getFullYear() || new Date().getFullYear();
      const paidDaysDelta = Number((leave.total_days || 1) - (leave.lwp_days || 0));

      if (status === 'approved' && oldStatus !== 'approved') {
        await LeavePolicyModel.updateBalanceUsage(leave.user_id, leave.leave_policy_id, year, paidDaysDelta);
      } else if ((status === 'rejected' || status === 'cancelled') && oldStatus === 'approved') {
        await LeavePolicyModel.updateBalanceUsage(leave.user_id, leave.leave_policy_id, year, -paidDaysDelta);
      }
    }

    return updatedLeave;
  }
}

export default new LeaveService();
