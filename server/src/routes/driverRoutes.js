import { Router } from "express";
import { requireRole } from "../middleware/authMiddleware.js";
import {
    getDrivers, getDriver, createDriver, updateDriver,
    deleteDriver, assignVehicle, getDriverStats,
} from "../controllers/driverController.js";

const router = Router();

router.get("/stats", getDriverStats);   // must be before /:id
router.get("/", getDrivers);
router.get("/:id", getDriver);
router.post("/", requireRole("Admin", "Manager"), createDriver);
router.put("/:id", requireRole("Admin", "Manager"), updateDriver);
router.patch("/:id/assign", requireRole("Admin", "Manager"), assignVehicle);
router.delete("/:id", requireRole("Admin", "Manager"), deleteDriver);

export default router;
