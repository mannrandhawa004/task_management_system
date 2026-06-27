import { executeQuery } from "../utils/dbQuery.js";

class LeaveModel {
  async applyLeave({ userId, type, leavePolicyId, startDate, endDate, totalDays, lwpDays, attachment, reason }) {
    const query = `
      INSERT INTO leaves (user_id, type, leave_policy_id, start_date, end_date, total_days, lwp_days, attachment, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const res = await executeQuery(query, [userId, type, leavePolicyId || null, startDate, endDate, totalDays || 1, lwpDays || 0, attachment || null, reason]);
    return this.getLeaveById(res.insertId);
  }

  async recordLwp({ employeeId, leaveRequestId, lwpDays }) {
    const query = `
      INSERT INTO leave_without_pay (employee_id, leave_request_id, lwp_days)
      VALUES (?, ?, ?)
    `;
    await executeQuery(query, [employeeId, leaveRequestId, lwpDays]);
  }

  async getLeaveById(id) {
    const query = `
      SELECT l.*, u.department_id as user_department_id 
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ? LIMIT 1
    `;
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  async getMyLeaves(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) as total FROM leaves WHERE user_id = ?`;
    const dataQuery = `SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [countResult, rows] = await Promise.all([
      executeQuery(countQuery, [userId]),
      executeQuery(dataQuery, [userId, limit, offset])
    ]);
    return { rows, total: countResult[0]?.total || 0 };
  }

  async getColleaguesOnLeave(departmentId, currentUserId, date) {
    const query = `
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      WHERE u.department_id = ?
        AND u.id != ?
        AND l.status = 'approved'
        AND ? BETWEEN l.start_date AND l.end_date
      ORDER BY l.start_date ASC
    `;
    return await executeQuery(query, [departmentId, currentUserId, date]);
  }

  async getDepartmentLeaves(departmentId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) as total FROM leaves l JOIN users u ON l.user_id = u.id WHERE u.department_id = ?`;
    const dataQuery = `
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      WHERE u.department_id = ?
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [countResult, rows] = await Promise.all([
      executeQuery(countQuery, [departmentId]),
      executeQuery(dataQuery, [departmentId, limit, offset])
    ]);
    return { rows, total: countResult[0]?.total || 0 };
  }

  async getAllLeaves({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) as total FROM leaves`;
    const dataQuery = `
      SELECT l.*, u.name as user_name, u.email as user_email, d.name as department_name
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [countResult, rows] = await Promise.all([
      executeQuery(countQuery),
      executeQuery(dataQuery, [limit, offset])
    ]);
    return { rows, total: countResult[0]?.total || 0 };
  }

  async updateLeaveStatus(id, status, approvedBy) {
    const query = `
      UPDATE leaves 
      SET status = ?, approved_by = ?
      WHERE id = ?
    `;
    await executeQuery(query, [status, approvedBy, id]);
    return this.getLeaveById(id);
  }
}

export default new LeaveModel();
