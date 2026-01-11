import { getSslcz } from '../config/sslcommerz.js';
import { Payment } from '../models/payment.model.js';
import { Order } from '../models/order.model.js';
import { v4 as uuidv4 } from 'uuid';

export const initPaymentForOrder = async ({ orderData, user }) => {
  // Generate unique transaction ID
  const tran_id = `TXN_${Date.now()}_${uuidv4().slice(0, 8)}`;
  
  // Extract customer details
  const customerName = user.fullName || 'Customer';
  const customerEmail = user.email || 'customer@example.com';
  const customerPhone = orderData.phone || user.contactNumber || '01700000000';
  
  // Extract shipping address
  const shippingAddress = orderData.shippingAddress || user.address?.street || 'Dhaka';
  const city = orderData.city || user.address?.city || 'Dhaka';
  const postalCode = orderData.postalCode || user.address?.postalCode || '1000';
  const country = user.address?.country || 'Bangladesh';
  
  // Calculate total amount
  const totalAmount = parseFloat(orderData.totalAmount);
  
  // Prepare product names from order items
  const productNames = orderData.items.map(item => item.product?.name || 'Product').join(', ');
  const productIds = orderData.items.map(item => item.product).join(',');
  
  // SSL Commerz payment data
  const data = {
    total_amount: totalAmount,
    currency: 'BDT',
    tran_id: tran_id,
    success_url: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/payment/success`,
    fail_url: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/payment/fail`,
    cancel_url: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/payment/cancel`,
    ipn_url: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/payment/ipn`,
    shipping_method: 'Courier',
    product_name: productNames.substring(0, 100),
    product_category: 'General',
    product_profile: 'general',
    cus_name: customerName,
    cus_email: customerEmail,
    cus_add1: shippingAddress,
    cus_add2: shippingAddress,
    cus_city: city,
    cus_state: city,
    cus_postcode: postalCode,
    cus_country: country,
    cus_phone: customerPhone,
    cus_fax: customerPhone,
    ship_name: customerName,
    ship_add1: shippingAddress,
    ship_add2: shippingAddress,
    ship_city: city,
    ship_state: city,
    ship_postcode: postalCode,
    ship_country: country,
    value_a: user._id.toString(), // Store user ID
    value_b: JSON.stringify(orderData.items.map(item => ({ product: item.product, quantity: item.quantity, price: item.price }))), // Store order items
    value_c: shippingAddress, // Store full shipping address
    value_d: customerPhone, // Store phone
  };

  const sslcz = getSslcz();
  const apiResponse = await sslcz.init(data);

  const GatewayPageURL = apiResponse?.GatewayPageURL;
  if (!GatewayPageURL) {
    throw new Error('Failed to get GatewayPageURL from SSL Commerz');
  }

  // Create payment record
  await Payment.create({
    user: user._id,
    tran_id,
    amount: totalAmount,
    status: 'initiated',
    currency: 'BDT',
    orderData: orderData,
  });

  return { GatewayPageURL, tran_id };
};
