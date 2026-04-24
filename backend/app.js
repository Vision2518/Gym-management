import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import { vendorRouter } from "./routes/vendor.route.js";
import { memberRouter } from "./routes/member.route.js";
import { paymentRouter } from "./routes/payment.route.js";
import corsMiddleware from "./middlewares/cors.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy." });
});

app.use("/api/auth", authRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/member", memberRouter);
app.use("/api/payment", paymentRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled application error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

export default app;
