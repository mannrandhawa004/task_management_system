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
import * as OTPAuth from "otpauth";
import qrcode from "qrcode";
import { tenantContext } from "../../../saas_platform/context/tenantContext.js";
import { tenantManager } from "../../../saas_platform/services/TenantConnectionManager.js";

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

  async login({ email, password, tenantSlug, device, ip }) {
    let tenantPool = null;
    let activeTenantInfo = null;

    if (tenantSlug) {
      const result = await tenantManager.getPoolBySlug(tenantSlug);
      tenantPool = result.pool;
      activeTenantInfo = {
        tenantId: result.tenant.id,
        tenantSlug: result.tenant.slug,
        tenantDbName: result.tenant.db_name,
      };
    }

    const executeLoginLogic = async () => {
      const existingUser = await AuthModel.getUserByEmail(email);

      if (!existingUser) {
        throw new NotFoundError("Invalid email or password");
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        throw new BadRequestError("Invalid email or password");
      }

      if (existingUser.two_factor_enabled === 1 || existingUser.two_factor_enabled === true) {
        const tempToken = await GenerateToken.Temp2FAToken({
          id: existingUser.id,
          email: existingUser.email,
          type: "2fa_temp",
          tenantId: activeTenantInfo?.tenantId || null,
          tenantSlug: activeTenantInfo?.tenantSlug || null,
          tenantDbName: activeTenantInfo?.tenantDbName || null,
        });
        return {
          requires2FA: true,
          tempToken,
          message: "Two-factor authentication required. Please enter code from Microsoft Authenticator.",
        };
      }

      const payload = {
        id: existingUser?.id,
        role: existingUser?.role,
        status: existingUser?.status,
        department_id: existingUser?.department_id || null,
        team_id: existingUser?.team_id || null,
        reporting_manager_id: existingUser?.reporting_manager_id || null,
        tenantId: activeTenantInfo?.tenantId || null,
        tenantSlug: activeTenantInfo?.tenantSlug || null,
        tenantDbName: activeTenantInfo?.tenantDbName || null,
      };

      const accessToken = await GenerateToken.AccesToken(payload);
      const refreshToken = await GenerateToken.RefreshToken(payload);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await AuthModel.deleteTokenByDevice(existingUser.id, device, ip);
      await AuthModel.clearExpiredSessions(existingUser.id);
      const activeSessions = await AuthModel.countUserSession(existingUser.id);
      if (activeSessions >= 3) {
        await AuthModel.deleteOldestSession(existingUser?.id);
      }

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
          tenantSlug: activeTenantInfo?.tenantSlug || null,
        },
        accessToken,
        refreshToken,
      };
    };

    if (tenantPool) {
      return await new Promise((resolve, reject) => {
        tenantContext.run(
          { tenantPool, ...activeTenantInfo },
          () => executeLoginLogic().then(resolve).catch(reject)
        );
      });
    } else {
      return await executeLoginLogic();
    }
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

  async generate2FA(userId) {
    const user = await AuthModel.getUserById(userId);
    if (!user) throw new NotFoundError("User not found");

    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: "TaskManagementSystem",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    const uri = totp.toString();
    const qrCodeUrl = await qrcode.toDataURL(uri);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async verify2FASetup(userId, secret, token) {
    if (!secret || !token) {
      throw new BadRequestError("Secret and verification token are required");
    }

    const totp = new OTPAuth.TOTP({
      issuer: "TaskManagementSystem",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const delta = totp.validate({ token: String(token).trim(), window: 5 });
    if (delta === null) {
      throw new BadRequestError("Invalid verification code. Please check your Microsoft Authenticator app and try again.");
    }

    await AuthModel.updateUserTwoFactor(userId, secret, 1);
    return { success: true, message: "Two-Factor Authentication enabled successfully!" };
  }

  async disable2FA(userId, password) {
    const user = await AuthModel.getUserById(userId);
    if (!user) throw new NotFoundError("User not found");

    const userWithPassword = await AuthModel.getUserByEmail(user.email);
    const isMatch = await bcrypt.compare(password, userWithPassword.password);
    if (!isMatch) {
      throw new BadRequestError("Incorrect password. Cannot disable Two-Factor Authentication.");
    }

    await AuthModel.updateUserTwoFactor(userId, null, 0);
    return { success: true, message: "Two-Factor Authentication has been disabled." };
  }

  async verify2FALogin({ tempToken, otp, device, ip }) {
    if (!tempToken || !otp) {
      throw new BadRequestError("Token and OTP verification code are required");
    }

    let decoded;
    try {
      decoded = GenerateToken.verifyAccessToken(tempToken);
    } catch {
      throw new UnauthorizedError("Session expired. Please log in again.");
    }

    if (!decoded || decoded.type !== "2fa_temp" || !decoded.id) {
      throw new UnauthorizedError("Invalid authentication token.");
    }

    let tenantPool = null;
    if (decoded.tenantDbName) {
      tenantPool = await tenantManager.getTenantPool(decoded.tenantDbName);
    } else if (decoded.tenantSlug) {
      const result = await tenantManager.getPoolBySlug(decoded.tenantSlug);
      tenantPool = result.pool;
    }

    const executeVerify2FALogic = async () => {
      const user = await AuthModel.getUserById(decoded.id);
      if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
        throw new UnauthorizedError("Two-Factor Authentication is not enabled for this account.");
      }

      const totp = new OTPAuth.TOTP({
        issuer: "TaskManagementSystem",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.two_factor_secret),
      });

      const delta = totp.validate({ token: String(otp).trim(), window: 5 });
      if (delta === null) {
        throw new BadRequestError("Invalid authentication code. Please try again.");
      }

      const payload = {
        id: user.id,
        role: user.role,
        status: user.status,
        department_id: user.department_id || null,
        team_id: user.team_id || null,
        reporting_manager_id: user.reporting_manager_id || null,
        tenantId: decoded.tenantId || null,
        tenantSlug: decoded.tenantSlug || null,
        tenantDbName: decoded.tenantDbName || null,
      };

      const accessToken = await GenerateToken.AccesToken(payload);
      const refreshToken = await GenerateToken.RefreshToken(payload);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await AuthModel.deleteTokenByDevice(user.id, device, ip);
      await AuthModel.clearExpiredSessions(user.id);
      const activeSessions = await AuthModel.countUserSession(user.id);
      if (activeSessions >= 3) {
        await AuthModel.deleteOldestSession(user.id);
      }

      await AuthModel.saveRefreshToken(user.id, refreshToken, device, ip, expiresAt);

      const { password: _, two_factor_secret: __, ...userWithoutSecret } = user;

      return {
        user: {
          ...userWithoutSecret,
          tenantSlug: decoded.tenantSlug || null,
        },
        accessToken,
        refreshToken,
      };
    };

    if (tenantPool) {
      return await new Promise((resolve, reject) => {
        tenantContext.run(
          { tenantPool, tenantDbName: decoded.tenantDbName, tenantSlug: decoded.tenantSlug, tenantId: decoded.tenantId },
          () => executeVerify2FALogic().then(resolve).catch(reject)
        );
      });
    } else {
      return await executeVerify2FALogic();
    }
  }
}

export default new AuthServices();
