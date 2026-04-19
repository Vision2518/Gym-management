const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const user = req.admin || req.vendor || req.member;

    if (!user) {
      return res.status(401).json({
        message: "Please log in to continue.",
      });
    }

    const { role } = user;

    if (!roles.includes(role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
};
export default authorizeRoles;
