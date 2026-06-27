import {
  cookieOptionsForAccessToken,
  cookieOptionsForRefreshToken,
} from "../config/cookieOptions.js";
import AuthService from "../services/auth.service.js";
import AuditService from "../services/audit.service.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { getPagination } from "../utils/pagination.js";
import { successResponse } from "../utils/response.js";
import authModel from "../models/auth.model.js";

class AuthController {
  register = asyncHandler(async (req, res) => {
    const { name, email, password, role_id, department_id } = req.body;
    const final_role_id = role_id ? Number(role_id) : 3; // Default to employee (3)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress;
    const device = req.headers["user-agent"];

    let profilePicUrl = null;
    if (req.file) {
      profilePicUrl = req.file.path;
    }

    const newUser = await AuthService.register({
      name,
      email,
      password,
      role_id: final_role_id,
      department_id: department_id ? Number(department_id) : null,
      device,
      ip,
      avatar: profilePicUrl,
    });

    try {
      await AuditService.log({
        user_id: newUser.id,
        action: AUDIT_ACTIONS.USER_REGISTER,
        entity_type: "user",
        entity_id: newUser.id,
        ip_address: ip,
        details: {
          user_id: newUser.id,
          user_email: email,
          user_name: name,
          device,
          summary: `New user registered: ${name} (${email})`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for user registration:", error.message);
    }

    return successResponse(res, "User registed successfully", newUser, 201);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress;

    const device = req.headers["user-agent"];

    const result = await AuthService.login({
      email,
      password,
      device,
      ip,
    });

    try {
      await AuditService.log({
        user_id: result.user.id,
        action: AUDIT_ACTIONS.USER_LOGIN,
        entity_type: "user",
        entity_id: result.user.id,
        ip_address: ip,
        details: {
          user_id: result.user.id,
          user_email: email,
          user_name: result.user.name,
          device,
          summary: `User logged in: ${result.user.name} (${email})`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for user login:", error.message);
    }

    res.cookie("accessToken", result?.accessToken, cookieOptionsForAccessToken);
    res.cookie(
      "refreshToken",
      result?.refreshToken,
      cookieOptionsForRefreshToken,
    );

    return successResponse(res, "Login successful", result?.user);
  });

  refresh = asyncHandler(async (req, res) => {
    const refreshToken = req?.cookies?.refreshToken;
    const tokens = await AuthService.refresh(refreshToken);

    res.cookie("accessToken", tokens.accessToken, cookieOptionsForAccessToken);
    res.cookie(
      "refreshToken",
      tokens.refreshToken,
      cookieOptionsForRefreshToken,
    );
    return successResponse(res, "Token refreshed");
  });

  logout = asyncHandler(async (req, res) => {
    const refreshToken = req?.cookies?.refreshToken;
    const userId = req.user?.id;

    await AuthService.logout(refreshToken);

    try {
      if (userId) {
        const ip =
          req.headers["x-forwarded-for"]?.split(",")[0] ||
          req.socket?.remoteAddress;

        await AuditService.log({
          user_id: userId,
          action: AUDIT_ACTIONS.USER_LOGOUT,
          entity_type: "user",
          entity_id: userId,
          ip_address: ip,
          details: {
            user_id: userId,
            summary: "User logged out",
          },
        });
      }
    } catch (error) {
      console.error("Audit log failed for user logout:", error.message);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return successResponse(res, "Logged out successfully");
  });

  profile = asyncHandler(async (req, res) => {
    const id = req?.user?.id;

    const user = await AuthService.profile(id);
    return successResponse(res, "User fetched successfully", user, 200);
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPagination(req.query);
    const result = await AuthService.getAllUsers({
      page,
      limit,
      offset,
    });

    return successResponse(res, "Users fetched successfully", result, 200);
  });

  chnageUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await AuthService.changeUserStatus(id, status);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.CHANGE_USER_STATUS,
        entity_type: "user",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          user_id: id,
          new_status: status,
          summary: `User status changed to ${status}`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for change user status:", error.message);
    }

    return successResponse(res, "User status changed successfully", result, 200);
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.CHANGE_PASSWORD,
        entity_type: "user",
        entity_id: req.user.id,
        ip_address: req.clientIp,
        details: {
          user_id: req.user.id,
          summary: "User password changed",
        },
      });
    } catch (error) {
      console.error("Audit log failed for change password:", error.message);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return successResponse(res, "Password changed successfully. Please login again.", null, 200);
  });

  // uploadAvatar = asyncHandler(async (req, res) => {
  //   try {
  //     if (!req.file) {
  //       return BadRequestError("No image provided");
  //     }
  //     const imagURL = req.file.path;
  //     const userId = req.user.id;

  //     const result = await authModel.uploadAvatar(userId, imagURL);

  //     return successResponse(res, "Profile picture updated successfully", result, 200)
  //   } catch (error) {
  //     console.error("error in uploading of avatar", error)
  //   }
  // })
}

export default new AuthController();
