import dotenv from "dotenv";

dotenv.config({ quiet: true });

const isProduction = process.env.NODE_ENV === "production";
const configuredDomain = String(process.env.COOKIE_DOMAIN || "").trim();

const sharedCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  ...(configuredDomain ? { domain: configuredDomain } : {}),
};

export const cookieOptionsForAccessToken = {
  ...sharedCookieOptions,
  maxAge: 8 * 60 * 60 * 1000,
};

export const cookieOptionsForRefreshToken = {
  ...sharedCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const cookieOptionsForClear = sharedCookieOptions;
