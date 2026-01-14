import { Admin } from "../models/admin.model.js";
import { Deliveryman } from "../models/deliveryman.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Generate tokens
const generateAccessAndRefreshTokens = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Token generation error:', error);
    throw new ApiError(
      500,
      `Failed to generate tokens: ${error.message}`
    );
  }
};

// Register admin
const registerAdmin = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  // Validate required fields
  if ([userName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if admin already exists
  const existedAdmin = await Admin.findOne({
    $or: [{ userName }, { email }]
  });

  if (existedAdmin) {
    throw new ApiError(409, "Admin with email or username already exists");
  }

  // Create admin
  const admin = await Admin.create({
    userName: userName.toLowerCase(),
    email,
    password
  });

  // Get created admin without sensitive data
  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering the admin");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin registered successfully"));
});

// Login admin
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  // Validate input
  if (!userName && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // Find admin
  const admin = await Admin.findOne({
    $or: [{ userName }, { email }]
  });

  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }

  // Check password
  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    admin._id
  );

  // Get admin data without sensitive information
  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  // Cookie options
  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          admin: loggedInAdmin,
          accessToken,
          refreshToken
        },
        "Admin logged in successfully"
      )
    );
});

// Logout admin
const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out"));
});

// Refresh admin access token
const refreshAdminToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Verify it's an admin token
    if (decoded.role !== 'admin') {
      throw new ApiError(403, "Invalid token type");
    }
    
    const admin = await Admin.findById(decoded._id);
    
    if (!admin) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (admin.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or revoked");
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);
    const safeAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { admin: safeAdmin, accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid or expired refresh token");
  }
});

// Create delivery man (Admin only)
// This endpoint allows admin to create new delivery men accounts
const createDeliveryman = asyncHandler(async (req, res) => {
  const { name, email, phone, password, vehicleType, vehicleNumber, licenseNumber } = req.body;

  // Validate required fields
  if ([name, email, phone, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Name, email, phone, and password are required");
  }

  // Check if delivery man already exists
  const existedDeliveryman = await Deliveryman.findOne({
    $or: [{ email }, { phone }]
  });

  if (existedDeliveryman) {
    throw new ApiError(409, "Delivery man with email or phone already exists");
  }

  // Create delivery man
  const deliveryman = await Deliveryman.create({
    name,
    email,
    phone,
    password,
    vehicleType,
    vehicleNumber,
    licenseNumber
  });

  const createdDeliveryman = await Deliveryman.findById(deliveryman._id).select(
    "-password -refreshToken"
  );

  if (!createdDeliveryman) {
    throw new ApiError(500, "Something went wrong while creating delivery man");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdDeliveryman, "Delivery man created successfully"));
});

// Get all delivery men (Admin only)
const getAllDeliverymen = asyncHandler(async (req, res) => {
  const deliverymen = await Deliveryman.find().select("-password -refreshToken").sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, deliverymen, "Delivery men fetched successfully"));
});

