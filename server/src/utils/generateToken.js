import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "access_secret_key";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key";

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

class GenerateToken {
  /**
   * Generate a short-lived JWT access token.
   * @param {object} payload - Data to encode (e.g. { id, role, status })
   * @returns {Promise<string>} Signed JWT string
   */
  async AccesToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate a long-lived JWT refresh token.
   * @param {object} payload - Data to encode (e.g. { id, role, status })
   * @returns {Promise<string>} Signed JWT string
   */
  async RefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  }

  async Temp2FAToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "10m",
    });
  }

  /**
   * Verify and decode an access token.
   * @param {string} token - JWT string
   * @returns {object} Decoded payload
   */
  verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  }

  /**
   * Verify and decode a refresh token.
   * @param {string} token - JWT string
   * @returns {object} Decoded payload
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  }
}

export default new GenerateToken();
