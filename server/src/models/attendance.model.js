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
    return await executeQuery(query, [userId, status || "working"]);
  }

  async checkOut({ id, finalStatus = 'present' }) {
    const query = `
      UPDATE attendance
      SET check_out = NOW(),
          status = ?,
          working_hours = ROUND((TIMESTAMPDIFF(SECOND, check_in, NOW()) - COALESCE(total_break_seconds, 0)) / 3600, 2)
      WHERE id = ?
    `;
    return await executeQuery(query, [finalStatus, id]);
  }

  async getById(id) {
    const query = `SELECT * FROM attendance WHERE id = ? LIMIT 1`;
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  async startBreak({ id }) {
    const query = `
      UPDATE attendance
      SET status = 'on_break', break_start = NOW()
      WHERE id = ?
    `;
    return await executeQuery(query, [id]);
  }

  async endBreak({ id }) {
    // Add the duration of the current break to total_break_seconds
    const query = `
      UPDATE attendance
      SET status = 'working',
          total_break_seconds = total_break_seconds + TIMESTAMPDIFF(SECOND, break_start, NOW()),
          break_start = NULL
      WHERE id = ?
    `;
    return await executeQuery(query, [id]);
  }

  async getWeeklyHours(userId) {
    const query = `
      SELECT SUM(working_hours) as weekly_hours
      FROM attendance
      WHERE user_id = ?
        AND YEARWEEK(date, 1) = YEARWEEK(CURRENT_DATE(), 1)
    `;
    const rows = await executeQuery(query, [userId]);
    return rows[0]?.weekly_hours || 0;
  }

  async getHistory({ userId, startDate, endDate, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) as total FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ?`;
    const dataQuery = `
      SELECT * FROM attendance
      WHERE user_id = ?
        AND date BETWEEN ? AND ?
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `;
    const [countResult, rows] = await Promise.all([
      executeQuery(countQuery, [userId, startDate, endDate]),
      executeQuery(dataQuery, [userId, startDate, endDate, limit, offset])
    ]);
    return { rows, total: countResult[0]?.total || 0 };
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

  async getDailyLogs({ date, departmentId = null, page = 1, limit = 10 }) {
    let baseWhere = `WHERE u.status = 'active'`;
    const params = [date];

    if (departmentId) {
      baseWhere += ` AND u.department_id = ? `;
      params.push(departmentId);
    }

    const countQuery = `SELECT COUNT(*) as total FROM users u ${baseWhere.replace('u.status', 'u.status')}`;
    // Clone params for count (without date for LEFT JOIN, but we still need active filter)
    const countParams = departmentId ? [date, departmentId] : [date];

    let dataQuery = `
      SELECT a.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar, d.name as department_name
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND a.date = ?
      LEFT JOIN departments d ON u.department_id = d.id
      ${baseWhere}
      ORDER BY u.name ASC
      LIMIT ? OFFSET ?
    `;
    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];

    // For the count we just count users matching the filter
    const countQ = `SELECT COUNT(*) as total FROM users u LEFT JOIN departments d ON u.department_id = d.id ${baseWhere}`;
    const cParams = departmentId ? [date, departmentId] : [date];
    // Actually count doesn't need the date for LEFT JOIN, just active users
    const countSimple = `SELECT COUNT(*) as total FROM users u ${departmentId ? 'WHERE u.status = \'active\' AND u.department_id = ?' : 'WHERE u.status = \'active\''}`;
    const cSimpleParams = departmentId ? [departmentId] : [];

    const [countResult, rows] = await Promise.all([
      executeQuery(countSimple, cSimpleParams),
      executeQuery(dataQuery, dataParams)
    ]);
    return { rows, total: countResult[0]?.total || 0 };
  }

  async getMonthlySummary({ startDate, endDate, departmentId = null, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let baseWhere = `WHERE u.status = 'active'`;
    const countParams = [];
    const dataParams = [startDate, endDate];

    if (departmentId) {
      baseWhere += ` AND u.department_id = ?`;
      countParams.push(departmentId);
      dataParams.push(departmentId);
    }

    const countQuery = `SELECT COUNT(*) as total FROM users u ${baseWhere}`;

    let dataQuery = `
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
      ${baseWhere}
      GROUP BY u.id, u.name, u.email, d.name
      ORDER BY u.name ASC
      LIMIT ? OFFSET ?
    `;

    const [countResult, rows] = await Promise.all([
      executeQuery(countQuery, countParams),
      executeQuery(dataQuery, [...dataParams, limit, offset])
    ]);
    return { rows, total: countResult[0]?.total || 0 };
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
