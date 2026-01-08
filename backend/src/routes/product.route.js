import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById);

// Admin routes
router.route("/").post(verifyAdmin, upload.single('image'), createProduct);
router.route("/:id").patch(verifyAdmin, upload.single('image'), updateProduct);
router.route("/:id").delete(verifyAdmin, deleteProduct);

export default router;
