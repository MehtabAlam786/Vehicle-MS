import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

/* Attach JWT from localStorage on every request */
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("vms_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith("/auth/")) {
      localStorage.removeItem("vms_token");
      localStorage.removeItem("vms_user");
      window.location.assign("/");
    }
    return Promise.reject(error);
  },
);

/* Auth */
export const authLogin = (data) => api.post("/auth/login", data);
export const authAdminLogin = (data) => api.post("/auth/admin/login", data);
export const authAdminVerify = (data) => api.post("/auth/admin/verify", data);
export const authAdminSetup = (data, setupKey) => api.post("/auth/admin/setup", data, { headers: { "x-admin-setup-key": setupKey } });
export const authRegister = (data) => api.post("/auth/register", data);
export const authLogout = () => api.post("/auth/logout");
export const authGetMe = () => api.get("/auth/me");
export const authUpdateMe = (data) => api.put("/auth/me", data);
export const authChangePassword = (data) =>
  api.put("/auth/change-password", data);
export const authForgotPassword = (data) =>
  api.post("/auth/forgot-password", data);
export const authVerifyOTP = (data) => api.post("/auth/verify-otp", data);
export const authResetPassword = (data) =>
  api.post("/auth/reset-password", data);

export const getDashboard = () => api.get("/dashboard");

export const getVehicles = () => api.get("/vehicles");
export const createVehicle = (data) => api.post("/vehicles", data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const updateVehicleKm = (id, currentKm) =>
  api.patch(`/vehicles/${id}/km`, { currentKm });
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

export const getFuel = () => api.get("/fuel");
export const createFuel = (data) => api.post("/fuel", data);
export const deleteFuel = (id) => api.delete(`/fuel/${id}`);

export const getMaintenance = () => api.get("/maintenance");
export const createMaintenance = (data) => api.post("/maintenance", data);
export const deleteMaintenance = (id) => api.delete(`/maintenance/${id}`);

// Drivers
export const getDrivers = () => api.get("/drivers");
export const getDriverStats = () => api.get("/drivers/stats");
export const createDriver = (data) => api.post("/drivers", data);
export const updateDriver = (id, data) => api.put(`/drivers/${id}`, data);
export const deleteDriver = (id) => api.delete(`/drivers/${id}`);
export const assignVehicle = (id, vehicleId) =>
  api.patch(`/drivers/${id}/assign`, { vehicleId });

// Reports
export const getReportOverview = () => api.get("/reports/overview");
export const getReportFuel = (params) => api.get("/reports/fuel", { params });
export const getReportMaintenance = (params) =>
  api.get("/reports/maintenance", { params });
export const getReportVehicle = (id) => api.get(`/reports/vehicle/${id}`);

// Reminders
export const getReminders = () => api.get("/reminders");
export const getReminderStats = () => api.get("/reminders/stats");
export const createReminder = (data) => api.post("/reminders", data);
export const updateReminder = (id, data) => api.put(`/reminders/${id}`, data);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);
export const completeReminder = (id) => api.patch(`/reminders/${id}/complete`);
export const snoozeReminder = (id, days) =>
  api.patch(`/reminders/${id}/snooze`, { days });
export const syncReminders = () => api.post("/reminders/sync");

// Settings
export const getSettings = () => api.get("/settings");
export const updateSettings = (data) => api.put("/settings", data);
export const getSystemInfo = () => api.get("/settings/system-info");
export const clearCollection = (collection) =>
  api.delete(`/settings/data/${collection}`);

export const getUsers = () => api.get("/users");
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const getRoleRequests = () => api.get("/users/role-requests");
export const reviewRoleRequest = (id, data) => api.patch(`/users/role-requests/${id}`, data);

export const getAppearance = () => api.get("/appearance");
export const updateAppearance = (data) => api.put("/appearance", data);
