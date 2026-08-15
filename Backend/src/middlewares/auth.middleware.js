// Verifies JWT from Authorization header, checks blacklist, attaches req.user
module.exports = async (req, res, next) => {
  // TODO: verify token, reject if blacklisted, decode -> req.user
  next();
};
