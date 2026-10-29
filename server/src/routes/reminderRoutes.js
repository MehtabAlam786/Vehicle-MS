import { Router } from "express";
import { requireRole } from "../middleware/authMiddleware.js";
import {
    getReminders, getReminderStats, createReminder, updateReminder,
    deleteReminder, completeReminder, snoozeReminder, syncAutoReminders,
} from "../controllers/reminderController.js";

const router = Router();

router.get("/", getReminders);
router.get("/stats", getReminderStats);
router.post("/", requireRole("Admin", "Manager"), createReminder);
router.post("/sync", requireRole("Admin", "Manager"), syncAutoReminders);
router.put("/:id", requireRole("Admin", "Manager"), updateReminder);
router.patch("/:id/complete", requireRole("Admin", "Manager"), completeReminder);
router.patch("/:id/snooze", requireRole("Admin", "Manager"), snoozeReminder);
router.delete("/:id", requireRole("Admin", "Manager"), deleteReminder);

export default router;
