import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.connect.js";

export const authLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. check user exists
    const [rows] = await db.execute(
      "SELECT * FROM super_admin WHERE email = ?",
      [email],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const admin = rows[0];

    // 2. compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. token generate
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      "secretkey", // later .env ma rakhne
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
