import express from "express";
import {} from "../controller/vendor.controller.js";
import { isVendor } from "../middlewares/isLogin.js";
import authorizeRoles from "../middlewares/isAuth.js";
import {
  addMember,
  addMemberSchedule,
  deleteMember,
  getAllMemberSchedules,
  getMemberById,
  getMembersByCompany,
  getSchedulesByCompany,
} from "../controller/membership.controller.js";
export const memberRouter = express.Router();
memberRouter.post("/add-member", isVendor, authorizeRoles("vendor"), addMember);
memberRouter.get(
  "/getmemberbyid/id/:id",
  isVendor,
  authorizeRoles("vendor"),
  getMemberById,
);
memberRouter.get(
  "/getmemberbycompany",
  isVendor,
  authorizeRoles("vendor"),
  getMembersByCompany,
);
memberRouter.delete(
  "/deletemember/:id",
  isVendor,
  authorizeRoles("vendor"),
  deleteMember,
);

memberRouter.post(
  "/addschedule",
  isVendor,
  authorizeRoles("vendor"),
  addMemberSchedule,
);
memberRouter.get(
  "/getschedule",
  isVendor,
  authorizeRoles("vendor"),
  getAllMemberSchedules,
);
memberRouter.get(
  "/getschedulebycompany/",
  isVendor,
  authorizeRoles("vendor"),
  getSchedulesByCompany,
);
/*memberRouter.get(
  "/getschedulebymember/:member_id",
  isVendor,
  authorizeRoles("vendor"),
  getSchedulesByMember,
);
*/