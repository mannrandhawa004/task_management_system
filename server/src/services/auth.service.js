import AuthModel from "../models/auth.model.js";
import { executeQuery } from "../utils/dbQuery.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import GenerateToken from "../utils/generateToken.js";
import { formatPagination } from "../utils/pagination.js";

class AuthServices {
  async register({ name, email, password, role_id, department_id, device, ip, avatar }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await AuthModel.registerUserQuery({
      name,
      email,
      password: hashedPassword,
      role_id,
      department_id,
      avatar
    });

    const user = await AuthModel.getUserById(result.insertId);

    const payload = {
      id: user.id,
      role: user.role,
      status: user.status,
      department_id: user.department_id || null,
      team_id: user.team_id || null,
      reporting_manager_id: user.reporting_manager_id || null,
    };

    const accessToken = await GenerateToken.AccesToken(payload);

    const refreshToken = await GenerateToken.RefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await AuthModel.saveRefreshToken(
      user.id,
      refreshToken,
      device,
      ip,
      expiresAt,
    );

    return user

  }

  async login({ email, password, device, ip }) {
    const existingUser = await AuthModel.getUserByEmail(email);

    if (!existingUser) {
      throw new NotFoundError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      throw new BadRequestError("Invalid email or password");
    }
    // console.log(existingUser);

    const payload = {
      id: existingUser?.id,
      role: existingUser?.role,
      status: existingUser?.status,
      department_id: existingUser?.department_id || null,
      team_id: existingUser?.team_id || null,
      reporting_manager_id: existingUser?.reporting_manager_id || null,
    };

    // Here i created a token for multi-session authentication
    const accessToken = await GenerateToken.AccesToken(payload);
    const refreshToken = await GenerateToken.RefreshToken(payload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Deleting the previous token if user try to login from same device and ip
    await AuthModel.deleteTokenByDevice(existingUser.id, device, ip);
    // Clearing or deletng the refresh_tokens which is expired
    await AuthModel.clearExpiredSessions(existingUser.id);
    // counting the refresh_token which is not expired
    const activeSessions = await AuthModel.countUserSession(existingUser.id);
    // checking for the condition if there is more than 3 refresh_token , means user try to login in 4 devices then deleting the odest one
    if (activeSessions >= 3) {
      await AuthModel.deleteOldestSession(existingUser?.id);
    }

    // after deleting the oldest one token , we can insert the new one refresh token
    await AuthModel.saveRefreshToken(
      existingUser.id,
      refreshToken,
      device,
      ip,
      expiresAt,
    );

    return {
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
        avatar: existingUser.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token");
    }

    const stored = await AuthModel.findRefreshToken(refreshToken);

    if (!stored || stored.length === 0) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const decoded = await GenerateToken.verifyRefreshToken(refreshToken);
   

    const userId = decoded.id;
    const result = await AuthModel.getUserById(userId)
  
    await AuthModel.deleteRefreshToken(refreshToken);

    const payload = {
      id: userId,
      role: result.role,
      status: result.status
    };

    const newAccessToken = await GenerateToken.AccesToken(payload);
    const newRefreshToken = await GenerateToken.RefreshToken(payload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await AuthModel.saveRefreshToken(
      userId,
      newRefreshToken,
      stored[0].device,
      stored[0].ip_address,
      expiresAt,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken) {
    if (!refreshToken) return;
    await AuthModel.deleteRefreshToken(refreshToken);
  }

  async profile(id) {
    const user = await AuthModel.profile(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getAllUsers({ page, limit, offset }) {
    const [users, total] = await Promise.all([
      AuthModel.getAllUsers(limit, offset),

      AuthModel.countUsers(),
    ]);

    return formatPagination({
      data: users,
      total,
      page,
      limit,
    });
  }

  async changeUserStatus(id, status) {
    // If you chose Option A (Toggle):
    // const result = await AuthModel.changeUserStatus(id);

    // OR If you chose Option B (Explicit update):
    const result = await AuthModel.changeUserStatus(id, status);

    if (!result) {
      throw new Error("User record not found or update failed.");
    }

    return result;
  }

  async changePassword({ userId, currentPassword, newPassword }) {
    const user = await AuthModel.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userWithPassword = await AuthModel.getUserByEmail(user.email);
    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password);

    if (!isMatch) {
      throw new BadRequestError("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await AuthModel.updatePassword(userId, hashedPassword);
    await AuthModel.deleteAllUserTokens(userId);

    return {
      id: user.id,
      email: user.email,
    };
  }
}

export default new AuthServices();
