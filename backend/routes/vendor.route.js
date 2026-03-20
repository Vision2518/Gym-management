import express from "express";
import { loginVendor,addMemberPlan } from "../controller/vendor.controller.js";
import { signout } from "../controller/auth.controlller.js";
export const vendorRouter = express.Router();
vendorRouter.post("/login", loginVendor);
vendorRouter.post("/signout",signout);
vendorRouter.post("/addplan",addMemberPlan);


