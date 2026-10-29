import { Router } from "express";
import {
    register, login, getMe, updateMe, changePassword, logout,
    forgotPassword, verifyOTP, resetPassword, adminLoginStart, adminLoginVerify, adminSetup,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authRateLimit } from "../middleware/security.js";

const router = Router();

/* Public */
router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.post("/admin/login", authRateLimit, adminLoginStart);
router.post("/admin/verify", authRateLimit, adminLoginVerify);
router.post("/admin/setup", authRateLimit, adminSetup);
router.post("/forgot-password", authRateLimit, forgotPassword);
router.post("/verify-otp", authRateLimit, verifyOTP);
router.post("/reset-password", authRateLimit, resetPassword);

/* Protected */
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/change-password", protect, changePassword);

export default router;
