import { Router } from "express";
import { getFuel, getFuelByVehicle, createFuel, deleteFuel } from "../controllers/fuelController.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", getFuel);
router.get("/vehicle/:vehicleId", getFuelByVehicle);
router.post("/", requireRole("Admin", "Manager", "Supervisor", "Driver"), createFuel);
router.delete("/:id", requireRole("Admin", "Manager"), deleteFuel);
export default router;
