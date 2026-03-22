import express from "express";
import { loginVendor,addMemberPlan, getAllPlan, getPlanByCompany } from "../controller/vendor.controller.js";
import { signout } from "../controller/auth.controlller.js";
import { authorizeVendor } from "../middlewares/isAuth.js";
export const vendorRouter = express.Router();
vendorRouter.post("/login", loginVendor);
vendorRouter.post("/signout",signout);
vendorRouter.post("/addplan",authorizeVendor,addMemberPlan);
vendorRouter.get("/getallplan",getAllPlan);
vendorRouter.get("/getplanbycompany",getPlanByCompany);


