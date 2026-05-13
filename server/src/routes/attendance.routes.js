import { Router } from "express";
import { getAttendance, markAttendance } from "../controllers/attendance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/mark", protect, markAttendance);
router.get("/", protect, getAttendance);

export default router;
