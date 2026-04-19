import jwt from "jsonwebtoken";

export const isSuperAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Please log in to continue." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};

export const isVendor = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Please log in to continue." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.vendor = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};
