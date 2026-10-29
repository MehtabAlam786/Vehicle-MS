import { Router } from "express";
import {
    getSettings, updateSettings, getSystemInfo, clearCollection,
} from "../controllers/settingsController.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getSettings);
router.put("/", requireRole("Admin"), updateSettings);
router.get("/system-info", requireRole("Admin"), getSystemInfo);
router.delete("/data/:collection", requireRole("Admin"), clearCollection);

export default router;
