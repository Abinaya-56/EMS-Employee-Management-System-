import { Router } from "express";
import {
  createPerformanceReview,
  listPerformanceReviews
} from "../controllers/performance.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, authorize("admin"), createPerformanceReview);
router.get("/", protect, listPerformanceReviews);

export default router;
