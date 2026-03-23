import express from "express";
import dotenv from "dotenv";
import db from "./config/db.connect.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import { vendorRouter } from "./routes/vendor.route.js";
import { memberRouter } from "./routes/member.route.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/member", memberRouter);
const PORT = process.env.PORT || 4000;
try {
  db.connect();
  console.log("MYsql connected successfully");
} catch (error) {
  console.log("Error in DB connection", error.message);
}
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
