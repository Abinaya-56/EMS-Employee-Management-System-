import { Router } from "express";
import {
  getDepartmentSummary,
  getEmployeeSummary
} from "../controllers/analytics.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/employee/:id", protect, authorize("admin"), getEmployeeSummary);
router.get("/departments", protect, authorize("admin"), getDepartmentSummary);

export default router;
