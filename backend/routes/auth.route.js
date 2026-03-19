import express from "express";
import {
  loginAdmin,
  signout,
  addVendor,
  getVendor,
  addCompany,
  getCompanyForAdmin,
  deleteCompany,
} from "../controller/auth.controlller.js";
import { isSuperAdmin } from "../middlewares/isLogin.js";
import { authorizesRoles } from "../middlewares/isAuth.js";
const authRouter = express.Router();
authRouter.post("/login", loginAdmin);
authRouter.post("/signout", signout);
authRouter.post(
  "/addvendor",
  isSuperAdmin,
  authorizesRoles("super_admin"),
  addVendor,
);
authRouter.post(
  "/addcompany",
  isSuperAdmin,
  authorizesRoles("super_admin"),
  addCompany,
);
authRouter.get(
  "/getcompany/id/:id",
  isSuperAdmin,
  authorizesRoles("super_admin"),
  getCompanyForAdmin,
);
authRouter.get(
  "/getvendor/email/:email",
  isSuperAdmin,
  authorizesRoles("super_admin"),
  getVendor,
);
authRouter.delete(
  "/deletecompany/id/:id",
  isSuperAdmin,
  authorizesRoles("super_admin"),
  deleteCompany,
);
export default authRouter;
