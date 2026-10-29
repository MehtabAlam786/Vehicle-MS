import { Router } from "express";
import { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, updateKilometer } from "../controllers/vehicleController.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", getVehicles);
router.get("/:id", getVehicle);
router.post("/", requireRole("Admin", "Manager"), createVehicle);
router.put("/:id", requireRole("Admin", "Manager"), updateVehicle);
router.patch("/:id/km", requireRole("Admin", "Manager"), updateKilometer);
router.delete("/:id", requireRole("Admin", "Manager"), deleteVehicle);
export default router;
