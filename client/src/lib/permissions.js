// Central permissions utility — single source of truth for all role checks across the app

/** Full system administrators (see all data, manage everything) */
export const isSuperAdmin = (user) => {
  const role = user?.role?.toLowerCase();
  return role === "super_admin";
};

/** Admin and Super Admin — full project/task visibility, but admin cannot create departments */
export const isAdmin = (user) => {
  const role = user?.role?.toLowerCase();
  return role === "admin" || role === "super_admin";
};

/** HR — can manage employees but cannot see all company projects/tasks or create departments */
export const isHR = (user) => {
  const role = user?.role?.toLowerCase();
  return role === "hr";
};

/** Any role that can manage employees (add/edit/delete) */
export const canManageEmployees = (user) => {
  return isAdmin(user) || isHR(user);
};

export const isEmployee = (user) => user?.role === "employee";

export const canCreateProject = (user) => isAdmin(user);
export const canDeleteProject = (user) => isAdmin(user);

export const canUpdateProject = (user, project) => {
  if (isAdmin(user)) return true;
  return project?.role === "manager";
};

export const canAddProjectMember = (user, project) => {
  if (isAdmin(user)) return true;
  return project?.role === "manager";
};

export const canRemoveProjectMember = (user, project) => {
  if (isAdmin(user)) return true;
  return project?.role === "manager";
};

export const canManageProjectMembers = (user, project) => {
  if (!user || !project) return false;
  if (isAdmin(user)) return true;
  const projectRole = project?.role?.toLowerCase();
  return projectRole === "manager";
};
