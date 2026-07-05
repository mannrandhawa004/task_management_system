import { ForbiddenError, NotFoundError } from "../utils/errorHandler.js";
import { executeQuery } from "../utils/dbQuery.js";

/**
 * Middleware to check access to team-specific actions.
 * Super Admin / Admin: Full Access.
 * Department Head: Can access teams belonging to their department.
 * Team Lead: Can access/manage teams they lead.
 * Team Member: Can view teams they belong to.
 */
export const teamAccessMiddleware = async (req, res, next) => {
  if (!req.user) {
    throw new ForbiddenError("Unauthorized");
  }

  // All authenticated employees can view teams and team member rosters
  if (req.method === "GET") {
    return next();
  }

  const userRole = req.user.role ? req.user.role.toLowerCase() : "";

  // Super Admin and Admin bypass team boundary checks
  if (userRole === "super_admin" || userRole === "admin") {
    return next();
  }

  const teamId = req.params.teamId || req.params.id;
  if (!teamId) {
    return next();
  }

  // Fetch team from DB to find department_id and lead_id
  const [team] = await executeQuery("SELECT * FROM teams WHERE id = ?", [teamId]);
  if (!team) {
    throw new NotFoundError("Team not found");
  }

  // Store team object in request context for controller reuse
  req.team = team;

  // 1. Check if user is Department Head of the team's department
  if (userRole === "dept_head" && Number(req.user.department_id) === Number(team.department_id)) {
    return next();
  }

  // 2. Check if user is the Team Lead
  if (Number(team.lead_id) === Number(req.user.id)) {
    return next();
  }

  throw new ForbiddenError("Access denied: You do not have permission to modify this team");
};

/**
 * Restricts team modifications (edit/delete/member-assign) to team leads or department heads/admins/managers.
 */
export const teamManageMiddleware = async (req, res, next) => {
  if (!req.user) {
    throw new ForbiddenError("Unauthorized");
  }

  const userRole = req.user.role ? req.user.role.toLowerCase() : "";

  if (userRole === "super_admin" || userRole === "admin" || userRole === "manager" || userRole === "project_manager") {
    return next();
  }

  const teamId = req.params.teamId || req.params.id;
  if (!teamId) {
    return next();
  }

  // If team is already loaded by teamAccessMiddleware
  let team = req.team;
  if (!team) {
    const [fetchedTeam] = await executeQuery("SELECT * FROM teams WHERE id = ?", [teamId]);
    if (!fetchedTeam) {
      throw new NotFoundError("Team not found");
    }
    team = fetchedTeam;
    req.team = team;
  }

  // 1. Department Head of that team's department can manage
  if (userRole === "dept_head" && Number(req.user.department_id) === Number(team.department_id)) {
    return next();
  }

  // 2. Team Lead can manage members (regardless of global role string)
  if (Number(team.lead_id) === Number(req.user.id)) {
    return next();
  }

  throw new ForbiddenError("Access denied: Only Department Heads, Managers, or Team Leads can manage this team");
};
