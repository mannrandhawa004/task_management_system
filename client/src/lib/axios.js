import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const submittedTenantSlug =
      config.data && typeof config.data === "object"
        ? config.data.tenantSlug
        : null;
    const tenantSlug = submittedTenantSlug
      || urlParams.get("workspace")
      || localStorage.getItem("active_tenant_slug");
    if (tenantSlug) {
      config.headers["x-tenant-slug"] = tenantSlug;
      if (config.url?.includes("/auth/login") && config.data && typeof config.data === "object") {
        config.data.tenantSlug ||= tenantSlug;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");

        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);
