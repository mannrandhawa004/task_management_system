import GenerateToken from "../utils/generateToken.js";
import { UnauthorizedError } from "../utils/errorHandler.js";
import { tenantContext } from "../../../saas_platform/context/tenantContext.js";
import { tenantManager } from "../../../saas_platform/services/TenantConnectionManager.js";

/**
 * Multi-Tenant Authentication & Query Isolation Middleware.
 * 1. Verifies JWT access token.
 * 2. Extracts tenant identity (`tenantDbName` or `tenantSlug`) from JWT or `X-Tenant-Slug` header.
 * 3. Acquires dedicated MySQL connection pool from `TenantConnectionManager`.
 * 4. Wraps request execution (`next()`) inside Node.js `AsyncLocalStorage` (`tenantContext.run`).
 */
export const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const decoded = await GenerateToken.verifyAccessToken(token);
    req.user = decoded;

    // Resolve tenant identity from JWT payload or HTTP headers
    const tenantDbName = decoded.tenantDbName || req.headers["x-tenant-db-name"];
    const tenantSlug = decoded.tenantSlug || req.headers["x-tenant-slug"];

    let tenantPool = null;
    let resolvedDbName = tenantDbName;

    if (tenantDbName) {
      tenantPool = await tenantManager.getTenantPool(tenantDbName);
    } else if (tenantSlug) {
      const result = await tenantManager.getPoolBySlug(tenantSlug);
      tenantPool = result.pool;
      resolvedDbName = result.tenant.db_name;
    }

    // Attach tenant details to req for convenience
    req.tenantPool = tenantPool;
    req.tenantDbName = resolvedDbName;
    req.tenantSlug = tenantSlug || decoded.tenantSlug;

    // Run downstream controllers/models inside AsyncLocalStorage tenant execution context
    const store = {
      tenantPool,
      tenantDbName: resolvedDbName,
      tenantSlug: req.tenantSlug,
      tenantId: decoded.tenantId,
      user: decoded,
    };

    tenantContext.run(store, () => next());
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: error.message || "Invalid token",
    });
  }
};
