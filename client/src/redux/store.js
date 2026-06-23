import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/slices/authSlice";
import projectReducer from "../features/projects/slices/projectSlice";
import taskReducer from "../features/tasks/slice/taskSlice";
import auditReducer from "../features/logs/slices/auditSlice";
import dashboardReducer from "../features/dashboard/slices/dashboardSlice";
import departmentReducer from "../features/departments/slices/departmentSlice";
import teamReducer from "../features/teams/slices/teamSlice";
import attendanceReducer from "../features/attendance/slices/attendanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    task: taskReducer,
    audit: auditReducer,
    dashboard: dashboardReducer,
    departments: departmentReducer,
    teams: teamReducer,
    attendance: attendanceReducer,
  },
});