// Update delivery man status (Admin only)
const updateDeliverymanStatus = asyncHandler(async (req, res) => {
  const { deliverymanId } = req.params;
  const { isActive } = req.body;

  const deliveryman = await Deliveryman.findByIdAndUpdate(
    deliverymanId,
    { isActive },
    { new: true }
  ).select("-password -refreshToken");

  if (!deliveryman) {
    throw new ApiError(404, "Delivery man not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deliveryman, "Delivery man status updated successfully"));
});

// Delete delivery man (Admin only)
const deleteDeliveryman = asyncHandler(async (req, res) => {
  const { deliverymanId } = req.params;

  const deliveryman = await Deliveryman.findByIdAndDelete(deliverymanId);

  if (!deliveryman) {
    throw new ApiError(404, "Delivery man not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Delivery man deleted successfully"));
});

// Assign order to delivery man (Admin only)
const assignOrderToDeliveryman = asyncHandler(async (req, res) => {
  const { orderId, deliverymanId } = req.body;

  if (!orderId || !deliverymanId) {
    throw new ApiError(400, "Order ID and Delivery man ID are required");
  }

  // Check if delivery man exists and is active
  const deliveryman = await Deliveryman.findById(deliverymanId);
  if (!deliveryman) {
    throw new ApiError(404, "Delivery man not found");
  }

  if (!deliveryman.isActive) {
    throw new ApiError(400, "Delivery man is not active");
  }

  // Check if order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status === 'Delivered' || order.status === 'Cancelled') {
    throw new ApiError(400, "Cannot assign delivered or cancelled orders");
  }

  // Assign delivery man to order
  order.deliveryman = deliverymanId;
  order.assignedAt = new Date();
  order.status = 'Out for Delivery';
  await order.save();

  // Update delivery man stats
  deliveryman.totalDeliveries += 1;
  await deliveryman.save();

  const updatedOrder = await Order.findById(orderId)
    .populate('user', 'fullName email')
    .populate('items.product', 'name price image')
    .populate('deliveryman', 'name phone vehicleType vehicleNumber');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order assigned to delivery man successfully"));
});

// Get delivery man performance stats (Admin only)
const getDeliverymanStats = asyncHandler(async (req, res) => {
  const { deliverymanId } = req.params;

  const deliveryman = await Deliveryman.findById(deliverymanId).select("-password -refreshToken");
  
  if (!deliveryman) {
    throw new ApiError(404, "Delivery man not found");
  }

  // Get order stats
  const orders = await Order.find({ deliveryman: deliverymanId });
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const pendingOrders = orders.filter(o => o.status === 'Out for Delivery');

  const stats = {
    deliveryman,
    totalAssigned: orders.length,
    delivered: deliveredOrders.length,
    pending: pendingOrders.length,
    successRate: orders.length > 0 ? ((deliveredOrders.length / orders.length) * 100).toFixed(2) : 0
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Delivery man stats fetched successfully"));
});

// Get revenue statistics
const getRevenueStats = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  // Get all paid orders
  const paidOrders = await Order.find({ 
    paymentStatus: 'Paid' 
  }).select('totalAmount createdAt');

  // Calculate overall total revenue
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = paidOrders.length;

  // Get available years from orders
  const availableYears = [...new Set(paidOrders.map(order => 
    new Date(order.createdAt).getFullYear()
  ))].sort((a, b) => b - a);

  // If specific year and month provided, get daily revenue for that month
  if (year && month) {
    const selectedYear = parseInt(year);
    const selectedMonth = parseInt(month);
    
    // Filter orders for the selected month
    const monthOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === selectedYear && 
             orderDate.getMonth() + 1 === selectedMonth;
    });

    // Get number of days in the selected month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    
    // Initialize daily data
    const dailyData = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dailyData[key] = { date: day, revenue: 0, orders: 0 };
    }
    
    // Aggregate orders by day
    monthOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const day = orderDate.getDate();
      const key = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      dailyData[key].revenue += order.totalAmount;
      dailyData[key].orders += 1;
    });
    
    // Calculate month totals
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthOrderCount = monthOrders.length;

    return res
      .status(200)
      .json(new ApiResponse(200, {
        totalRevenue,
        totalOrders,
        monthRevenue,
        monthOrders: monthOrderCount,
        availableYears,
        dailyData: Object.values(dailyData)
      }, "Revenue statistics fetched successfully"));
  }

  // If only year provided, get monthly revenue for that year
  if (year) {
    const selectedYear = parseInt(year);
    const monthlyData = {};
    
    // Initialize all 12 months
    for (let m = 1; m <= 12; m++) {
      const key = `${selectedYear}-${String(m).padStart(2, '0')}`;
      monthlyData[key] = { month: m, revenue: 0, orders: 0 };
    }
    
    // Filter and aggregate orders for the selected year
    paidOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === selectedYear) {
        const month = orderDate.getMonth() + 1;
        const key = `${selectedYear}-${String(month).padStart(2, '0')}`;
        
        monthlyData[key].revenue += order.totalAmount;
        monthlyData[key].orders += 1;
      }
    });

    const yearRevenue = Object.values(monthlyData).reduce((sum, m) => sum + m.revenue, 0);
    const yearOrders = Object.values(monthlyData).reduce((sum, m) => sum + m.orders, 0);

    return res
      .status(200)
      .json(new ApiResponse(200, {
        totalRevenue,
        totalOrders,
        yearRevenue,
        yearOrders,
        availableYears,
        monthlyData: Object.values(monthlyData)
      }, "Revenue statistics fetched successfully"));
  }

  // Default: return overview with available years
  return res
    .status(200)
    .json(new ApiResponse(200, {
      totalRevenue,
      totalOrders,
      availableYears
    }, "Revenue statistics fetched successfully"));
});

export { 
  registerAdmin, 
  loginAdmin, 
  logoutAdmin, 
  refreshAdminToken,
  createDeliveryman,
  getAllDeliverymen,
  updateDeliverymanStatus,
  deleteDeliveryman,
  assignOrderToDeliveryman,
  getDeliverymanStats,
  getRevenueStats
};
