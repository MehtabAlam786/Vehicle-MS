import { Router } from "express";
import { listUsers, updateUser, listRoleRequests, reviewRoleRequest } from "../controllers/userController.js";
import { requireRole } from "../middleware/authMiddleware.js";
const router = Router();
router.get("/role-requests", requireRole("Admin"), listRoleRequests);
router.patch("/role-requests/:id", requireRole("Admin"), reviewRoleRequest);
router.get("/", requireRole("Admin"), listUsers);
router.patch("/:id", requireRole("Admin"), updateUser);
export default router;
