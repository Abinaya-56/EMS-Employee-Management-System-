import { Router } from "express";
import {
  createLeaveRequest,
  listLeaveRequests,
  reviewLeaveRequest
} from "../controllers/leaveRequest.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, createLeaveRequest);
router.get("/", protect, listLeaveRequests);
router.patch("/:id/review", protect, authorize("admin"), reviewLeaveRequest);

export default router;
