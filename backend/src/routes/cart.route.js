import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from "../controllers/cart.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

// All cart routes require authentication
router.use(verifyjwt);

router.route("/").get(getCart);
router.route("/add").post(addToCart);
router.route("/update").patch(updateCartItem);
router.route("/remove/:productId").delete(removeFromCart);
router.route("/clear").delete(clearCart);

export default router;
