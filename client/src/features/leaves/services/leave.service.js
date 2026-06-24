import { api } from "@/lib/axios";

export const applyLeave = async (data) => {
  const response = await api.post("/leaves/apply", data);
  return response.data.data;
};

export const getMyLeaves = async () => {
  const response = await api.get("/leaves/my");
  return response.data.data;
};

export const getManageLeaves = async () => {
  const response = await api.get("/leaves/manage");
  return response.data.data;
};

export const updateLeaveStatus = async ({ id, status }) => {
  const response = await api.patch(`/leaves/${id}/status`, { status });
  return response.data.data;
};

export const getColleaguesOnLeave = async () => {
  const response = await api.get("/leaves/colleagues");
  return response.data.data;
};
