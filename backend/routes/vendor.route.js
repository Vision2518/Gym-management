import express from "express";
import {
  loginVendor,
  addMemberPlan,
  getAllPlan,
  getPlanByCompany,
  deletePlan,
  updatePlan,
  getVendorStats,
} from "../controllers/vendor.controller.js";
import { signout } from "../controllers/auth.controller.js";
import { isVendor } from "../middlewares/isLogin.js";
import authorizeRoles from "../middlewares/isAuth.js";
export const vendorRouter = express.Router();
vendorRouter.post("/login", loginVendor);
vendorRouter.post("/signout", signout);
vendorRouter.post(
  "/addplan",
  isVendor,
  authorizeRoles("vendor"),
  addMemberPlan,
);
vendorRouter.get("/getallplan", isVendor, authorizeRoles("vendor"), getAllPlan);
vendorRouter.get(
  "/getplan-company",
  isVendor,
  authorizeRoles("vendor"),
  getPlanByCompany,
);
vendorRouter.delete(
  "/deleteplan/:id",
  isVendor,
  authorizeRoles("vendor"),
  deletePlan,
);
vendorRouter.patch(
  "/updateplan/:id",
  isVendor,
  authorizeRoles("vendor"),
  updatePlan,
);
vendorRouter.get(
  "/stats",
  isVendor,
  authorizeRoles("vendor"),
  getVendorStats,
);
