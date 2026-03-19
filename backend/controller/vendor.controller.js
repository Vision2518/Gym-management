import db from "../config/db.connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 1. Check if vendor exists
    const [rows] = await db.execute(
      `SELECT v.*, c.name AS company_name
       FROM vendors v
       JOIN companies c ON v.company_id = c.id
       WHERE v.email = ?`,
      [email],
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    const vendor = rows[0];
    console.log(vendor);
    // 2. Compare password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // 3. Generate token
    const token = jwt.sign(
      { id: vendor.id, email: vendor.email, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    //console.log("JWT_SECRET:", process.env.JWT_SECRET);
    //console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);

    // 4. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // use true only in HTTPS production
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Response
    res.json({
      message: "Vendor login successful",
      token,
      vendor: {
        id: vendor.id,
        username: vendor.username,
        email: vendor.email,
        company_id: vendor.company_id,
        company_name: vendor.company_name,
        package_type: vendor.package_type,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const addMemberPlan=async(req,res)=>{
  try {
    
  } catch (error) {
    
  }
}