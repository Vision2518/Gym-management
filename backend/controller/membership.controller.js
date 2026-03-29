import db from "../config/db.connect.js";
export const addMember = async (req, res) => {
  try {
    const {
      company_id,
      plan_id,
      schedule_id,
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
    if (
      !company_id ||
      !schedule_id ||
      !plan_id ||
      !full_name ||
      !phone ||
      !join_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "company_id,plan_id,schedule_id,full_name, phone and join_date are required",
      });
    }
    const [existingMember] = await db.query(
      "SELECT * FROM members WHERE email = ? AND phone = ?",
      [email, phone],
    );
    if (existingMember.length > 0) {
      return res.status(200).json({ message: "member exists" });
    }
    const query = `
      INSERT INTO members
      (company_id,plan_id,schedule_id,full_name, phone, email, gender, age, address, join_date, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `;

    const [result] = await db.query(query, [
      company_id,
      plan_id,
      schedule_id,
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
      [id],
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
    const company_id = req.vendor?.company_id;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id not found in authenticated vendor token",
      });
    }

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
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT *FROM members WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "member not exist" });
    }
    await db.execute("DELETE FROM members WHERE id=?", [id]);
    res.status(200).json({ message: "member deleted!" });
  } catch (error) {
    res.status(500).json({ message: "failed to delete", error: error.message });
  }
};
export const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      company_id,
      email,
      phone,
      gender,
      age,
      plan_id,
      address,
      status,
      schedule_id,
    } = req.body;

    // 1. Check existing member
    const [existing] = await db.query("SELECT * FROM members WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Member not found with id ${id}`,
      });
    }

    const oldMember = existing[0];
    // 2. Keep old values if new ones not provided
    const updatedFullName = full_name || oldMember.full_name;
    const updatedCompanyId = company_id || oldMember.company_id;
    const updatedEmail = email || oldMember.email;
    const updatedPhone = phone || oldMember.phone;
    const updatedAddress = address || oldMember.address;
    const updatedGender = gender || oldMember.gender;
    const updatedAge = age || oldMember.age;
    const updatedPlanId = plan_id || oldMember.plan_id;
    const updatedStatus = status || oldMember.status;
    const updatedSchedule_Id = schedule_id || oldMember.schedule_id;

    // 3. Optional: Check if plan exists if plan_id changed
    if (plan_id && plan_id !== oldMember.plan_id) {
      const [plan] = await db.query(
        "SELECT * FROM membership_plans WHERE id = ?",
        [plan_id],
      );

      if (plan.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Membership plan not found with id ${plan_id}`,
        });
      }
    }

    // 4. Update member
    await db.query(
      `UPDATE members 
       SET full_name = ?,company_id=?, email = ?, phone = ?, address = ?, gender = ?, age = ?, plan_id = ?, status = ?,schedule_id=?
       WHERE id = ?`,
      [
        updatedFullName,
        updatedCompanyId,
        updatedEmail,
        updatedPhone,
        updatedAddress,
        updatedGender,
        updatedAge,
        updatedPlanId,
        updatedStatus,
        updatedSchedule_Id,
        id,
      ],
    );

    // 5. Fetch updated member
    const [updatedMember] = await db.query(
      "SELECT * FROM members WHERE id = ?",
      [id],
    );

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      member: updatedMember[0],
    });
  } catch (error) {
    console.error("Update Member Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update member",
      error: error.message,
    });
  }
};
export const addMemberSchedule = async (req, res) => {
  try {
    const { company_id, start_time, end_time } = req.body;

    if (!company_id || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "company_id, member_id, start_time and end_time are required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO member_schedules (company_id, start_time, end_time)
       VALUES (?,?, ?)`,
      [company_id, start_time, end_time],
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
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      "SELECT * FROM member_schedules WHERE id=?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "schedule does not exist" });
    }
    await db.execute("DELETE FROM member_schedules WHERE id=?", [id]);
    return res.status(200).json({ message: "schedule deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "failed to delete schedule", error: error.message });
  }
};
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params; // schedule id from URL
    const { company_id, start_time, end_time } = req.body;

    if (!company_id || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "company_id, start_time and end_time are required",
      });
    }

    // Check if schedule exists
    const [existing] = await db.query(
      "SELECT * FROM member_schedules WHERE id = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member schedule not found",
      });
    }

    // Update schedule
    await db.query(
      `UPDATE member_schedules 
       SET company_id = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [company_id, start_time, end_time, id],
    );

    res.status(200).json({
      success: true,
      message: "Member schedule updated successfully",
    });
  } catch (error) {
    console.error("Update Member Schedule Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update member schedule",
      error: error.message,
    });
  }
};
/*export const getSchedulesByMember = async (req, res) => {
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
};*/
export const getSchedulesByCompany = async (req, res) => {
  try {
    const company_id = req.vendor?.company_id;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "company_id not found in authenticated vendor token",
      });
    }

    const [schedules] = await db.query(
      `SELECT 
        ms.id,
        ms.company_id,
        ms.member_id,
        m.full_name,
        ms.start_time,
        ms.end_time
      FROM member_schedules ms
      JOIN members m ON ms.member_id = m.id
      WHERE ms.company_id = ?`,
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
