import GenerateToken from "../utils/generateToken.js";
import { UnauthorizedError } from "../utils/errorHandler.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const decoded = await GenerateToken.verifyAccessToken(token);

    req.user = decoded;
    next();
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
      message: "Invalid token",
    });
  }
};
