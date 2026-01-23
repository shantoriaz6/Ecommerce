import { Router } from "express";
import {
  loginDeliveryman,
  logoutDeliveryman,
  refreshDeliverymanToken,
  getDeliverymanProfile,
  updateAvailability,
  updateLocation,
  getAssignedOrders,
  updateOrderStatus,
  decideAssignedOrder,
  getDeliveryStats
} from "../controllers/deliveryman.controller.js";
import { verifyDeliveryman } from "../middlewares/deliveryman.middleware.js";

const router = Router();

router.route("/login").post(loginDeliveryman);
router.route("/refresh-token").post(refreshDeliverymanToken);

// Secured routes
router.route("/logout").post(verifyDeliveryman, logoutDeliveryman);
router.route("/profile").get(verifyDeliveryman, getDeliverymanProfile);
router.route("/availability").patch(verifyDeliveryman, updateAvailability);
router.route("/location").patch(verifyDeliveryman, updateLocation);
router.route("/orders").get(verifyDeliveryman, getAssignedOrders);
router.route("/orders/:orderId/status").patch(verifyDeliveryman, updateOrderStatus);
router.route("/orders/:orderId/decision").patch(verifyDeliveryman, decideAssignedOrder);
router.route("/stats").get(verifyDeliveryman, getDeliveryStats);

export default router;
