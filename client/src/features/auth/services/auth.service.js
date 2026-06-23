import { api } from "@/lib/axios";

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.patch("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const getAllUsers = async (page = 1, limit = 10) => {
  const response = await api.get(`/auth/allusers?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const getIndividualUser = async (userId) => {
  const response = await api.get(`/auth/user/detail/${userId}`);
  return response.data.data;
};


export const changeStatus = async ({ userId, status }) => {
  console.log("Updating User ID:", userId, "to Status:", status);
  const response = await api.patch(`/auth/changeStatus/${userId}`, { status });
  return response.data.data;
};

export const searchUsers = async (search = "", page = 1, limit = 10) => {
  const response = await api.get(
    `auth/user?search=${search}&page=${page}&limit=${limit}`,
  );

  return response.data.data;
};
