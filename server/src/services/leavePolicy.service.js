import LeavePolicyModel from "../models/leavePolicy.model.js";
import { NotFoundError, BadRequestError } from "../utils/errorHandler.js";
import { executeQuery } from "../utils/dbQuery.js";

class LeavePolicyService {
  async getAllPolicies(activeOnly = false) {
    return await LeavePolicyModel.getAllPolicies(activeOnly);
  }

  async createPolicy(data) {
    if (!data.leaveType) throw new BadRequestError("Leave type name is required");
    return await LeavePolicyModel.createPolicy({
      leaveType: data.leaveType,
      annualQuota: Number(data.annualQuota || 0),
      isPaid: data.isPaid !== undefined ? Boolean(data.isPaid) : true,
      carryForwardLimit: Number(data.carryForwardLimit || 0)
    });
  }

  async updatePolicy(id, data) {
    const existing = await LeavePolicyModel.getPolicyById(id);
    if (!existing) throw new NotFoundError("Leave policy not found");

    return await LeavePolicyModel.updatePolicy(id, {
      leaveType: data.leaveType || existing.leave_type,
      annualQuota: data.annualQuota !== undefined ? Number(data.annualQuota) : existing.annual_quota,
      isPaid: data.isPaid !== undefined ? Boolean(data.isPaid) : existing.is_paid,
      carryForwardLimit: data.carryForwardLimit !== undefined ? Number(data.carryForwardLimit) : existing.carry_forward_limit,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.is_active
    });
  }

  async allocateAnnualQuotas(year = new Date().getFullYear()) {
    const users = await executeQuery("SELECT id FROM users WHERE status = 'active'");
    const policies = await LeavePolicyModel.getAllPolicies(true);

    let count = 0;
    for (const user of users) {
      for (const policy of policies) {
        await LeavePolicyModel.allocateBalance({
          employeeId: user.id,
          policyId: policy.id,
          allocated: policy.annual_quota,
          year
        });
        count++;
      }
    }
    return { usersCount: users.length, balancesUpdated: count, year };
  }

  async getEmployeeBalances(employeeId, year = new Date().getFullYear()) {
    // Ensure user has balance records allocated for this year
    let balances = await LeavePolicyModel.getEmployeeBalances(employeeId, year);
    if (balances.length === 0) {
      const policies = await LeavePolicyModel.getAllPolicies(true);
      for (const policy of policies) {
        await LeavePolicyModel.allocateBalance({
          employeeId,
          policyId: policy.id,
          allocated: policy.annual_quota,
          year
        });
      }
    }
    // Always sync with actual approved leaves to guarantee accuracy
    await LeavePolicyModel.syncEmployeeBalances(employeeId, year);
    return await LeavePolicyModel.getEmployeeBalances(employeeId, year);
  }

  async getSalaryReport({ month, year = new Date().getFullYear() }) {
    const targetMonth = month ? Number(month) : null;
    const query = `
      SELECT 
        u.id as employee_id,
        u.name,
        u.email,
        COALESCE(d.name, 'General') as department_name,
        COALESCE(u.salary, 50000.00) as base_salary,
        COALESCE(SUM(CASE WHEN l.status = 'approved' THEN l.total_days ELSE 0 END), 0) as total_leaves_taken,
        COALESCE(SUM(CASE WHEN l.status = 'approved' THEN l.lwp_days ELSE 0 END), 0) as lwp_days
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN leaves l ON u.id = l.user_id AND YEAR(l.start_date) = ? AND (? IS NULL OR MONTH(l.start_date) = ?)
      WHERE u.status = 'active'
      GROUP BY u.id, u.name, u.email, d.name, u.salary
      ORDER BY u.name ASC
    `;
    const rows = await executeQuery(query, [year, targetMonth, targetMonth]);
    
    return rows.map(row => {
      const baseSalary = Number(row.base_salary);
      const lwpDays = Number(row.lwp_days);
      const perDaySalary = baseSalary / 30;
      const deduction = Number((perDaySalary * lwpDays).toFixed(2));
      const netSalary = Number((baseSalary - deduction).toFixed(2));
      return {
        ...row,
        base_salary: baseSalary,
        total_leaves_taken: Number(row.total_leaves_taken),
        lwp_days: lwpDays,
        deduction,
        net_salary: netSalary
      };
    });
  }
}

export default new LeavePolicyService();
