import { executeQuery } from "../utils/dbQuery.js";

class LeavePolicyModel {
  async getAllPolicies(activeOnly = false) {
    let query = `SELECT * FROM leave_policies`;
    if (activeOnly) {
      query += ` WHERE is_active = true`;
    }
    query += ` ORDER BY id ASC`;
    return await executeQuery(query);
  }

  async getPolicyById(id) {
    const query = `SELECT * FROM leave_policies WHERE id = ? LIMIT 1`;
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  async createPolicy({ leaveType, annualQuota, isPaid, carryForwardLimit }) {
    const query = `
      INSERT INTO leave_policies (leave_type, annual_quota, is_paid, carry_forward_limit, is_active)
      VALUES (?, ?, ?, ?, true)
    `;
    const res = await executeQuery(query, [leaveType, annualQuota, isPaid, carryForwardLimit]);
    return await this.getPolicyById(res.insertId);
  }

  async updatePolicy(id, { leaveType, annualQuota, isPaid, carryForwardLimit, isActive }) {
    const query = `
      UPDATE leave_policies
      SET leave_type = ?, annual_quota = ?, is_paid = ?, carry_forward_limit = ?, is_active = ?
      WHERE id = ?
    `;
    await executeQuery(query, [leaveType, annualQuota, isPaid, carryForwardLimit, isActive, id]);
    return await this.getPolicyById(id);
  }

  async deletePolicy(id) {
    const query = `UPDATE leave_policies SET is_active = false WHERE id = ?`;
    await executeQuery(query, [id]);
    return true;
  }

  async getEmployeeBalances(employeeId, year) {
    const query = `
      SELECT b.*, p.leave_type, p.is_paid, p.carry_forward_limit
      FROM employee_leave_balances b
      JOIN leave_policies p ON b.leave_policy_id = p.id
      WHERE b.employee_id = ? AND b.year = ? AND p.is_active = true
      ORDER BY p.id ASC
    `;
    return await executeQuery(query, [employeeId, year]);
  }

  async getBalanceByPolicy(employeeId, policyId, year) {
    const query = `
      SELECT * FROM employee_leave_balances
      WHERE employee_id = ? AND leave_policy_id = ? AND year = ? LIMIT 1
    `;
    const rows = await executeQuery(query, [employeeId, policyId, year]);
    return rows[0] || null;
  }

  async allocateBalance({ employeeId, policyId, allocated, year }) {
    const query = `
      INSERT INTO employee_leave_balances (employee_id, leave_policy_id, allocated, used, remaining, year)
      VALUES (?, ?, ?, 0, ?, ?)
      ON DUPLICATE KEY UPDATE allocated = ?, remaining = allocated - used
    `;
    await executeQuery(query, [employeeId, policyId, allocated, allocated, year, allocated]);
    return await this.getBalanceByPolicy(employeeId, policyId, year);
  }

  async updateBalanceUsage(employeeId, policyId, year, usedDelta) {
    const query = `
      UPDATE employee_leave_balances
      SET used = used + ?, remaining = remaining - ?
      WHERE employee_id = ? AND leave_policy_id = ? AND year = ?
    `;
    await executeQuery(query, [usedDelta, usedDelta, employeeId, policyId, year]);
    return await this.getBalanceByPolicy(employeeId, policyId, year);
  }

  async syncEmployeeBalances(employeeId, year) {
    // Backfill any unassigned policy IDs for old leaves
    await executeQuery(`UPDATE leaves SET leave_policy_id = 1 WHERE user_id = ? AND leave_policy_id IS NULL AND (type = 'casual' OR type = 'half_day')`, [employeeId]);
    await executeQuery(`UPDATE leaves SET leave_policy_id = 2 WHERE user_id = ? AND leave_policy_id IS NULL AND type = 'sick'`, [employeeId]);
    await executeQuery(`UPDATE leaves SET leave_policy_id = 3 WHERE user_id = ? AND leave_policy_id IS NULL AND type = 'earned'`, [employeeId]);
    await executeQuery(`UPDATE leaves SET leave_policy_id = 6 WHERE user_id = ? AND leave_policy_id IS NULL AND type = 'wfh'`, [employeeId]);

    // Sync used and remaining balances against actual approved leaves
    const syncQuery = `
      UPDATE employee_leave_balances b
      SET b.used = COALESCE((
        SELECT SUM(l.total_days - COALESCE(l.lwp_days, 0))
        FROM leaves l
        WHERE l.user_id = b.employee_id AND l.leave_policy_id = b.leave_policy_id AND l.status = 'approved' AND YEAR(l.start_date) = b.year
      ), 0),
      b.remaining = b.allocated - COALESCE((
        SELECT SUM(l.total_days - COALESCE(l.lwp_days, 0))
        FROM leaves l
        WHERE l.user_id = b.employee_id AND l.leave_policy_id = b.leave_policy_id AND l.status = 'approved' AND YEAR(l.start_date) = b.year
      ), 0)
      WHERE b.employee_id = ? AND b.year = ?
    `;
    await executeQuery(syncQuery, [employeeId, year]);
  }
}

export default new LeavePolicyModel();
