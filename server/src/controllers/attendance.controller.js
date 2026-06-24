import AttendanceService from "../services/attendance.service.js";
import AuditService from "../services/audit.service.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getSocketIO } from "../socket/socket.js";

class AttendanceController {
  checkIn = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const userId = req.user.id;

    const record = await AttendanceService.checkIn({ userId, status });

    try {
      await AuditService.log({
        user_id: userId,
        action: AUDIT_ACTIONS.CHECK_IN,
        entity_type: "attendance",
        entity_id: record.id,
        ip_address: req.clientIp,
        details: {
          attendance_id: record.id,
          status: record.status,
          check_in: record.check_in,
          summary: `Employee checked in: status ${record.status}`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for checkIn:", err.message);
    }

    // Emit socket updates for admin panels
    const io = getSocketIO();
    if (io) {
      io.emit("attendance_activity", { action: "CHECK_IN", user_id: userId, record });
    }

    return successResponse(res, "Checked in successfully", record, 201);
  });

  checkOut = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const record = await AttendanceService.checkOut(userId);

    try {
      await AuditService.log({
        user_id: userId,
        action: AUDIT_ACTIONS.CHECK_OUT,
        entity_type: "attendance",
        entity_id: record.id,
        ip_address: req.clientIp,
        details: {
          attendance_id: record.id,
          check_out: record.check_out,
          working_hours: record.working_hours,
          summary: `Employee checked out: ${record.working_hours} hours logged`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for checkOut:", err.message);
    }

    // Emit socket updates
    const io = getSocketIO();
    if (io) {
      io.emit("attendance_activity", { action: "CHECK_OUT", user_id: userId, record });
    }

    return successResponse(res, "Checked out successfully", record, 200);
  });

  startBreak = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const record = await AttendanceService.startBreak(userId);
    const io = getSocketIO();
    if (io) io.emit("attendance_activity", { action: "START_BREAK", user_id: userId, record });
    return successResponse(res, "Started break", record, 200);
  });

  endBreak = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const record = await AttendanceService.endBreak(userId);
    const io = getSocketIO();
    if (io) io.emit("attendance_activity", { action: "END_BREAK", user_id: userId, record });
    return successResponse(res, "Ended break", record, 200);
  });

  getTodayStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const status = await AttendanceService.getTodayStatus(userId);
    return successResponse(res, "Today's check-in status fetched", status, 200);
  });

  getMyHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    const history = await AttendanceService.getMyHistory({ userId, month, year });
    return successResponse(res, "Attendance history fetched successfully", history, 200);
  });

  getDailyLogs = asyncHandler(async (req, res) => {
    const { date, departmentId } = req.query;
    const logs = await AttendanceService.getDailyLogs({ date, departmentId });
    return successResponse(res, "Daily attendance logs fetched", logs, 200);
  });

  getMonthlySummary = asyncHandler(async (req, res) => {
    const { month, year, departmentId } = req.query;
    const summary = await AttendanceService.getMonthlySummary({ month, year, departmentId });
    return successResponse(res, "Monthly attendance summary fetched", summary, 200);
  });

  updateAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, working_hours } = req.body;

    const updated = await AttendanceService.updateAttendance(id, { status, working_hours });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.ATTENDANCE_UPDATED,
        entity_type: "attendance",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          attendance_id: id,
          status: updated.status,
          working_hours: updated.working_hours,
          summary: `Attendance record manually updated by Admin`,
        },
      });
    } catch (err) {
      console.error("Audit log failed for updateAttendance:", err.message);
    }

    return successResponse(res, "Attendance record updated", updated, 200);
  });
}

export default new AttendanceController();
