import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  createDeliveryman,
  getAllDeliverymen,
  updateDeliverymanStatus,
  deleteDeliveryman,
  assignOrderToDeliveryman,
  getDeliverymanStats
} from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/refresh-token").post(refreshAdminToken);

// Secured routes
router.route("/logout").post(verifyAdmin, logoutAdmin);

// Delivery man management routes
router.route("/deliverymen").post(verifyAdmin, createDeliveryman);
router.route("/deliverymen").get(verifyAdmin, getAllDeliverymen);
router.route("/deliverymen/:deliverymanId").patch(verifyAdmin, updateDeliverymanStatus);
router.route("/deliverymen/:deliverymanId").delete(verifyAdmin, deleteDeliveryman);
router.route("/deliverymen/:deliverymanId/stats").get(verifyAdmin, getDeliverymanStats);
router.route("/assign-order").post(verifyAdmin, assignOrderToDeliveryman);

export default router;
