import express from "express";
import {
  loginAdmin,
  signout,
  addVendor,
  getVendor,
} from "../controller/auth.controlller.js";
import { isSuperAdmin } from "../middlewares/isLogin.js";
const authRouter = express.Router();
authRouter.post("/login", loginAdmin);
authRouter.post("/signout", signout);
authRouter.post("/addvendor", isSuperAdmin,authorizeRoles("super_admin"), addVendor);
authRouter.get("/getvendor/email/:email",isSuperAdmin,authorizeRoles("super_admin"),getVendor);
export default authRouter;
