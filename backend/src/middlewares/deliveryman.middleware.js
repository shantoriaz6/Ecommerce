import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Deliveryman } from "../models/deliveryman.model.js";

export const verifyDeliveryman = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if the token is from a delivery man
    if (decodedToken.role !== 'deliveryman') {
      throw new ApiError(403, "Access denied. Delivery man only.");
    }

    const deliveryman = await Deliveryman.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!deliveryman) {
      throw new ApiError(401, "Invalid Access Token");
    }

    if (!deliveryman.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    req.deliveryman = deliveryman;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
