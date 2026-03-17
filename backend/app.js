import express from "express";
import dotenv from "dotenv";
import db from "./config/db.connect.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
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
