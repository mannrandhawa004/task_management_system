import LeavePolicyService from "../services/leavePolicy.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

class LeavePolicyController {
  getPolicies = asyncHandler(async (req, res) => {
    const policies = await LeavePolicyService.getAllPolicies();
    return successResponse(res, "Leave policies fetched", policies, 200);
  });

  createPolicy = asyncHandler(async (req, res) => {
    const policy = await LeavePolicyService.createPolicy(req.body);
    return successResponse(res, "Leave policy created successfully", policy, 201);
  });

  updatePolicy = asyncHandler(async (req, res) => {
    const policy = await LeavePolicyService.updatePolicy(req.params.id, req.body);
    return successResponse(res, "Leave policy updated successfully", policy, 200);
  });

  allocateQuotas = asyncHandler(async (req, res) => {
    const year = req.body.year ? Number(req.body.year) : new Date().getFullYear();
    const result = await LeavePolicyService.allocateAnnualQuotas(year);
    return successResponse(res, `Allocated annual quotas for ${year}`, result, 200);
  });

  getMyBalances = asyncHandler(async (req, res) => {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const balances = await LeavePolicyService.getEmployeeBalances(req.user.id, year);
    return successResponse(res, "Employee leave balances fetched", balances, 200);
  });

  getSalaryReport = asyncHandler(async (req, res) => {
    const month = req.query.month ? Number(req.query.month) : null;
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const report = await LeavePolicyService.getSalaryReport({ month, year });
    return successResponse(res, "Salary report generated successfully", report, 200);
  });
}

export default new LeavePolicyController();
