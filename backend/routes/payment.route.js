import express from "express";
import { isVendor } from "../middlewares/isLogin.js";
import authorizeRoles from "../middlewares/isAuth.js";
import {
  addPayment,
  deletePayment,
  getAllPayments,
  getPaymentsByMemberId,
  updatePayment,
} from "../controller/payment.controller.js";
export const paymentRouter = express.Router();
paymentRouter.post(
  "/addpayment",
  isVendor,
  authorizeRoles("vendor"),
  addPayment,
);
paymentRouter.get(
  "/getpayments",
  isVendor,
  authorizeRoles("vendor"),
  getAllPayments,
);
paymentRouter.get(
  "/getpaymentbyid/:member_id",
  isVendor,
  authorizeRoles("vendor"),
  getPaymentsByMemberId,
);
paymentRouter.patch(
  "/updatepayment/:id",
  isVendor,
  authorizeRoles("vendor"),
  updatePayment,
);
paymentRouter.delete(
  "/deletepayment/:id",
  isVendor,
  authorizeRoles("vendor"),
  deletePayment,
);
