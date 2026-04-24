import express from "express";
import {
  loginAdmin,
  signout,
  addVendor,
  getAllVendor,
  deleteVendor,
  updateVendor,
  addCompany,
  getAllCompany,
  deleteCompany,
  updateCompany,
  getDashboardStats,
} from "../controllers/auth.controller.js";
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
authRouter.get(
  "/getvendor",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  getAllVendor,
);
authRouter.delete(
  "/deletevendor/:id",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  deleteVendor,
);
authRouter.patch(
  "/updatevendor/:id",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  updateVendor,
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

authRouter.delete(
  "/deletecompany/id/:id",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  deleteCompany,
);
authRouter.patch(
  "/updatecompany/:id",
  isSuperAdmin,
  authorizeRoles("super_admin"),
  updateCompany,
);
authRouter.get("/stats", isSuperAdmin, authorizeRoles("super_admin"), getDashboardStats);
export default authRouter;
