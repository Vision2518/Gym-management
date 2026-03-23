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
      { expiresIn: "7d" },
    );
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
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
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO vendors (company_id, username, email, password, number) VALUES (?, ?, ?, ?, ?)",
      [company_id, username, email, hashedPassword, number || null],
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
export const getAllVendor = async (req, res) => {
  try {
    const [vendor] = await db.execute("SELECT * FROM vendors");
    if (vendor.length === 0) {
      return res.status(404).json({ message: "no vendors available" });
    }
    return res.status(200).json({ vendor: vendor[0] });
  } catch (error) {
    console.log("fetching error", error);
  }
};
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM WHERE vendors id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "vendor not found" });
    }
    await db.execute("DELETE FROM vendors WHERE id=?", [id]);
    res.status(200).json({ message: "vendor deleted sucessfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete vendor", error: error.message });
  }
};
export const addCompany = async (req, res) => {
  const { name, email, number, address } = req.body;
  try {
    if (!name || !email || !number || !address) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }
    const [existingCompany] = await db.execute(
      "SELECT email FROM companies WHERE email = ?",
      [email],
    );
    if (existingCompany.length > 0) {
      return res.status(400).json({ message: "Company already exists" });
    }
    await db.execute(
      "INSERT INTO companies (name, email, number, address) VALUES (?, ?, ?, ?)",
      [name, email, number, address],
    );
    res.status(201).json({ message: "Company added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add company", error: error.message });
  }
};
export const getAllCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM companies ");
    if (rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json({
      message: "Company fetched successfully",
      company: rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM companies WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }
    await db.execute("DELETE FROM companies WHERE id = ?", [id]);
    res.status(200).json({
      message: "company deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete company", error: error.message });
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
