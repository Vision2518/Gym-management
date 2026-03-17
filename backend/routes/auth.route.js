import express from "express";
import { authLogin } from "../controller/auth.controlller.js";

const authRouter = express.Router();
authRouter.post("/login", authLogin);
export default authRouter;
