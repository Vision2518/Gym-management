import db from "../config/db.connect.js";
export const addPayment = async (req, res) => {
  try {
    const { member_id, plan_id, discount, paid_amount,payment_method, remarks } = req.body;
    // 1. Validate required fields
    if (!member_id || !plan_id || !paid_amount ||!payment_method == null) {
      return res.status(400).json({
        success: false,
        message: "member_id, plan_id and paid_amount are required",
      });
    }
    // 2. Check if member exists
    const [member] = await db.query("SELECT * FROM members WHERE id = ?", [
      member_id,
    ]);
    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Member not found with id ${member_id}`,
      });
    }
    // 3. Check if plan exists
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
    // 4. Validate values
    const finalDiscount = discount ?? 0;

    if (finalDiscount < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot be negative",
      });
    }
    if (paid_amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative",
      });
    }
    // 5. Insert payment
    const [result] = await db.query(
      `INSERT INTO payments (member_id, plan_id, discount, paid_amount, payment_method, remarks)
       VALUES (?, ?, ?, ?,?,?)`,
      [member_id, plan_id, finalDiscount, paid_amount,payment_method,remarks ?? null],
    );
    // 6. Fetch inserted payment
    const [newPayment] = await db.query("SELECT * FROM payments WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json({
      success: true,
      message: "Payment added successfully",
      payment: newPayment[0],
    });
  } catch (error) {
    console.error("Add Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add payment",
      error: error.message,
    });
  }
};
export const getAllPayments = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.id, p.member_id, m.full_name AS member_name, 
              p.plan_id, pl.name AS plan_name, 
              p.discount, p.paid_amount,p.payment_method, p.remarks, p.created_at
       FROM payments p
       JOIN members m ON p.member_id = m.id
       JOIN membership_plans pl ON p.plan_id = pl.id
       ORDER BY p.created_at DESC`,
    );
    if (payments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No payments found" });
    }
    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};
export const getPaymentsByMemberId = async (req, res) => {
  try {
    const { member_id } = req.params;
    const [payments] = await db.query(
      `SELECT p.id, p.member_id, m.full_name AS member_name, 
              p.plan_id, pl.name AS plan_name, 
              p.discount, p.paid_amount,p.payment_method, p.remarks, p.created_at
       FROM payments p
       JOIN members m ON p.member_id = m.id
       JOIN membership_plans pl ON p.plan_id = pl.id
       WHERE p.member_id = ?
       ORDER BY p.created_at DESC`,
      [member_id],
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No payments found for member_id ${member_id}`,
      });
    }

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Get Payments By Member ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { member_id, plan_id, discount, paid_amount,payment_method,remarks } = req.body;

    // 1. Check if payment exists
    const [existing] = await db.query("SELECT * FROM payments WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Payment not found with id ${id}`,
      });
    }

    const oldPayment = existing[0];

    // 2. Keep old values if not provided
    const updatedMemberId = member_id || oldPayment.member_id;
    const updatedPlanId = plan_id || oldPayment.plan_id;
    const updatedDiscount = discount ?? oldPayment.discount;
    const updatedPaidAmount = paid_amount ?? oldPayment.paid_amount;
    const updatedPaymentMethod = payment_method ?? oldPayment.payment_method;
    const updatedRemarks = remarks ?? oldPayment.remarks;

    // 3. Check member exists (if changed)
    if (member_id && member_id !== oldPayment.member_id) {
      const [member] = await db.query("SELECT * FROM members WHERE id = ?", [
        member_id,
      ]);
      if (member.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Member not found with id ${member_id}`,
        });
      }
    }

    // 4. Check plan exists (if changed)
    if (plan_id && plan_id !== oldPayment.plan_id) {
      const [plan] = await db.query(
        "SELECT * FROM membership_plans WHERE id = ?",
        [plan_id],
      );
      if (plan.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Plan not found with id ${plan_id}`,
        });
      }
    }

    // 5. Update payment
    await db.query(
      `UPDATE payments 
       SET member_id = ?, plan_id = ?, discount = ?, paid_amount = ?,payment_method=?, remarks = ?
       WHERE id = ?`,
      [
        updatedMemberId,
        updatedPlanId,
        updatedDiscount,
        updatedPaidAmount,
        updatedPaymentMethod,
        updatedRemarks,
        id,
      ],
    );

    // 6. Fetch updated payment
    const [updatedPayment] = await db.query(
      "SELECT * FROM payments WHERE id = ?",
      [id],
    );

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment[0],
    });
  } catch (error) {
    console.error("Update Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if payment exists
    const [existing] = await db.query("SELECT * FROM payments WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Payment not found with id ${id}`,
      });
    }

    // 2. Delete payment
    await db.query("DELETE FROM payments WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};
