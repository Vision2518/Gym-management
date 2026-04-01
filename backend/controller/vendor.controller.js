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
      {
        id: vendor.id,
        email: vendor.email,
        role: "vendor",
        company_id: vendor.company_id,
      },
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
export const addMemberPlan = async (req, res) => {
  try {
    const { company_id, name, duration, price } = req.body;
    console.log(req.body);
    if ( !company_id || !name || !duration || !price) {
      return res.status(400).json({
        message: "All feild are required",
      });
    }
    const [existingPlan] = await db.query(
      "SELECT * FROM membership_plans WHERE name=?",
      [name],
    );
    if (existingPlan.length > 0) {
      return res.status(403).json({
        message: "Plan exists",
      });
    }
    await db.query(
      "INSERT INTO membership_plans (company_id,name, duration, price) VALUES (?,?,?,?)",
      [company_id, name, duration, price],
    );
    res.status(201).json({
      message: "plan added sucessfully",
    });
  } catch (error) {
    console.log("membership add error", error);
    res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};
export const getAllPlan = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        m.id,
        m.company_id,
        c.name AS company_name,
        m.name AS plan_name,
        m.duration,
        m.price
      FROM membership_plans m
      JOIN companies c ON m.company_id = c.id
    `);

    console.log("JOIN RESULT:", rows);

    res.status(200).json({
      success: true,
      count: rows.length,
      plans: rows,
    });
  } catch (error) {
    console.error("GetAllPlan Error:", error);
    res.status(500).json({
      success: false,
      message: "server error",
      error: error.message,
    });
  }
};
export const getPlanByCompany = async (req, res) => {
  try {
    const { company_id, company_name } = req.query;

    if (!company_id && !company_name) {
      return res.status(400).json({
        success: false,
        message: "Provide company_id or company_name",
      });
    }

    let query = `
      SELECT 
        m.id,
        m.company_id,
        c.name AS company_name,
        m.name AS plan_name,
        m.duration,
        m.price
      FROM membership_plans m
      JOIN companies c ON m.company_id = c.id
      WHERE 1=1
    `;

    let values = [];

    if (company_id) {
      query += " AND m.company_id = ?";
      values.push(company_id);
    }

    if (company_name) {
      query += " AND c.name = ?";
      values.push(company_name);
    }

    const [rows] = await db.query(query, values);

    res.status(200).json({
      success: true,
      count: rows.length,
      plans: rows,
    });
  } catch (error) {
    console.log("Get plan by company error:", error);
    res.status(500).json({
      success: false,
      message: "server error",
      error: error.message,
    });
  }
};
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      "SELECT *FROM membership_plans WHERE id=?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "plan not found" });
    }
    await db.execute("DELETE FROM membership_plans WHERE id=?", [id]);
    return res.status(200).json({ message: "plan deleted sucessfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "failed to delete", error: error.message });
  }
};
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, name, duration, price } = req.body;

    // At least one field must be provided
    if (
      company_id === undefined &&
      name === undefined &&
      duration === undefined &&
      price === undefined
    ) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    // Check if plan exists
    const [existingPlan] = await db.query(
      "SELECT * FROM membership_plans WHERE id = ?",
      [id]
    );

    if (existingPlan.length === 0) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    const currentPlan = existingPlan[0];

    const updatedCompanyId = company_id ?? currentPlan.company_id;
    const updatedName = name ?? currentPlan.name;
    const updatedDuration = duration ?? currentPlan.duration;
    const updatedPrice = price ?? currentPlan.price;

    // Check duplicate plan name only if name/company changes
    if (
      (name && name !== currentPlan.name) ||
      (company_id && company_id !== currentPlan.company_id)
    ) {
      const [planExists] = await db.query(
        "SELECT * FROM membership_plans WHERE company_id = ? AND name = ? AND id != ?",
        [updatedCompanyId, updatedName, id]
      );

      if (planExists.length > 0) {
        return res.status(400).json({
          message: "Plan name already exists for this company",
        });
      }
    }

    // Update plan
    await db.query(
      `UPDATE membership_plans
       SET company_id = ?, name = ?, duration = ?, price = ?
       WHERE id = ?`,
      [updatedCompanyId, updatedName, updatedDuration, updatedPrice, id]
    );

    return res.status(200).json({
      message: "Plan updated successfully",
    });
  } catch (error) {
    console.log("Update Plan Error:", error);
    return res.status(500).json({
      message: "Failed to update plan",
      error: error.message,
    });
  }
};
