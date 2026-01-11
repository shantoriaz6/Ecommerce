import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken
} from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/refresh-token").post(refreshAdminToken);

// Secured routes
router.route("/logout").post(verifyAdmin, logoutAdmin);

export default router;
