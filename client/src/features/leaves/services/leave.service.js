import { api } from "@/lib/axios";

export const applyLeave = async (data) => {
  const response = await api.post("/leaves/apply", data);
  return response.data.data;
};

export const getMyLeaves = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/leaves/my?page=${page}&limit=${limit}`);
  return { data: response.data.data, meta: response.data.meta };
};

export const getManageLeaves = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/leaves/manage?page=${page}&limit=${limit}`);
  return { data: response.data.data, meta: response.data.meta };
};

export const updateLeaveStatus = async ({ id, status }) => {
  const response = await api.patch(`/leaves/${id}/status`, { status });
  return response.data.data;
};

export const getColleaguesOnLeave = async () => {
  const response = await api.get("/leaves/colleagues");
  return response.data.data;
};

export const getPolicies = async () => {
  const response = await api.get("/leaves/policies");
  return response.data.data;
};

export const createPolicy = async (data) => {
  const response = await api.post("/leaves/policies", data);
  return response.data.data;
};

export const updatePolicy = async ({ id, ...data }) => {
  const response = await api.put(`/leaves/policies/${id}`, data);
  return response.data.data;
};

export const allocateQuotas = async (year) => {
  const response = await api.post("/leaves/allocate", { year });
  return response.data.data;
};

export const getMyBalances = async (year) => {
  const response = await api.get(`/leaves/balances${year ? `?year=${year}` : ""}`);
  return response.data.data;
};

export const getSalaryReport = async (params = {}) => {
  const response = await api.get("/leaves/salary-report", { params });
  return response.data.data;
};
