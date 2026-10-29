import { Router } from "express";
import { getAppearance, updateAppearance } from "../controllers/appearanceController.js";
const router = Router();
router.get("/", getAppearance);
router.put("/", updateAppearance);
export default router;
