import { Router } from "express";
import {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  handleIPN,
  getPaymentStatus
} from "../controllers/payment.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Initialize payment (protected)
router.route("/init").post(verifyjwt, initPayment);

// SSL Commerz callback routes (public - no auth required)
router.route("/success").post(paymentSuccess);
router.route("/fail").post(paymentFail);
router.route("/cancel").post(paymentCancel);
router.route("/ipn").post(handleIPN);

// Get payment status (protected)
router.route("/:tran_id").get(verifyjwt, getPaymentStatus);

export default router;
