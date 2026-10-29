import { Router } from "express";
import { getMaintenance, getMaintenanceByVehicle, createMaintenance, deleteMaintenance } from "../controllers/maintenanceController.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", getMaintenance);
router.get("/vehicle/:vehicleId", getMaintenanceByVehicle);
router.post("/", requireRole("Admin", "Manager", "Supervisor", "Driver"), createMaintenance);
router.delete("/:id", requireRole("Admin", "Manager"), deleteMaintenance);
export default router;
