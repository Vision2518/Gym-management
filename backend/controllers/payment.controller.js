import db from "../config/db.connect.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const billTemplatePath = path.resolve(__dirname, "../utils/bill.html");

const isValidDateInput = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const normalizePaymentSearch = (value = "") =>
  String(value).trim().toLowerCase();

const matchesPaymentSearch = (value, normalizedSearch) => {
  if (!normalizedSearch) return true;

  const memberName = String(value.member_name || value.full_name || "")
    .toLowerCase();
  const memberPhone = String(value.phone || "").toLowerCase();
  const memberEmail = String(value.email || "").toLowerCase();

  return (
    memberName.includes(normalizedSearch) ||
    memberPhone.includes(normalizedSearch) ||
    memberEmail.includes(normalizedSearch)
  );
};

const getPaymentRowStatus = (payment) => {
  const rawStatus = String(payment.payment_status || payment.status || "")
    .trim()
    .toLowerCase();

  if (rawStatus.includes("partial")) return "partial";
  if (rawStatus === "paid" || rawStatus === "complete" || rawStatus === "fully paid") {
    return "paid";
  }
  if (
    rawStatus === "unpaid" ||
    rawStatus === "pending" ||
    rawStatus === "due"
  ) {
    return "unpaid";
  }

  const paidAmount = Number(payment.paid_amount || 0);
  const remainingAmount = Number(payment.remaining_amount || 0);

  if (remainingAmount > 0 && paidAmount > 0) return "partial";
  if (remainingAmount > 0 && paidAmount <= 0) return "unpaid";
  if (paidAmount > 0) return "paid";

  return "unpaid";
};

