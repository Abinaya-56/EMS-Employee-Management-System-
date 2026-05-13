import { Router } from "express";
import { queryChatbot } from "../controllers/chatbot.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/query", protect, authorize("admin"), queryChatbot);

export default router;
