import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.connect.js";

const isValidPhoneNumber = (value) => /^\d{10}$/.test(String(value || "").trim());
const isStrongPassword = (value) =>
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/.test(
    String(value || ""),
  );

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // 1. check user exists
    const [rows] = await db.execute(
      "SELECT email,password FROM super_admin WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No account was found with this email address." });
    }

    const admin = rows[0];

    // 2. compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    // 3. token generate
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "super_admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful.",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to log in right now. Please try again later." });
  }
};
export const signout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "You have been signed out successfully." });
  } catch (error) {
    res.status(400).json({ message: "Unable to sign out right now. Please try again." });
  }
};
export const addVendor = async (req, res) => {
  try {
    const { company_id, username, email, password, number } = req.body;

    if (!company_id || !username || !email || !password) {
      return res.status(400).json({
        message: "Company, username, email, and password are required.",
      });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include letters, numbers, and a symbol.",
      });
    }
    const [existingVendor] = await db.query(
      "SELECT username FROM vendors WHERE username = ?",
      [username],
    );
    if (existingVendor.length > 0) {
      return res
        .status(400)
        .json({ message: "This vendor username is already in use." });
    }
    const [existingEmail] = await db.query(
      "SELECT email FROM vendors WHERE email = ?",
      [email],
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "This email address is already in use." });
    }
    if (number) {
      if (!isValidPhoneNumber(number)) {
        return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
      }
      const [existingNumber] = await db.query(
        "SELECT number FROM vendors WHERE number = ?",
        [number],
      );
      if (existingNumber.length > 0) {
        return res.status(400).json({ message: "This phone number is already in use." });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO vendors (company_id, username, email, password, number) VALUES (?, ?, ?, ?, ?)",
      [company_id, username, email, hashedPassword, number || null],
    );
    res.status(201).json({
      message: "Vendor added successfully.",
    });
  } catch (error) {
    console.log("Add Vendor Error:", error);
    res.status(500).json({
      message: "Unable to add the vendor right now. Please try again later.",
    });
  }
};
export const getAllVendor = async (req, res) => {
  try {
    const [vendor] = await db.execute("SELECT * FROM vendors ORDER BY id DESC");
    if (vendor.length === 0) {
      return res.status(404).json({ message: "No vendors found." });
    }
    return res.status(200).json({ vendors:vendor});
  } catch (error) {
    console.log("fetching error", error);
  }
};
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT id FROM vendors WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found." });
    }
    await db.execute("DELETE FROM vendors WHERE id=?", [id]);
    res.status(200).json({ message: "Vendor deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to delete the vendor right now. Please try again later." });
  }
};
export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params; // vendor id from URL
    const { company_id, username, email, password, number } = req.body;

    if (!company_id || !username || !email) {
      return res.status(400).json({
        message: "Company, username, and email are required.",
      });
    }

    // Check if vendor exists
    const [existingVendor] = await db.query(
      "SELECT * FROM vendors WHERE id = ?",
      [id]
    );

    if (existingVendor.length === 0) {
      return res.status(404).json({
        message: "Vendor not found.",
      });
    }

    if (number && !isValidPhoneNumber(number)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits.",
      });
    }

    // Check if username already exists for another vendor
    const [usernameExists] = await db.query(
      "SELECT * FROM vendors WHERE username = ? AND id != ?",
      [username, id]
    );

    if (usernameExists.length > 0) {
      return res.status(400).json({
        message: "This vendor username is already in use.",
      });
    }

    // Check if email already exists for another vendor
    const [emailExists] = await db.query(
      "SELECT * FROM vendors WHERE email = ? AND id != ?",
      [email, id]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({
        message: "This email address is already in use.",
      });
    }

    if (number) {
      const [numberExists] = await db.query(
        "SELECT * FROM vendors WHERE number = ? AND id != ?",
        [number, id]
      );

      if (numberExists.length > 0) {
        return res.status(400).json({
          message: "This phone number is already in use.",
        });
      }
    }

    let updateQuery = `
      UPDATE vendors 
      SET company_id = ?, username = ?, email = ?, number = ?
    `;
    let queryParams = [company_id, username, email, number || null];

    if (password && !isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include letters, numbers, and a symbol.",
      });
    }

    // If password is provided, update password too
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = ?`;
      queryParams.push(hashedPassword);
    }

    updateQuery += ` WHERE id = ?`;
    queryParams.push(id);

    await db.query(updateQuery, queryParams);

    res.status(200).json({
      message: "Vendor updated successfully.",
    });
  } catch (error) {
    console.log("Update Vendor Error:", error);
    res.status(500).json({
      message: "Unable to update the vendor right now. Please try again later.",
    });
  }
};
export const addCompany = async (req, res) => {
  const { name, email, number, address } = req.body;
  try {
    if (!name || !email || !number || !address) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    if (!isValidPhoneNumber(number)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
    }
    const [existingCompany] = await db.execute(
      "SELECT email FROM companies WHERE email = ?",
      [email],
    );
    if (existingCompany.length > 0) {
      return res.status(400).json({ message: "A company with this email address already exists." });
    }
    const [existingNumber] = await db.execute(
      "SELECT number FROM companies WHERE number = ?",
      [number],
    );
    if (existingNumber.length > 0) {
      return res.status(400).json({ message: "This contact number is already in use." });
    }
    await db.execute(
      "INSERT INTO companies (name, email, number, address) VALUES (?, ?, ?, ?)",
      [name, email, number, address],
    );
    res.status(201).json({ message: "Company added successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to add the company right now. Please try again later." });
  }
};
export const getAllCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM companies ORDER BY id DESC");
    if (rows.length === 0) {
      return res.status(404).json({ message: "Company not found." });
    }
    res.status(200).json({
      message: "Companies fetched successfully.",
      company: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch companies right now. Please try again later." });
  }
};
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM companies WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Company not found." });
    }

    const [vendors] = await db.execute(
      "SELECT id FROM vendors WHERE company_id = ? LIMIT 1",
      [id],
    );
    if (vendors.length > 0) {
      return res.status(400).json({
        message:
          "This company cannot be deleted because one or more vendors are still assigned to it.",
      });
    }

    await db.execute("DELETE FROM companies WHERE id = ?", [id]);
    res.status(200).json({
      message: "Company deleted successfully.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to delete the company right now. Please try again later." });
  }
};
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, number, address } = req.body;

    // Check if company exists
    const [existingCompany] = await db.execute(
      "SELECT * FROM companies WHERE id = ?",
      [id]
    );

    if (existingCompany.length === 0) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    // Use old values if new values are not provided
    const currentCompany = existingCompany[0];

    const updatedName = name || currentCompany.name;
    const updatedEmail = email || currentCompany.email;
    const updatedNumber = number || currentCompany.number;
    const updatedAddress = address || currentCompany.address;

    if (!isValidPhoneNumber(updatedNumber)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits.",
      });
    }

    // Check if email already exists for another company (only if email is changed)
    if (email) {
      const [existingEmail] = await db.execute(
        "SELECT * FROM companies WHERE email = ? AND id != ?",
        [email, id]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({
          message: "This email address is already in use.",
        });
      }
    }

    if (number) {
      const [existingNumber] = await db.execute(
        "SELECT * FROM companies WHERE number = ? AND id != ?",
        [number, id]
      );

      if (existingNumber.length > 0) {
        return res.status(400).json({
          message: "This contact number is already in use.",
        });
      }
    }

    // Update company
    await db.execute(
      `UPDATE companies 
       SET name = ?, email = ?, number = ?, address = ?
       WHERE id = ?`,
      [updatedName, updatedEmail, updatedNumber, updatedAddress, id]
    );

    res.status(200).json({
      message: "Company updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update the company right now. Please try again later.",
    });
  }
};
export const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalCompanies }]] = await db.query("SELECT COUNT(*) AS totalCompanies FROM companies");
    const [[{ totalVendors }]] = await db.query("SELECT COUNT(*) AS totalVendors FROM vendors");
    const [[{ totalMembers }]] = await db.query("SELECT COUNT(*) AS totalMembers FROM members");
    const [[{ totalRevenue }]] = await db.query("SELECT COALESCE(SUM(paid_amount), 0) AS totalRevenue FROM payments");

    res.status(200).json({ totalCompanies, totalVendors, totalMembers, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: "Unable to load dashboard data right now. Please try again later." });
  }
};
export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Please log in to continue." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.clearCookie("token");
        return res.status(401).json({ message: "Your session has expired. Please log in again." });
      }
      res.status(200).json({
        message: "Session verified successfully.",
        user: decoded,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to verify your session right now. Please try again later." });
  }
};
