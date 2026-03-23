import express from "express";
import {
  loginAdmin,
  signout,
  addVendor,
  addCompany,
  deleteCompany,
  getAllVendor,
  getAllCompany,
} from "../controller/auth.controlller.js";
import { isSuperAdmin } from "../middlewares/isLogin.js";
import authorizeRoles from "../middlewares/isAuth.js";
const authRouter = express.Router();
authRouter.post("/login", loginAdmin);
authRouter.post("/signout", signout);
authRouter.post(
  "/addvendor",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  addVendor,
);
authRouter.post(
  "/addcompany",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  addCompany,
);
authRouter.get(
  "/getcompany",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  getAllCompany,
);
authRouter.get(
  "/getvendor",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  getAllVendor,
);
authRouter.delete(
  "/deletecompany/id/:id",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  deleteCompany,
);
export default authRouter;
