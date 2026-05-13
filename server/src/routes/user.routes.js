import { Router } from "express";
import { listEmployees } from "../controllers/user.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/employees", protect, authorize("admin"), listEmployees);

export default router;
