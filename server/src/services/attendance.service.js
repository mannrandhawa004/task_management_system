import AttendanceModel from "../models/attendance.model.js";
import { ConflictError, BadRequestError, NotFoundError } from "../utils/errorHandler.js";

class AttendanceService {
  async checkIn({ userId, status }) {
    const todayRecord = await AttendanceModel.getTodayRecord(userId);
    if (todayRecord) {
      throw new ConflictError("Already checked in for today");
    }

    // Determine status automatically if not provided
    let finalStatus = status || "present";

    if (!status) {
      // Auto lateness detection: late if check in is after 09:15 AM local time
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      if (hours > 9 || (hours === 9 && minutes > 15)) {
        finalStatus = "late";
      }
    }

    const result = await AttendanceModel.checkIn({ userId, status: finalStatus });
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

    await AttendanceModel.checkOut({ id: todayRecord.id });
    return await AttendanceModel.getById(todayRecord.id);
  }

  async getTodayStatus(userId) {
    return await AttendanceModel.getTodayRecord(userId);
  }

  async getMyHistory({ userId, month, year }) {
    // If month and year not provided, default to current month
    const now = new Date();
    const targetMonth = month !== undefined ? parseInt(month) : now.getMonth() + 1; // 1-indexed
    const targetYear = year !== undefined ? parseInt(year) : now.getFullYear();

    // Start and end date for SQL query range
    const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${lastDay}`;

    const rows = await AttendanceModel.getHistory({ userId, startDate, endDate });
    const summary = await AttendanceModel.getSummary({ userId, startDate, endDate });

    return { rows, summary };
  }

  async getDailyLogs({ date, departmentId }) {
    const targetDate = date || new Date().toISOString().split("T")[0];
    return await AttendanceModel.getDailyLogs({ date: targetDate, departmentId });
  }

  async getMonthlySummary({ month, year, departmentId }) {
    const now = new Date();
    const targetMonth = month !== undefined ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year !== undefined ? parseInt(year) : now.getFullYear();

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${lastDay}`;

    return await AttendanceModel.getMonthlySummary({ startDate, endDate, departmentId });
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
