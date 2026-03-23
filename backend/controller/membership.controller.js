import db from "../config/db.connect.js";
export const addMember = async (req, res) => {
  try {
    const {
      company_id,
      plan_id,
      full_name,
      phone,
      email,
      gender,
      age,
      address,
      join_date,
      status,
    } = req.body;

    // simple validation
    if (!company_id ||!plan_id|| !full_name || !phone || !join_date) {
      return res.status(400).json({
        success: false,
        message: "company_id,plan_id,full_name, phone and join_date are required",
      });
    }

    const query = `
      INSERT INTO members
      (company_id,plan_id,full_name, phone, email, gender, age, address, join_date, status)
      VALUES (?, ?,?,?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      company_id,
      plan_id,
      full_name,
      phone,
      email || null,
      gender || null,
      age || null,
      address || null,
      join_date,
      status || "active",
    ]);

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      memberId: result.insertId,
    });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
};
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const [member] = await db.query(
      `SELECT 
        m.id,
        m.company_id,
        m.full_name,
        m.phone,
        m.email,
        m.gender,
        m.age,
        m.address,
        m.join_date,
        m.status,
        mp.id AS membership_plan_id,
        mp.name AS plan_name,
        mp.duration,
        mp.price
      FROM members m
      LEFT JOIN membership_plans mp ON m.plan_id = mp.id
      WHERE m.id = ?`,
      [id]
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      member: member[0],
    });
  } catch (error) {
    console.error("Get Member By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch member",
      error: error.message,
    });
  }
};
export const getMembersByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    const [members] = await db.query(
      "SELECT * FROM members WHERE company_id = ?",
      [company_id],
    );

    res.status(200).json({
      success: true,
      total: members.length,
      members,
    });
  } catch (error) {
    console.error("Get Members By Company Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company members",
      error: error.message,
    });
  }
};
export const addMemberSchedule = async (req, res) => {
  try {
    const { company_id, member_id, start_time, end_time } = req.body;

    if (!company_id || !member_id || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "company_id, member_id, start_time and end_time are required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO member_schedules (company_id, member_id, start_time, end_time)
       VALUES (?, ?, ?, ?)`,
      [company_id, member_id, start_time, end_time],
    );

    res.status(201).json({
      success: true,
      message: "Member schedule added successfully",
      scheduleId: result.insertId,
    });
  } catch (error) {
    console.error("Add Member Schedule Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member schedule",
      error: error.message,
    });
  }
};
export const getAllMemberSchedules = async (req, res) => {
  try {
    const [schedules] = await db.query("SELECT * FROM member_schedules");

    res.status(200).json({
      success: true,
      total: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Get All Member Schedules Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch member schedules",
      error: error.message,
    });
  }
};
export const getSchedulesByMember = async (req, res) => {
  try {
    const { member_id } = req.params;

    const [schedules] = await db.query(
      "SELECT * FROM member_schedules WHERE member_id = ?",
      [member_id],
    );

    res.status(200).json({
      success: true,
      total: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Get Schedules By Member Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch member schedules",
      error: error.message,
    });
  }
};
export const getSchedulesByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;

    const [schedules] = await db.query(
      "SELECT * FROM member_schedules WHERE company_id = ?",
      [company_id],
    );

    res.status(200).json({
      success: true,
      total: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Get Schedules By Company Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company schedules",
      error: error.message,
    });
  }
};
