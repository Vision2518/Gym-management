import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.connect.js";
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    // 1. check user exists
    const [rows] = await db.execute(
      "SELECT * FROM super_admin WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const admin = rows[0];

    // 2. compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. token generate
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "super_admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);
    res.cookie("token", token, {
      httpOnly: true,
      secure: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const signout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "signout successful" });
  } catch (error) {
    res.status(400).json({ message: "server error", error });
  }
};
export const addVendor = async (req, res) => {
  try {
    const { company_id, username, email, password, number } = req.body;

    if (!company_id || !username || !email || !password) {
      return res.status(400).json({
        message: "company_id, username, email and password are required",
      });
    }
    const [existingVendor] = await db.query(
      "SELECT * FROM vendors WHERE username = ?",
      [username],
    );
    if (existingVendor.length > 0) {
      return res
        .status(400)
        .json({ message: "Vendor username already exists" });
    }
    const [existingEmail] = await db.query(
      "SELECT * FROM vendors WHERE email = ?",
      [email],
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }
    await db.query(
      "INSERT INTO vendors (company_id, username, email, password, number) VALUES (?, ?, ?, ?, ?)",
      [company_id, username, email, password, number || null],
    );
    res.status(201).json({
      message: "Vendor added successfully",
    });
  } catch (error) {
    console.log("Add Vendor Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const getVendor = async (req, res) => {
  try {
    const { email } = req.params; //passing email to the url to get vendor by email
    const [rows] = await db.execute(
      "SELECT id,company_id,username,email,number,package_type FROM vendors WHERE email = ?",
      [email],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    const vendor = rows[0];
    res.status(200).json({
      message: "Vendor fetched successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.clearCookie("token");
        return res.status(401).json({ message: "Token expired or invalid" });
      }
      res.status(200).json({
        message: "Token is valid",
        user: decoded,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