export const addPayment = async (req, res) => {
  try {
    const company_id = req.vendor?.company_id;
    const {
      member_id,
      plan_id,
      discount,
      paid_amount,
      payment_date,
      payment_method,
      remarks,
    } = req.body;

    // 1. Validate required fields
    if (!member_id || !plan_id || paid_amount == null || !payment_method) {
      return res.status(400).json({
        success: false,
        message:
          "Member, plan, paid amount, and payment method are required.",
      });
    }

    // 2. Check if member exists
    const [member] = await db.query(
      "SELECT * FROM members WHERE id = ? AND company_id = ?",
      [member_id, company_id],
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected member was not found.",
      });
    }

    // 3. Check if plan exists
    const [plan] = await db.query(
      "SELECT * FROM membership_plans WHERE id = ? AND company_id = ?",
      [plan_id, company_id],
    );

    if (plan.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected membership plan was not found.",
      });
    }

    // 4. Convert values to numbers
    const planPrice = Number(plan[0].price);
    const finalPaidAmount = Number(paid_amount);

    if (isNaN(finalPaidAmount)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid paid amount.",
      });
    }

    if (finalPaidAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount must be greater than 0.",
      });
    }

    if (payment_date && !isValidDateInput(payment_date)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid payment date.",
      });
    }

    // 5. Get total previous paid amount for this member + plan
    const [paymentSummary] = await db.query(
      `SELECT 
          COALESCE(SUM(paid_amount), 0) AS total_paid,
          COUNT(*) AS payment_count
       FROM payments
       WHERE member_id = ? AND plan_id = ?`,
      [member_id, plan_id],
    );

    const totalPreviousPaid = Number(paymentSummary[0].total_paid);
    const paymentCount = Number(paymentSummary[0].payment_count);

    // 6. Get first payment discount (if previous payment exists)
    const [firstPayment] = await db.query(
      `SELECT discount
       FROM payments
       WHERE member_id = ? AND plan_id = ?
       ORDER BY id ASC
       LIMIT 1`,
      [member_id, plan_id],
    );

    let finalDiscount = 0;

    if (paymentCount === 0) {
      // First payment decides discount
      finalDiscount = Number(discount ?? 0);

      if (isNaN(finalDiscount)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid discount amount.",
        });
      }
    } else {
      // Next installments must use first payment's discount
      finalDiscount = Number(firstPayment[0].discount ?? 0);

      // If user tries to change discount in later payments, reject
      if (discount != null && Number(discount) !== finalDiscount) {
        return res.status(400).json({
          success: false,
          message: `The discount for this member and plan is fixed at ${finalDiscount}. It cannot be changed in later installments.`,
        });
      }
    }

    // 7. Validate discount
    if (finalDiscount < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot be negative.",
      });
    }

    if (finalDiscount > planPrice) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot be greater than the plan price.",
      });
    }

    // 8. Calculate payable amount
    const payableAmount = planPrice - finalDiscount;

    // 9. Prevent overpayment across all installments
    const totalAfterThisPayment = totalPreviousPaid + finalPaidAmount;
    const paymentCreatedAt = payment_date ? `${payment_date} 00:00:00` : new Date();

    if (totalAfterThisPayment > payableAmount) {
      return res.status(400).json({
        success: false,
          message: `This payment is too high. Already paid: ${totalPreviousPaid}. Total payable amount: ${payableAmount}.`,
      });
    }

    // 10. Insert payment
    const [result] = await db.query(
      `INSERT INTO payments (member_id, plan_id, discount, paid_amount, payment_method, remarks, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        member_id,
        plan_id,
        finalDiscount,
        finalPaidAmount,
        payment_method,
        remarks ?? null,
        paymentCreatedAt,
      ],
    );

    // 11. Fetch inserted payment
    const [newPayment] = await db.query("SELECT * FROM payments WHERE id = ?", [
      result.insertId,
    ]);

    // 12. Send response
    res.status(201).json({
      success: true,
      message:
        paymentCount === 0
          ? "Payment added successfully."
          : "Installment payment added successfully.",
      payment: newPayment[0],
      summary: {
        plan_price: planPrice,
        discount: finalDiscount,
        payable_amount: payableAmount,
        previous_paid: totalPreviousPaid,
        current_paid: finalPaidAmount,
        total_paid: totalAfterThisPayment,
        remaining_amount: payableAmount - totalAfterThisPayment,
        payment_status:
          totalAfterThisPayment === payableAmount
            ? "Fully Paid"
            : "Partially Paid",
      },
    });
  } catch (error) {
    console.error("Add Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add the payment right now. Please try again later.",
    });
  }
};
export const getAllPayments = async (req, res) => {
  try {
    const company_id = req.vendor?.company_id;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(Number.parseInt(req.query.limit, 10) || 10, 1);
    const filter = String(req.query.filter || "all").toLowerCase();
    const normalizedSearch = normalizePaymentSearch(req.query.search);
    const [payments] = await db.query(
      `SELECT p.id, p.member_id, m.full_name AS member_name, 
              p.plan_id, pl.name AS plan_name, 
              p.discount, p.paid_amount,p.payment_method, p.remarks, p.created_at,
              pl.price AS plan_price, m.phone, m.email
       FROM payments p
       JOIN members m ON p.member_id = m.id
       JOIN membership_plans pl ON p.plan_id = pl.id
       WHERE m.company_id = ?
       ORDER BY p.created_at DESC`,
      [company_id],
    );
    const [members] = await db.query(
      `SELECT m.id, m.full_name, m.phone, m.email, m.plan_id, m.join_date,
              mp.name AS plan_name
       FROM members m
       LEFT JOIN membership_plans mp ON m.plan_id = mp.id
       WHERE m.company_id = ?`,
      [company_id],
    );

    const paymentTotals = payments.reduce((acc, payment) => {
      const key = `${payment.member_id}:${payment.plan_id}`;
      const existing = acc.get(key) || {
        total_paid: 0,
        payable_amount:
          Number(payment.plan_price || 0) - Number(payment.discount || 0),
      };

      existing.total_paid += Number(payment.paid_amount || 0);
      existing.remaining_amount = Math.max(
        existing.payable_amount - existing.total_paid,
        0,
      );
      acc.set(key, existing);
      return acc;
    }, new Map());

    const paymentRows = payments
      .map((payment) => {
        const key = `${payment.member_id}:${payment.plan_id}`;
        const totals = paymentTotals.get(key);
        const remainingAmount = Number(totals?.remaining_amount || 0);

        return {
          ...payment,
          rowType: "payment",
          remaining_amount: remainingAmount,
          payment_status: remainingAmount === 0 ? "Fully Paid" : "Partially Paid",
        };
      })
      .filter((payment) => matchesPaymentSearch(payment, normalizedSearch));

    const unpaidMemberRows = members
      .filter((member) => {
        const hasPaymentRecord = payments.some(
          (payment) => String(payment.member_id) === String(member.id),
        );

        if (hasPaymentRecord) return false;
        return matchesPaymentSearch(member, normalizedSearch);
      })
      .map((member) => ({
        id: `unpaid-${member.id}`,
        rowType: "member",
        member_id: member.id,
        member_name: member.full_name || "Unknown",
        phone: member.phone || "",
        email: member.email || "",
        plan_id: member.plan_id || "",
        plan_name: member.plan_name || "-",
        discount: 0,
        paid_amount: 0,
        payment_method: "-",
        remarks: null,
        created_at: null,
        remaining_amount: 0,
        payment_status: "Unpaid",
      }));

    const searchableRows = [...paymentRows, ...unpaidMemberRows];
    const counts = searchableRows.reduce(
      (acc, row) => {
        const status = getPaymentRowStatus(row);
        acc.all += 1;
        acc[status] += 1;
        return acc;
      },
      { all: 0, paid: 0, partial: 0, unpaid: 0 },
    );

    const filteredRows = searchableRows.filter((row) => {
      if (filter === "all") return true;
      return getPaymentRowStatus(row) === filter;
    });

    const totalItems = filteredRows.length;
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    const paginatedRows = filteredRows.slice(startIndex, startIndex + limit);
    const collectedAmount = filteredRows.reduce(
      (sum, row) => sum + Number(row.paid_amount || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      payments: paginatedRows,
      counts,
      summary: {
        collected_amount: collectedAmount,
      },
      pagination: {
        page: currentPage,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch payments right now. Please try again later.",
    });
  }
};
export const getPaymentsByMemberId = async (req, res) => {
  try {
    const { member_id } = req.params;
    const company_id = req.vendor?.company_id;
    const [payments] = await db.query(
      `SELECT p.id, p.member_id, m.full_name AS member_name, 
              p.plan_id, pl.name AS plan_name, 
              p.discount, p.paid_amount,p.payment_method, p.remarks, p.created_at
       FROM payments p
       JOIN members m ON p.member_id = m.id
       JOIN membership_plans pl ON p.plan_id = pl.id
       WHERE p.member_id = ? AND m.company_id = ?
       ORDER BY p.created_at DESC`,
      [member_id, company_id],
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payments were found for this member.",
      });
    }

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Get Payments By Member ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch payments right now. Please try again later.",
    });
  }
};
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.vendor?.company_id;
    const {
      member_id,
      plan_id,
      discount,
      paid_amount,
      payment_date,
      payment_method,
      remarks,
    } = req.body;

    // 1. Check if payment exists
    const [existing] = await db.query(
      `SELECT p.*
       FROM payments p
       JOIN members m ON p.member_id = m.id
       WHERE p.id = ? AND m.company_id = ?`,
      [id, company_id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const oldPayment = existing[0];

    // 2. Keep old values if not provided
    const updatedMemberId = member_id ?? oldPayment.member_id;
    const updatedPlanId = plan_id ?? oldPayment.plan_id;
    const updatedDiscount = Number(discount ?? oldPayment.discount ?? 0);
    const updatedPaidAmount = Number(paid_amount ?? oldPayment.paid_amount ?? 0);
    const updatedPaymentDate = payment_date ?? (oldPayment.created_at
      ? oldPayment.created_at.toISOString().split("T")[0]
      : null);
    const updatedPaymentMethod = payment_method ?? oldPayment.payment_method;
    const updatedRemarks = remarks ?? oldPayment.remarks;

    // 3. Validate numeric fields
    if (updatedDiscount < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot be negative.",
      });
    }

    if (updatedPaidAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Paid amount must be greater than 0.",
      });
    }

    if (updatedPaymentDate && !isValidDateInput(updatedPaymentDate)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid payment date.",
      });
    }

    // 4. Validate member exists
    const [member] = await db.query(
      "SELECT * FROM members WHERE id = ? AND company_id = ?",
      [updatedMemberId, company_id],
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected member was not found.",
      });
    }

    // 5. Validate plan exists
    const [plan] = await db.query(
      "SELECT * FROM membership_plans WHERE id = ? AND company_id = ?",
      [updatedPlanId, company_id],
    );

    if (plan.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected plan was not found.",
      });
    }

    const planPrice = Number(plan[0].price);

    // 6. Discount should not exceed plan price
    if (updatedDiscount > planPrice) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot be greater than the plan price.",
      });
    }

    const payableAmount = planPrice - updatedDiscount;

    // 7. Sum all OTHER payments for same member + plan (excluding current payment)
    const [otherPayments] = await db.query(
      `SELECT COALESCE(SUM(paid_amount), 0) AS totalPaid
       FROM payments
       WHERE member_id = ? AND plan_id = ? AND id != ?`,
      [updatedMemberId, updatedPlanId, id],
    );

    const totalOtherPaid = Number(otherPayments[0].totalPaid || 0);

    // 8. Prevent overpayment after update
    if (totalOtherPaid + updatedPaidAmount > payableAmount) {
      return res.status(400).json({
        success: false,
        message: `This payment is too high. Remaining amount allowed: ${payableAmount - totalOtherPaid}.`,
      });
    }

    // 9. Optional: enforce same discount across same member + plan
    const [existingDiscountRows] = await db.query(
      `SELECT discount
       FROM payments
       WHERE member_id = ? AND plan_id = ? AND id != ?
       LIMIT 1`,
      [updatedMemberId, updatedPlanId, id],
    );

    if (existingDiscountRows.length > 0) {
      const previousDiscount = Number(existingDiscountRows[0].discount || 0);

      if (updatedDiscount !== previousDiscount) {
        return res.status(400).json({
          success: false,
          message: `Discount must stay the same for this member and plan. Current discount: ${previousDiscount}.`,
        });
      }
    }

    // 10. Update payment
    await db.query(
      `UPDATE payments
       SET member_id = ?, plan_id = ?, discount = ?, paid_amount = ?, payment_method = ?, remarks = ?, created_at = ?
       WHERE id = ?`,
      [
        updatedMemberId,
        updatedPlanId,
        updatedDiscount,
        updatedPaidAmount,
        updatedPaymentMethod,
        updatedRemarks,
        updatedPaymentDate ? `${updatedPaymentDate} 00:00:00` : oldPayment.created_at,
        id,
      ],
    );
    // 11. Fetch updated payment with joined details
    const [updatedPayment] = await db.query(
      `SELECT p.id, p.member_id, m.full_name AS member_name,
              p.plan_id, pl.name AS plan_name,
              p.discount, p.paid_amount, p.payment_method, p.remarks, p.created_at
       FROM payments p
       JOIN members m ON p.member_id = m.id
       JOIN membership_plans pl ON p.plan_id = pl.id
       WHERE p.id = ? AND m.company_id = ?`,
      [id, company_id],
    );
    // 12. Calculate updated summary
    const [summaryRows] = await db.query(
      `SELECT COALESCE(SUM(paid_amount), 0) AS totalPaid
       FROM payments
       WHERE member_id = ? AND plan_id = ?`,
      [updatedMemberId, updatedPlanId],
    );

    const totalPaid = Number(summaryRows[0].totalPaid || 0);
    const remainingAmount = payableAmount - totalPaid;

    res.status(200).json({
      success: true,
      message: "Payment updated successfully.",
      payment: updatedPayment[0],
      summary: {
        plan_price: planPrice,
        discount: updatedDiscount,
        payable_amount: payableAmount,
        total_paid: totalPaid,
        remaining_amount: remainingAmount,
        payment_status: remainingAmount === 0 ? "Fully Paid" : "Partially Paid",
      },
    });
  } catch (error) {
    console.error("Update Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update the payment right now. Please try again later.",
    });
  }
};
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.vendor?.company_id;

    // 1. Check if payment exists
    const [existing] = await db.query(
      `SELECT p.id
       FROM payments p
       JOIN members m ON p.member_id = m.id
       WHERE p.id = ? AND m.company_id = ?`,
      [id, company_id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    // 2. Delete payment
    await db.query(
      `DELETE p FROM payments p
       JOIN members m ON p.member_id = m.id
       WHERE p.id = ? AND m.company_id = ?`,
      [id, company_id],
    );

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete the payment right now. Please try again later.",
    });
  }
};
export const getBillById = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const company_id = req.vendor?.company_id;

    // 1. Fetch payment by payment_id
    const [paymentRows] = await db.query(
      `SELECT p.*, m.full_name, m.email, m.phone, m.address,
              m.plan_id, pl.name AS plan_name, pl.price AS plan_price, c.name AS gym_name
       FROM payments p
       JOIN members m ON p.member_id = m.id
       JOIN membership_plans pl ON p.plan_id = pl.id
       JOIN companies c ON m.company_id = c.id
       WHERE p.id = ? AND m.company_id = ?`,
      [payment_id, company_id],
    );

    if (paymentRows.length === 0) return res.status(404).send("Payment not found");

    const memberData = paymentRows[0];
    const paymentData = paymentRows[0];

    const total_due =
      (memberData.plan_price || 0) -
      (paymentData.paid_amount || 0) -
      (paymentData.discount || 0);

    // 2. Read HTML template
    let template = fs.readFileSync(billTemplatePath, "utf-8");

    // 3. Replace placeholders
    template = template
      .replace("{{gym_name}}", memberData.gym_name)
      .replace("{{member_name}}", memberData.full_name)
      .replace("{{member_email}}", memberData.email || "")
      .replace("{{member_phone}}", memberData.phone || "")
      .replace("{{plan_name}}", memberData.plan_name)
      .replace("{{plan_price}}", memberData.plan_price)
      .replace("{{paid_amount}}", paymentData.paid_amount || 0)
      .replace("{{discount}}", paymentData.discount || 0)
      .replace("{{total_due}}", total_due)
      .replace("{{payment_method}}", paymentData.payment_method || "")
      .replace("{{remarks}}", paymentData.remarks || "")
      .replace(
        "{{date}}",
        paymentData.created_at
          ? paymentData.created_at.toISOString().split("T")[0]
          : "",
      );

    // 4. Send HTML as response
    res.setHeader("Content-Type", "text/html");
    res.send(template);
  } catch (err) {
    console.error("Generate Bill Error:", err);
    res.status(500).send("Failed to generate bill");
  }
};
export const getPaymentHistoryByMemberId = async (req, res) => {
  try {
    const { member_id } = req.params;
    const company_id = req.vendor?.company_id;

    // 1. Validate member_id
    if (!member_id) {
      return res.status(400).json({
        success: false,
        message: "Member is required.",
      });
    }

    // 2. Check if member exists
    const [member] = await db.query(
      "SELECT * FROM members WHERE id = ? AND company_id = ?",
      [member_id, company_id],
    );

    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected member was not found.",
      });
    }

    // 3. Get all payments with plan info
    const [payments] = await db.query(
      `SELECT 
          p.id,
          p.member_id,
          p.plan_id,
          p.discount,
          p.paid_amount,
          p.payment_method,
          p.remarks,
          p.created_at,
          mp.name AS plan_name,
          mp.price AS plan_price
       FROM payments p
       JOIN membership_plans mp ON p.plan_id = mp.id
       WHERE p.member_id = ?
       ORDER BY p.id DESC`,
      [member_id],
    );

    // 4. If no payment history
    if (payments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No payment history was found for this member.",
        member: member[0],
        payments: [],
      });
    }

    // 5. Group by plan_id
    const groupedPayments = {};

    for (const payment of payments) {
      const planId = payment.plan_id;

      if (!groupedPayments[planId]) {
        groupedPayments[planId] = {
          plan_id: payment.plan_id,
          plan_name: payment.plan_name,
          plan_price: Number(payment.plan_price),
          discount: Number(payment.discount ?? 0),
          payable_amount: Number(payment.plan_price) - Number(payment.discount ?? 0),
          total_paid: 0,
          remaining_amount: 0,
          payment_status: "",
          payments: [],
        };
      }

      groupedPayments[planId].total_paid += Number(payment.paid_amount);

      groupedPayments[planId].payments.push({
        id: payment.id,
        paid_amount: Number(payment.paid_amount),
        payment_method: payment.payment_method,
        remarks: payment.remarks,
        created_at: payment.created_at,
      });
    }

    // 6. Finalize remaining + status
    const paymentHistory = Object.values(groupedPayments).map((item) => {
      item.remaining_amount = item.payable_amount - item.total_paid;
      item.payment_status =
        item.remaining_amount === 0 ? "Fully Paid" : "Partially Paid";
      return item;
    });

    // 7. Response
    res.status(200).json({
      success: true,
      message: "Payment history fetched successfully.",
      member: member[0],
      payment_history: paymentHistory,
    });
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch payment history right now. Please try again later.",
    });
  }
};
