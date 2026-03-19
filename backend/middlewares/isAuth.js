export const authorizesRoles = (...roles) =>{
    return(req, res, next) =>{
        const {role} = req.admin;
        if(!roles.includes(role))
        return res.status(403).json({message:"Unauthorize access"});
        next();
    };
};

export const authorizeVendor = (...roles) => {
  return (req, res, next) => {
    const { role } = req.vendor;

    if (!roles.includes(role)) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    next();
  };
};