export const clientIpMiddleware = (req, res, next) => {
  req.clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  next();
};
