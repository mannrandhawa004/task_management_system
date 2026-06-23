export const cookieOptionsForAccessToken = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 8 * 60 * 60 * 1000,
};

export const cookieOptionsForRefreshToken = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
