import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateAccountDetails,
  changePassword,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// Protected
router.post("/logout", verifyjwt, logoutUser);
router.get("/profile", verifyjwt, getUserProfile);
router.patch("/profile", verifyjwt, updateAccountDetails);
router.post("/change-password", verifyjwt, changePassword);

export default router;
