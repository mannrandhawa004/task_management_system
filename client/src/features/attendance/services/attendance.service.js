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

export const getMyHistory = async ({ month = "", year = "", page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/attendance/my-history?month=${month}&year=${year}&page=${page}&limit=${limit}`);
  return { data: response.data.data, meta: response.data.meta };
};

export const getDailyLogs = async ({ date = "", departmentId = "", page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/attendance/daily-logs?date=${date}&departmentId=${departmentId}&page=${page}&limit=${limit}`);
  return { data: response.data.data, meta: response.data.meta };
};

export const getMonthlySummary = async ({ month = "", year = "", departmentId = "", page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/attendance/monthly-summary?month=${month}&year=${year}&departmentId=${departmentId}&page=${page}&limit=${limit}`);
  return { data: response.data.data, meta: response.data.meta };
};

export const updateAttendance = async ({ id, data }) => {
  const response = await api.patch(`/attendance/${id}`, data);
  return response.data.data;
};
