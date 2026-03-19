  import jwt from "jsonwebtoken";

export const isSuperAdmin = async(req, res, next)=>{
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message:"You have to login first",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
       return res.status(401).json({ message: "Invalid or expired token" });
    }
};