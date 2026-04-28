import db from "../config/db.connect.js";

const isValidPhoneNumber = (value) => /^\d{10}$/.test(String(value || "").trim());

export const addMember = async (req, res) => {
  try {
    const vendorCompanyId = req.vendor?.company_id;
    const {
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
      !vendorCompanyId ||
      !schedule_id ||
      !plan_id ||
      !full_name ||
      !phone ||
      !join_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Plan, schedule, full name, phone number, and join date are required.",
      });
    }
    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits.",
      });
    }
    const [existingMember] = await db.query(
      "SELECT * FROM members WHERE email = ? AND phone = ?",
      [email, phone],
    );
    if (existingMember.length > 0) {
      return res.status(200).json({ message: "A member with the same email and phone number already exists." });
    }
    const [existingPhone] = await db.query(
      "SELECT phone FROM members WHERE phone = ?",
      [phone],
    );
    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already in use.",
      });
    }
    const [plan] = await db.query(
      "SELECT id FROM membership_plans WHERE id = ? AND company_id = ?",
      [plan_id, vendorCompanyId],
    );
    if (plan.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected membership plan was not found.",
      });
    }

    const [schedule] = await db.query(
      "SELECT id FROM member_schedules WHERE id = ? AND company_id = ?",
      [schedule_id, vendorCompanyId],
    );
    if (schedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected schedule was not found.",
      });
    }

    const query = `
      INSERT INTO members
      (company_id,plan_id,schedule_id,full_name, phone, email, gender, age, address, join_date, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `;

    const [result] = await db.query(query, [
      vendorCompanyId,
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
      message: "Member added successfully.",
      memberId: result.insertId,
    });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add the member right now. Please try again later.",
    });
  }
};
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.vendor?.company_id;

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
      WHERE m.id = ? AND m.company_id = ?`,
      [id, company_id],
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
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
      message: "Unable to fetch member details right now. Please try again later.",
    });
  }
};
export const getMembersByCompany = async (req, res) => {
  try {
    const company_id = req.vendor?.company_id;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "Unable to identify your company. Please log in again.",
      });
    }

    const [members] = await db.query(
      `SELECT
        m.*,
        mp.name AS plan_name
      FROM members m
      LEFT JOIN membership_plans mp ON m.plan_id = mp.id
      WHERE m.company_id = ?
      ORDER BY m.id DESC`,
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
      message: "Unable to fetch members right now. Please try again later.",
    });
  }
};
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.vendor?.company_id;
    const [rows] = await db.execute("SELECT * FROM members WHERE id = ? AND company_id = ?", [id, company_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Member not found." });
    }
    await db.execute("DELETE FROM members WHERE id = ? AND company_id = ?", [id, company_id]);
    res.status(200).json({ message: "Member deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete the member right now. Please try again later." });
  }
};
export const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorCompanyId = req.vendor?.company_id;
    const {
      full_name,
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

    if (existing.length === 0 || existing[0].company_id !== vendorCompanyId) {
      return res.status(404).json({
        success: false,
          message: "Member not found.",
      });
    }

    const oldMember = existing[0];
    // 2. Keep old values if new ones not provided
    const updatedFullName = full_name || oldMember.full_name;
    const updatedCompanyId = oldMember.company_id;
    const updatedEmail = email || oldMember.email;
    const updatedPhone = phone || oldMember.phone;
    const updatedAddress = address || oldMember.address;
    const updatedGender = gender || oldMember.gender;
    const updatedAge = age || oldMember.age;
    const updatedPlanId = plan_id || oldMember.plan_id;
    const updatedStatus = status || oldMember.status;
    const updatedSchedule_Id = schedule_id || oldMember.schedule_id;

    if (!isValidPhoneNumber(updatedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits.",
      });
    }

    // 3. Optional: Check if plan exists if plan_id changed
    if (plan_id && plan_id !== oldMember.plan_id) {
      const [plan] = await db.query(
        "SELECT * FROM membership_plans WHERE id = ? AND company_id = ?",
        [plan_id, vendorCompanyId],
      );

      if (plan.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Selected membership plan was not found.",
        });
      }
    }

    if (schedule_id && schedule_id !== oldMember.schedule_id) {
      const [schedule] = await db.query(
        "SELECT * FROM member_schedules WHERE id = ? AND company_id = ?",
        [schedule_id, vendorCompanyId],
      );

      if (schedule.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Selected schedule was not found.",
        });
      }
    }

    if (phone) {
      const [existingPhone] = await db.query(
        "SELECT phone FROM members WHERE phone = ? AND id != ?",
        [phone, id],
      );

      if (existingPhone.length > 0) {
        return res.status(400).json({
          success: false,
          message: "This phone number is already in use.",
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
      message: "Member updated successfully.",
      member: updatedMember[0],
    });
  } catch (error) {
    console.error("Update Member Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update the member right now. Please try again later.",
    });
  }
};
export const addMemberSchedule = async (req, res) => {
  try {
    const company_id = req.vendor?.company_id;
    const { schedule_name, start_time, end_time } = req.body;

    if (!company_id || !schedule_name || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Schedule name, start time, and end time are required.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO member_schedules (company_id, schedule_name, start_time, end_time)
       VALUES (?,?, ?, ?)`,
      [company_id, schedule_name, start_time, end_time],
    );

    res.status(201).json({
      success: true,
      message: "Schedule added successfully.",
      scheduleId: result.insertId,
    });
  } catch (error) {
    console.error("Add Member Schedule Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add the schedule right now. Please try again later.",
    });
  }
};
export const getAllMemberSchedules = async (req, res) => {
  try {
    const company_id = req.vendor?.company_id;
    const [schedules] = await db.query(
      "SELECT * FROM member_schedules WHERE company_id = ? ORDER BY id DESC",
      [company_id],
    );

    res.status(200).json({
      success: true,
      total: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("Get All Member Schedules Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch schedules right now. Please try again later.",
    });
  }
};
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.vendor?.company_id;
    const [rows] = await db.execute(
      "SELECT * FROM member_schedules WHERE id = ? AND company_id = ?",
      [id, company_id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    const [membersUsingSchedule] = await db.execute(
      "SELECT id FROM members WHERE schedule_id = ? AND company_id = ? LIMIT 1",
      [id, company_id],
    );

    if (membersUsingSchedule.length > 0) {
      return res.status(400).json({
        message: "Schedule is used by member, cannot delete.",
      });
    }

    await db.execute("DELETE FROM member_schedules WHERE id = ? AND company_id = ?", [id, company_id]);
    return res.status(200).json({ message: "Schedule deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to delete the schedule right now. Please try again later." });
  }
};
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params; // schedule id from URL
    const company_id = req.vendor?.company_id;
    const { schedule_name, start_time, end_time } = req.body;

    if (!company_id || !schedule_name || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Schedule name, start time, and end time are required.",
      });
    }

    // Check if schedule exists
    const [existing] = await db.query(
      "SELECT * FROM member_schedules WHERE id = ? AND company_id = ?",
      [id, company_id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found.",
      });
    }

    // Update schedule
    await db.query(
      `UPDATE member_schedules 
       SET company_id = ?, schedule_name = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [company_id, schedule_name, start_time, end_time, id],
    );

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully.",
    });
  } catch (error) {
    console.error("Update Member Schedule Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update the schedule right now. Please try again later.",
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
        message: "Unable to identify your company. Please log in again.",
      });
    }

    const [schedules] = await db.query(
      `SELECT 
        ms.id,
        ms.company_id,
        ms.member_id,
        ms.schedule_name,
        m.full_name,
        ms.start_time,
        ms.end_time
      FROM member_schedules ms
      LEFT JOIN members m ON ms.member_id = m.id
      WHERE ms.company_id = ?
      ORDER BY ms.id DESC`,
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
      message: "Unable to fetch schedules right now. Please try again later.",
    });
  }
};
