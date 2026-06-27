import AttendanceModel from "../models/attendance.model.js";
import { ConflictError, BadRequestError, NotFoundError } from "../utils/errorHandler.js";

class AttendanceService {
  async checkIn({ userId, status }) {
    const todayRecord = await AttendanceModel.getTodayRecord(userId);
    if (todayRecord) {
      throw new ConflictError("Already checked in for today");
    }

    // Always set status to 'working' — the final attendance status
    // (present/late) will be determined at checkout time
    const result = await AttendanceModel.checkIn({ userId, status: 'working' });
    return await AttendanceModel.getById(result.insertId);
  }

  async checkOut(userId) {
    const todayRecord = await AttendanceModel.getTodayRecord(userId);
    if (!todayRecord) {
      throw new BadRequestError("No check-in record found for today. Please check in first.");
    }

    if (todayRecord.check_out) {
      throw new ConflictError("Already checked out for today");
    }

    // If currently on break, end the break first
    if (todayRecord.status === 'on_break') {
      await AttendanceModel.endBreak({ id: todayRecord.id });
    }

    // Determine final status based on check-in time
    const checkInTime = new Date(todayRecord.check_in);
    const hours = checkInTime.getHours();
    const minutes = checkInTime.getMinutes();
    let finalStatus = 'present';
    if (hours > 9 || (hours === 9 && minutes > 15)) {
      finalStatus = 'late';
    }

    await AttendanceModel.checkOut({ id: todayRecord.id, finalStatus });
    return await AttendanceModel.getById(todayRecord.id);
  }

  async startBreak(userId) {
    const todayRecord = await AttendanceModel.getTodayRecord(userId);
    if (!todayRecord) throw new BadRequestError("Not checked in");
    if (todayRecord.status === 'on_break') throw new ConflictError("Already on break");
    await AttendanceModel.startBreak({ id: todayRecord.id });
    return await AttendanceModel.getById(todayRecord.id);
  }

  async endBreak(userId) {
    const todayRecord = await AttendanceModel.getTodayRecord(userId);
    if (!todayRecord) throw new BadRequestError("Not checked in");
    if (todayRecord.status !== 'on_break') throw new ConflictError("Not on break");
    await AttendanceModel.endBreak({ id: todayRecord.id });
    return await AttendanceModel.getById(todayRecord.id);
  }

  async getTodayStatus(userId) {
    const record = await AttendanceModel.getTodayRecord(userId);
    const weeklyHours = await AttendanceModel.getWeeklyHours(userId);
    return { record, weeklyHours };
  }

  async getMyHistory({ userId, month, year, page, limit }) {
    // If month and year not provided, default to current month
    const now = new Date();
    const targetMonth = month !== undefined ? parseInt(month) : now.getMonth() + 1; // 1-indexed
    const targetYear = year !== undefined ? parseInt(year) : now.getFullYear();

    // Start and end date for SQL query range
    const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${lastDay}`;

    const result = await AttendanceModel.getHistory({ userId, startDate, endDate, page, limit });
    const summary = await AttendanceModel.getSummary({ userId, startDate, endDate });

    return { rows: result.rows, total: result.total, summary };
  }

  async getDailyLogs({ date, departmentId, page, limit }) {
    const targetDate = date || new Date().toISOString().split("T")[0];
    return await AttendanceModel.getDailyLogs({ date: targetDate, departmentId, page, limit });
  }

  async getMonthlySummary({ month, year, departmentId, page, limit }) {
    const now = new Date();
    const targetMonth = month !== undefined ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year !== undefined ? parseInt(year) : now.getFullYear();

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${lastDay}`;

    return await AttendanceModel.getMonthlySummary({ startDate, endDate, departmentId, page, limit });
  }

  async updateAttendance(id, { status, working_hours }) {
    const record = await AttendanceModel.getById(id);
    if (!record) {
      throw new NotFoundError("Attendance record not found");
    }

    await AttendanceModel.updateStatus({
      id,
      status: status || record.status,
      working_hours: working_hours !== undefined ? working_hours : record.working_hours,
    });

    return await AttendanceModel.getById(id);
  }
}

export default new AttendanceService();
