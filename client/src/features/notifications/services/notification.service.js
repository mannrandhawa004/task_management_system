import { api } from "@/lib/axios";

export const getNotifications = async () => {
  const response = await api.get("/notification");
  return response.data.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notification/${id}/read`);
  return response.data.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notification/read-all");
  return response.data.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notification/${id}`);
  return response.data.data;
};

export const clearAllNotifications = async () => {
  const response = await api.delete("/notification/clear-all");
  return response.data.data;
};
