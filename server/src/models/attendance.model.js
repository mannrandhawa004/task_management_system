import { executeQuery } from "../utils/dbQuery.js";

class AttendanceModel {
  async getTodayRecord(userId) {
    const query = `
      SELECT * FROM attendance
      WHERE user_id = ? AND date = CURRENT_DATE()
      LIMIT 1
    `;
    const rows = await executeQuery(query, [userId]);
    return rows[0] || null;
  }

  async checkIn({ userId, status }) {
    const query = `
      INSERT INTO attendance (user_id, date, check_in, status)
      VALUES (?, CURRENT_DATE(), NOW(), ?)
    `;
    return await executeQuery(query, [userId, status || "present"]);
  }

  async checkOut({ id }) {
    // Calculates working hours as difference between check_in and NOW() in hours
    const query = `
      UPDATE attendance
      SET check_out = NOW(),
          working_hours = ROUND(TIMESTAMPDIFF(SECOND, check_in, NOW()) / 3600, 2)
      WHERE id = ?
    `;
    return await executeQuery(query, [id]);
  }

  async getById(id) {
    const query = `SELECT * FROM attendance WHERE id = ? LIMIT 1`;
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  async getHistory({ userId, startDate, endDate }) {
    const query = `
      SELECT * FROM attendance
      WHERE user_id = ?
        AND date BETWEEN ? AND ?
      ORDER BY date DESC
    `;
    return await executeQuery(query, [userId, startDate, endDate]);
  }

  async getSummary({ userId, startDate, endDate }) {
    const query = `
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN status = 'half_day' THEN 1 END) as half_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'remote' THEN 1 END) as remote_days,
        COUNT(CASE WHEN status = 'on_leave' THEN 1 END) as leave_days,
        SUM(working_hours) as total_working_hours,
        COUNT(id) as total_tracked_days
      FROM attendance
      WHERE user_id = ?
        AND date BETWEEN ? AND ?
    `;
    const rows = await executeQuery(query, [userId, startDate, endDate]);
    return rows[0] || null;
  }

  async getDailyLogs({ date, departmentId = null }) {
    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar, d.name as department_name
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date = ?
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.status = 'active'
    `;
    const params = [date];

    if (departmentId) {
      query += ` AND u.department_id = ? `;
      params.push(departmentId);
    }

    query += ` ORDER BY u.name ASC `;
    return await executeQuery(query, params);
  }

  async getMonthlySummary({ startDate, endDate, departmentId = null }) {
    let query = `
      SELECT 
        u.id as user_id, u.name as user_name, u.email as user_email,
        d.name as department_name,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN a.status = 'half_day' THEN 1 ELSE 0 END) as half_day_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'remote' THEN 1 ELSE 0 END) as remote_count,
        SUM(CASE WHEN a.status = 'on_leave' THEN 1 ELSE 0 END) as leave_count,
        SUM(COALESCE(a.working_hours, 0)) as total_hours
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date BETWEEN ? AND ?
      WHERE u.status = 'active'
    `;
    const params = [startDate, endDate];

    if (departmentId) {
      query += ` AND u.department_id = ? `;
      params.push(departmentId);
    }

    query += ` GROUP BY u.id, u.name, u.email, d.name ORDER BY u.name ASC `;
    return await executeQuery(query, params);
  }

  async updateStatus({ id, status, working_hours }) {
    const query = `
      UPDATE attendance
      SET status = ?, working_hours = ?
      WHERE id = ?
    `;
    return await executeQuery(query, [status, working_hours, id]);
  }
}

export default new AttendanceModel();
