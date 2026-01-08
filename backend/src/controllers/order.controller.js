import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create order (User)
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, phone } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one item");
  }

  // Calculate total and verify products
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      throw new ApiError(404, `Product ${item.product} not found`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price
    });

    totalAmount += product.price * item.quantity;

    // Update product stock
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress: shippingAddress || req.user.address,
    phone: phone || req.user.contactNumber
  });

  // Clear user's cart after successful order
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] }
  );

  const populatedOrder = await Order.findById(order._id).populate('items.product');

  return res
    .status(201)
    .json(new ApiResponse(201, populatedOrder, "Order created successfully"));
});

// Get user orders
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Get single order
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate('items.product')
    .populate('user', 'fullName email contactNumber');

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if user owns this order or is admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// Get all orders (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('items.product')
    .populate('user', 'fullName email contactNumber')
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders fetched successfully"));
});

// Update order status (Admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = status;
  await order.save();

  const updatedOrder = await Order.findById(id)
    .populate('items.product')
    .populate('user', 'fullName email contactNumber');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOrder, "Order status updated successfully"));
});

// Cancel order (User)
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }

  if (order.status !== 'Pending') {
    throw new ApiError(400, "Can only cancel pending orders");
  }

  order.status = 'Cancelled';
  await order.save();

  // Restore product stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

export {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};
