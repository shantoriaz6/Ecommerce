import { Router } from "express";
import { chatWithAssistant } from "../controllers/chat.controller.js";

const router = Router();

// Public: customer live chat assistant
router.route("/").post(chatWithAssistant);

export default router;
