import { Deliveryman } from "../models/deliveryman.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// Generate tokens
const generateAccessAndRefreshTokens = async (deliverymanId) => {
  try {
    const deliveryman = await Deliveryman.findById(deliverymanId);
    if (!deliveryman) {
      throw new ApiError(404, "Delivery man not found");
    }

    const accessToken = deliveryman.generateAccessToken();
    const refreshToken = deliveryman.generateRefreshToken();

    deliveryman.refreshToken = refreshToken;
    await deliveryman.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to generate tokens: ${error.message}`
    );
  }
};

// Login delivery man
const loginDeliveryman = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  // Validate input
  if (!email && !phone) {
    throw new ApiError(400, "Email or phone is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // Find delivery man
  const deliveryman = await Deliveryman.findOne({
    $or: [{ email }, { phone }]
  });

  if (!deliveryman) {
    throw new ApiError(404, "Delivery man does not exist");
  }

  if (!deliveryman.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Contact admin.");
  }

  // Check password
  const isPasswordValid = await deliveryman.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    deliveryman._id
  );

  // Get delivery man data without sensitive information
  const loggedInDeliveryman = await Deliveryman.findById(deliveryman._id).select(
    "-password -refreshToken"
  );

  // Cookie options
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          deliveryman: loggedInDeliveryman,
          accessToken,
          refreshToken
        },
        "Delivery man logged in successfully"
      )
    );
});

// Logout delivery man
const logoutDeliveryman = asyncHandler(async (req, res) => {
  await Deliveryman.findByIdAndUpdate(
    req.deliveryman._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Delivery man logged out"));
});

// Refresh delivery man access token
const refreshDeliverymanToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
  
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    if (decoded.role !== 'deliveryman') {
      throw new ApiError(403, "Invalid token type");
    }
    
    const deliveryman = await Deliveryman.findById(decoded._id);
    
    if (!deliveryman) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (deliveryman.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or revoked");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(deliveryman._id);
    const safeDeliveryman = await Deliveryman.findById(deliveryman._id).select("-password -refreshToken");

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { deliveryman: safeDeliveryman, accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid or expired refresh token");
  }
});

// Get delivery man profile
const getDeliverymanProfile = asyncHandler(async (req, res) => {
  const deliveryman = await Deliveryman.findById(req.deliveryman._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, deliveryman, "Delivery man profile fetched successfully"));
});

// Update availability status
const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const deliveryman = await Deliveryman.findByIdAndUpdate(
    req.deliveryman._id,
    { isAvailable },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, deliveryman, "Availability updated successfully"));
});

// Update location
const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const deliveryman = await Deliveryman.findByIdAndUpdate(
    req.deliveryman._id,
    { 
      currentLocation: { latitude, longitude }
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, deliveryman, "Location updated successfully"));
});

// Get assigned orders
const getAssignedOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = { deliveryman: req.deliveryman._id };
  
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('user', 'fullName email phone')
    .populate('items.product', 'name price image')
    .sort({ assignedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, deliveryNotes } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const order = await Order.findOne({ 
    _id: orderId, 
    deliveryman: req.deliveryman._id 
  });

  if (!order) {
    throw new ApiError(404, "Order not found or not assigned to you");
  }

  order.status = status;
  if (deliveryNotes) {
    order.deliveryNotes = deliveryNotes;
  }

  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    
    // Update delivery man stats
    const deliveryman = await Deliveryman.findById(req.deliveryman._id);
    deliveryman.completedDeliveries += 1;
    await deliveryman.save();
  }

  await order.save();

  const updatedOrder = await Order.findById(orderId)
    .populate('user', 'fullName email phone')
    .populate('items.product', 'name price image');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order status updated successfully"));
});

// Accept or deny an assigned order
const decideAssignedOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { decision, note } = req.body;

  if (!decision) {
    throw new ApiError(400, "Decision is required");
  }

  const normalizedDecision = String(decision).trim();
  const allowedDecisions = ["Accepted", "Denied"];
  if (!allowedDecisions.includes(normalizedDecision)) {
    throw new ApiError(400, "Decision must be 'Accepted' or 'Denied'");
  }

  const order = await Order.findOne({
    _id: orderId,
    deliveryman: req.deliveryman._id
  });

  if (!order) {
    throw new ApiError(404, "Order not found or not assigned to you");
  }

  if (order.deliverymanDecision && order.deliverymanDecision !== "Pending") {
    throw new ApiError(400, `Order has already been ${order.deliverymanDecision.toLowerCase()}`);
  }

  order.deliverymanDecision = normalizedDecision;
  order.deliverymanDecisionAt = new Date();
  if (typeof note === "string" && note.trim().length > 0) {
    order.deliverymanDecisionNote = note.trim();
  }

  await order.save();

  const updatedOrder = await Order.findById(orderId)
    .populate('user', 'fullName email phone')
    .populate('items.product', 'name price image')
    .populate('deliveryman', 'name phone email vehicleType vehicleNumber');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, `Order ${normalizedDecision.toLowerCase()} successfully`));
});

// Get delivery statistics
const getDeliveryStats = asyncHandler(async (req, res) => {
  const deliveryman = await Deliveryman.findById(req.deliveryman._id).select("-password -refreshToken");
  
  const totalOrders = await Order.countDocuments({ deliveryman: req.deliveryman._id });
  const deliveredOrders = await Order.countDocuments({ 
    deliveryman: req.deliveryman._id, 
    status: 'Delivered' 
  });
  const pendingOrders = await Order.countDocuments({ 
    deliveryman: req.deliveryman._id, 
    status: 'Out for Delivery' 
  });

  const stats = {
    profile: deliveryman,
    totalAssigned: totalOrders,
    delivered: deliveredOrders,
    pending: pendingOrders,
    successRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(2) : 0
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Statistics fetched successfully"));
});

export {
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
};
