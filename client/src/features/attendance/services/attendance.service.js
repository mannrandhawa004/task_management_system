import { api } from "@/lib/axios";

export const checkIn = async (status) => {
  const response = await api.post("/attendance/check-in", { status });
  return response.data.data;
};

export const checkOut = async () => {
  const response = await api.post("/attendance/check-out");
  return response.data.data;
};

export const startBreak = async () => {
  const response = await api.post("/attendance/start-break");
  return response.data.data;
};

export const endBreak = async () => {
  const response = await api.post("/attendance/end-break");
  return response.data.data;
};

export const getTodayStatus = async () => {
  const response = await api.get("/attendance/today-status");
  return response.data.data;
};

export const getMyHistory = async ({ month = "", year = "" } = {}) => {
  const response = await api.get(`/attendance/my-history?month=${month}&year=${year}`);
  return response.data.data;
};

export const getDailyLogs = async ({ date = "", departmentId = "" } = {}) => {
  const response = await api.get(`/attendance/daily-logs?date=${date}&departmentId=${departmentId}`);
  return response.data.data;
};

export const getMonthlySummary = async ({ month = "", year = "", departmentId = "" } = {}) => {
  const response = await api.get(`/attendance/monthly-summary?month=${month}&year=${year}&departmentId=${departmentId}`);
  return response.data.data;
};

export const updateAttendance = async ({ id, data }) => {
  const response = await api.patch(`/attendance/${id}`, data);
  return response.data.data;
};
