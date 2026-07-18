import AuthModel from "../models/auth.model.js";
import {
  BadRequestError,
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
import { onboardingHandoffService } from "../../../saas_platform/services/OnboardingHandoffService.js";

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

  getTenantInfo(tenant) {
    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantDbName: tenant.db_name,
    };
  }

  buildTokenPayload(user, tenantInfo) {
    return {
      id: user.id,
      role: user.role,
      status: user.status,
      department_id: user.department_id || null,
      team_id: user.team_id || null,
      reporting_manager_id: user.reporting_manager_id || null,
      ...tenantInfo,
    };
  }

  async createAuthenticatedSession(user, tenantInfo, device, ip) {
    const payload = this.buildTokenPayload(user, tenantInfo);
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

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        tenantSlug: tenantInfo.tenantSlug,
      },
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password, tenantSlug, device, ip }) {
    const normalizedSlug = String(tenantSlug || "").trim().toLowerCase();
    if (!normalizedSlug) {
      throw new BadRequestError("Workspace ID is required to sign in.");
    }

    let result;
    try {
      result = await tenantManager.getPoolBySlug(normalizedSlug);
    } catch (error) {
      if (String(error.message).includes("not found or inactive")) {
        throw new NotFoundError("Workspace not found or inactive.");
      }
      throw error;
    }
    const activeTenantInfo = this.getTenantInfo(result.tenant);

    return tenantContext.run(
      { tenantPool: result.pool, ...activeTenantInfo },
      async () => {
        const existingUser = await AuthModel.getUserByEmail(email);

        if (!existingUser) {
          throw new NotFoundError("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
          throw new BadRequestError("Invalid email or password");
        }
        if (existingUser.status !== "active") {
          throw new UnauthorizedError("This user account is not active.");
        }

        if (existingUser.two_factor_enabled === 1 || existingUser.two_factor_enabled === true) {
          const tempToken = await GenerateToken.Temp2FAToken({
            id: existingUser.id,
            email: existingUser.email,
            type: "2fa_temp",
            tenantId: activeTenantInfo.tenantId,
            tenantSlug: activeTenantInfo.tenantSlug,
            tenantDbName: activeTenantInfo.tenantDbName,
          });
          return {
            requires2FA: true,
            tempToken,
            message: "Two-factor authentication required. Please enter code from Microsoft Authenticator.",
          };
        }

        return this.createAuthenticatedSession(existingUser, activeTenantInfo, device, ip);
      },
    );
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token");
    }

    const decoded = await GenerateToken.verifyRefreshToken(refreshToken);
    if (!decoded.tenantSlug && !decoded.tenantDbName) {
      throw new UnauthorizedError("Refresh token is missing its workspace identity.");
    }

    const tenantResult = decoded.tenantDbName
      ? await tenantManager.getPoolByDbName(decoded.tenantDbName)
      : await tenantManager.getPoolBySlug(decoded.tenantSlug);
    const tenantInfo = this.getTenantInfo(tenantResult.tenant);

    return tenantContext.run(
      { tenantPool: tenantResult.pool, ...tenantInfo },
      async () => {
        const stored = await AuthModel.findRefreshToken(refreshToken);
        if (!stored || stored.length === 0) {
          throw new UnauthorizedError("Invalid refresh token");
        }

        const user = await AuthModel.getUserById(decoded.id);
        if (!user || user.status !== "active") {
          throw new UnauthorizedError("This user account is unavailable.");
        }

        await AuthModel.deleteRefreshToken(refreshToken);
        const payload = this.buildTokenPayload(user, tenantInfo);
        const newAccessToken = await GenerateToken.AccesToken(payload);
        const newRefreshToken = await GenerateToken.RefreshToken(payload);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await AuthModel.saveRefreshToken(
          user.id,
          newRefreshToken,
          stored[0].device,
          stored[0].ip_address,
          expiresAt,
        );

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
      },
    );
  }

  async logout(refreshToken) {
    if (!refreshToken) return;
    try {
      const decoded = await GenerateToken.verifyRefreshToken(refreshToken);
      const tenantResult = decoded.tenantDbName
        ? await tenantManager.getPoolByDbName(decoded.tenantDbName)
        : await tenantManager.getPoolBySlug(decoded.tenantSlug);
      const tenantInfo = this.getTenantInfo(tenantResult.tenant);
      await tenantContext.run(
        { tenantPool: tenantResult.pool, ...tenantInfo },
        () => AuthModel.deleteRefreshToken(refreshToken),
      );
    } catch {
      // Logout remains idempotent even when the cookie is already invalid.
    }
  }

  async exchangeOnboardingToken({ token, device, ip }) {
    return onboardingHandoffService.consume(token, async (handoff) => {
      const tenantResult = await tenantManager.getPoolBySlug(handoff.tenant_slug);
      if (Number(tenantResult.tenant.id) !== Number(handoff.tenant_id)) {
        throw new UnauthorizedError("The onboarding link does not match this workspace.");
      }
      const tenantInfo = this.getTenantInfo(tenantResult.tenant);

      return tenantContext.run(
        { tenantPool: tenantResult.pool, ...tenantInfo },
        async () => {
          const user = await AuthModel.getUserById(handoff.user_id);
          if (!user || user.status !== "active" || user.role !== "super_admin") {
            throw new UnauthorizedError("The paid workspace administrator is unavailable.");
          }
          return this.createAuthenticatedSession(user, tenantInfo, device, ip);
        },
      );
    });
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
