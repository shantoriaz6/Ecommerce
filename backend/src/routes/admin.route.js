import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin
} from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);

// Secured routes
router.route("/logout").post(verifyAdmin, logoutAdmin);

export default router;
