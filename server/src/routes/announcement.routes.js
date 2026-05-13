import { Router } from "express";
import {
  createAnnouncement,
  listAnnouncements
} from "../controllers/announcement.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, listAnnouncements);
router.post("/", protect, authorize("admin"), createAnnouncement);

export default router;
