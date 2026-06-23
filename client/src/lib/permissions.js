export const isAdmin = (user) => user?.role === "admin";
export const isUser = (user) => user?.role === "user";
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
