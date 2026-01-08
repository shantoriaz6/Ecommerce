import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/order.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// User routes (protected)
router.route("/").post(verifyjwt, createOrder);
router.route("/my-orders").get(verifyjwt, getUserOrders);
router.route("/:id").get(verifyjwt, getOrderById);
router.route("/:id/cancel").patch(verifyjwt, cancelOrder);

// Admin routes
router.route("/all").get(verifyAdmin, getAllOrders);
router.route("/:id/status").patch(verifyAdmin, updateOrderStatus);

export default router;
