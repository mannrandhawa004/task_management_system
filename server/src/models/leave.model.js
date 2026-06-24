import { executeQuery } from "../utils/dbQuery.js";

class LeaveModel {
  async applyLeave({ userId, type, startDate, endDate, reason }) {
    const query = `
      INSERT INTO leaves (user_id, type, start_date, end_date, reason)
      VALUES (?, ?, ?, ?, ?)
    `;
    const res = await executeQuery(query, [userId, type, startDate, endDate, reason]);
    return this.getLeaveById(res.insertId);
  }

  async getLeaveById(id) {
    const query = `SELECT * FROM leaves WHERE id = ? LIMIT 1`;
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  async getMyLeaves(userId) {
    const query = `SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC`;
    return await executeQuery(query, [userId]);
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

  async getDepartmentLeaves(departmentId) {
    const query = `
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      WHERE u.department_id = ?
      ORDER BY l.created_at DESC
    `;
    return await executeQuery(query, [departmentId]);
  }

  async getAllLeaves() {
    const query = `
      SELECT l.*, u.name as user_name, u.email as user_email, d.name as department_name
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY l.created_at DESC
    `;
    return await executeQuery(query);
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
