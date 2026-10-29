import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import fuelRoutes from "./routes/fuelRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import appearanceRoutes from "./routes/appearanceRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import { apiRateLimit, securityHeaders } from "./middleware/security.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header include health checks and server-to-server calls.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(securityHeaders);
app.use(apiRateLimit);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    ok: ready,
    message: ready ? "Vehicle Management API is running" : "Database unavailable",
    database: ready ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", protect, vehicleRoutes);
app.use("/api/fuel", protect, fuelRoutes);
app.use("/api/maintenance", protect, maintenanceRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);
app.use("/api/drivers", protect, driverRoutes);
app.use("/api/reports", protect, reportRoutes);
app.use("/api/reminders", protect, reminderRoutes);
app.use("/api/settings", protect, settingsRoutes);
app.use("/api/users", protect, userRoutes);
app.use("/api/appearance", protect, appearanceRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid record id" });
  if (err.name === "ValidationError")
    return res.status(400).json({ message: err.message });
  if (err.code === 11000)
    return res
      .status(409)
      .json({ message: "A record with that value already exists" });
  if (err.type === "entity.too.large")
    return res.status(413).json({ message: "Request body is too large" });
  res
    .status(err.status || 500)
    .json({ message: err.status ? err.message : "Server error" });
});

const PORT = Number(process.env.PORT || 5000);

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]?.trim());

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingEnv.join(", ")}\n` +
      "Create server/.env from server/.env.example, then restart the server.",
  );
}

if (process.env.JWT_SECRET.trim().length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters long. Generate one with: " +
      "node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
  );
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be a valid number between 1 and 65535");
}

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
});
