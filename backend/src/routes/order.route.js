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

// Admin routes (must come before parameterized routes)
router.route("/all").get(verifyAdmin, getAllOrders);
router.route("/:id/status").patch(verifyAdmin, updateOrderStatus);

// User routes (protected)
router.route("/").post(verifyjwt, createOrder);
router.route("/").get(verifyjwt, getUserOrders);
router.route("/:id").get(verifyjwt, getOrderById);
router.route("/:id/cancel").patch(verifyjwt, cancelOrder);

export default router;
