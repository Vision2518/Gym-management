const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const user = req.admin || req.vendor || req.member;

    if (!user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const { role } = user;

    if (!roles.includes(role)) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    next();
  };
};
export default authorizeRoles;
