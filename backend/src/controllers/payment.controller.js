import { Payment } from "../models/payment.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { initPaymentForOrder } from '../services/sslcommerz.service .js';
import { getSslcz } from '../config/sslcommerz.js';

// Initialize payment
const initPayment = asyncHandler(async (req, res) => {
  const { items, totalAmount, shippingAddress, phone, city, postalCode } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one item");
  }

  if (!totalAmount || !shippingAddress || !phone) {
    throw new ApiError(400, "Missing required fields");
  }

  // Verify products and calculate total
  let calculatedTotal = 0;
  const populatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      throw new ApiError(404, `Product ${item.product} not found`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    populatedItems.push({
      product: {
        _id: product._id,
        name: product.name,
        price: product.price
      },
      quantity: item.quantity,
      price: item.price || product.price
    });

    calculatedTotal += (item.price || product.price) * item.quantity;
  }

  // Prepare order data
  const orderData = {
    items: populatedItems,
    totalAmount: parseFloat(totalAmount),
    shippingAddress,
    phone,
    city,
    postalCode
  };

  // Initialize payment with SSL Commerz
  const { GatewayPageURL, tran_id } = await initPaymentForOrder({
    orderData,
    user: req.user
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { GatewayPageURL, tran_id }, "Payment initialized successfully"));
});

// Payment success callback
const paymentSuccess = asyncHandler(async (req, res) => {
  const { tran_id, val_id, amount } = req.body;

  // Find payment record
  const payment = await Payment.findOne({ tran_id });

  if (!payment) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/checkout?payment=failed&error=payment_not_found`);
  }

  // Validate payment with SSL Commerz
  const sslcz = getSslcz();
  const validation = await sslcz.validate({ val_id });

  if (validation.status !== 'VALID' && validation.status !== 'VALIDATED') {
    payment.status = 'failed';
    await payment.save();
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/checkout?payment=failed&error=validation_failed`);
  }

  // Update payment status
  payment.status = 'success';
  payment.val_id = val_id;
  payment.paymentDetails = req.body;
  await payment.save();

  // Create order
  const orderData = payment.orderData;
  
  // Prepare order items with product IDs
  const orderItems = [];
  for (const item of orderData.items) {
    const productId = typeof item.product === 'object' ? item.product._id : item.product;
    const product = await Product.findById(productId);
    
    if (product) {
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
  }

  const order = await Order.create({
    user: payment.user,
    items: orderItems,
    totalAmount: payment.amount,
    shippingAddress: orderData.shippingAddress,
    phone: orderData.phone,
    paymentStatus: 'Paid',
    status: 'Pending'
  });

  // Link order to payment
  payment.order = order._id;
  await payment.save();

  // Clear user's cart
  await Cart.findOneAndUpdate(
    { user: payment.user },
    { items: [] }
  );

  // Redirect to frontend success page
  return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/orders?payment=success`);
});

// Payment failure callback
const paymentFail = asyncHandler(async (req, res) => {
  const { tran_id } = req.body;

  // Find and update payment record
  const payment = await Payment.findOne({ tran_id });
  if (payment) {
    payment.status = 'failed';
    payment.paymentDetails = req.body;
    await payment.save();
  }

  // Redirect to frontend checkout page
  return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/checkout?payment=failed`);
});

// Payment cancel callback
const paymentCancel = asyncHandler(async (req, res) => {
  const { tran_id } = req.body;

  // Find and update payment record
  const payment = await Payment.findOne({ tran_id });
  if (payment) {
    payment.status = 'cancelled';
    payment.paymentDetails = req.body;
    await payment.save();
  }

  // Redirect to frontend checkout page
  return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/checkout?payment=cancelled`);
});

// IPN (Instant Payment Notification) handler
const handleIPN = asyncHandler(async (req, res) => {
  const { tran_id, status } = req.body;

  const payment = await Payment.findOne({ tran_id });
  if (payment) {
    if (status === 'VALID' || status === 'VALIDATED') {
      payment.status = 'success';
    } else {
      payment.status = 'failed';
    }
    payment.paymentDetails = req.body;
    await payment.save();
  }

  return res.status(200).json({ message: 'IPN received' });
});

// Get payment status
const getPaymentStatus = asyncHandler(async (req, res) => {
  const { tran_id } = req.params;

  const payment = await Payment.findOne({ tran_id })
    .populate('order')
    .populate('user', 'fullName email');

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  // Check if user owns this payment or is admin
  if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment status fetched successfully"));
});

export {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  handleIPN,
  getPaymentStatus
};
