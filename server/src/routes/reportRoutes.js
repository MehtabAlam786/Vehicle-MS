import { Router } from "express";
import {
    getOverview, getFuelReport, getMaintenanceReport, getVehicleReport,
} from "../controllers/reportController.js";

const router = Router();

router.get("/overview", getOverview);
router.get("/fuel", getFuelReport);
router.get("/maintenance", getMaintenanceReport);
router.get("/vehicle/:id", getVehicleReport);

export default router;
