# SSL Commerz Payment Integration Documentation

## Overview
This document provides comprehensive information about the SSL Commerz payment gateway integration in the e-commerce application.

## Features Implemented

### 1. Payment Method Selection (Checkout Page)
- Users can choose between two payment methods:
  - **Cash on Delivery (COD)**: Traditional payment method where customers pay when they receive the order
  - **SSL Commerz**: Online payment gateway supporting multiple payment options

### 2. Dynamic Button Behavior
- **Cash on Delivery**: Shows "📦 Place Order" button
  - Directly creates order with COD payment method
  - Order status: Pending (awaiting admin approval)
  
- **SSL Commerz**: Shows "🔒 Proceed to Payment" button
  - Redirects to secure payment page
  - Preserves shipping information and cart data

### 3. Secure Payment Page
- Professional payment interface with:
  - SSL Commerz gateway information
  - Available payment methods display
  - Complete order summary with product images
  - Shipping information review
  - Security information and trust indicators
  - Step-by-step payment process guide

## User Flow

### Cash on Delivery Flow
```
Checkout → Select "Cash on Delivery" → Fill Shipping Info → Click "Place Order" → Order Created → Orders Page
```

### SSL Commerz Flow
```
Checkout → Select "SSL Commerz" → Fill Shipping Info → Click "Proceed to Payment" 
→ Payment Page → Review Order → Click "Proceed to SSL Commerz" 
→ SSL Gateway → Complete Payment → Success Page → Orders Page
```

## Technical Implementation

### Frontend Components

#### 1. Checkout.jsx
**Location**: `/frontend/src/pages/Checkout.jsx`

**Key Features**:
- Payment method state management
- Radio button selection for payment methods
- Conditional routing based on payment selection
- Form validation before submission

**State Variables**:
```javascript
const [paymentMethod, setPaymentMethod] = useState('cod') // 'cod' or 'sslcommerz'
```

**Payment Method Options**:
```javascript
// Cash on Delivery Option
<input type="radio" value="cod" checked={paymentMethod === 'cod'} />
💵 Cash on Delivery - Pay with cash when your order is delivered

// SSL Commerz Option
<input type="radio" value="sslcommerz" checked={paymentMethod === 'sslcommerz'} />
💳 SSL Commerz - Pay securely online with credit/debit card, mobile banking, or internet banking
```

**Conditional Submit Logic**:
```javascript
if (paymentMethod === 'sslcommerz') {
  // Navigate to payment page with data
  navigate('/payment', {
    state: {
      shippingInfo: formData,
      cart: cart,
      totalAmount: calculateTotal()
    }
  })
} else {
  // Process COD order directly
  const orderData = {
    items: orderItems,
    totalAmount: parseFloat(calculateTotal()),
    shippingAddress: fullAddress,
    phone: formData.phone,
    paymentMethod: 'Cash on Delivery'
  }
  await axiosInstance.post('/orders', orderData)
}
```

#### 2. Payment.jsx
**Location**: `/frontend/src/pages/Payment.jsx`

**Key Features**:
- Receives shipping and cart data via React Router state
- Displays comprehensive order summary
- Shows available payment methods
- Security information display
- SSL Commerz gateway integration
- Loading states and error handling

**Data Reception**:
```javascript
const { shippingInfo, cart, totalAmount } = location.state || {}
```

**Payment Initiation**:
```javascript
const handlePayment = async () => {
  const orderData = {
    items: orderItems,
    totalAmount: parseFloat(totalAmount),
    shippingAddress: fullAddress,
    phone: shippingInfo.phone,
    paymentMethod: 'SSL Commerz'
  }
  
  // Call backend API to initiate SSL Commerz payment
  const response = await axiosInstance.post('/orders/sslcommerz/init', orderData)
  
  // Redirect to SSL Commerz gateway
  if (response.data.success && response.data.data.GatewayPageURL) {
    window.location.href = response.data.data.GatewayPageURL
  }
}
```

### Backend Requirements

#### API Endpoints Needed

**1. Create Order Endpoint**
```javascript
POST /api/orders
```
**Request Body**:
```json
{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "totalAmount": 59.98,
  "shippingAddress": "123 Main St, New York, 10001",
  "phone": "+1234567890",
  "paymentMethod": "Cash on Delivery" // or "SSL Commerz"
}
```

**2. SSL Commerz Init Endpoint**
```javascript
POST /api/orders/sslcommerz/init
```
**Request Body**: Same as above

**Response**:
```json
{
  "success": true,
  "data": {
    "GatewayPageURL": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
    "sessionkey": "unique_session_key"
  }
}
```

**3. SSL Commerz Success Callback**
```javascript
POST /api/orders/sslcommerz/success
```
Handles successful payment callback from SSL Commerz

**4. SSL Commerz Failure Callback**
```javascript
POST /api/orders/sslcommerz/fail
```
Handles failed payment callback from SSL Commerz

**5. SSL Commerz Cancel Callback**
```javascript
POST /api/orders/sslcommerz/cancel
```
Handles cancelled payment callback from SSL Commerz

## SSL Commerz Configuration

### Required Environment Variables
```env
# SSL Commerz Credentials
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false  # true for production, false for sandbox

# Callback URLs
SSLCOMMERZ_SUCCESS_URL=http://yourdomain.com/api/orders/sslcommerz/success
SSLCOMMERZ_FAIL_URL=http://yourdomain.com/api/orders/sslcommerz/fail
SSLCOMMERZ_CANCEL_URL=http://yourdomain.com/api/orders/sslcommerz/cancel
SSLCOMMERZ_IPN_URL=http://yourdomain.com/api/orders/sslcommerz/ipn
```

### SSL Commerz Package Installation
```bash
cd backend
npm install sslcommerz-lts
```

### Backend Implementation Example

**Create SSL Commerz Config** (`backend/src/config/sslcommerz.js`):
```javascript
const SSLCommerzPayment = require('sslcommerz-lts')

const store_id = process.env.SSLCOMMERZ_STORE_ID
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true'

const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live)

module.exports = sslcommerz
```

**Order Controller** (`backend/src/controllers/order.controller.js`):
```javascript
const sslcommerz = require('../config/sslcommerz')

// Initialize SSL Commerz Payment
const initSSLCommerzPayment = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, phone } = req.body
    const userId = req.user._id

    // Create order in database with 'Pending Payment' status
    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      shippingAddress,
      phone,
      paymentMethod: 'SSL Commerz',
      paymentStatus: 'Pending',
      orderStatus: 'Pending Payment'
    })

    // SSL Commerz payment data
    const data = {
      total_amount: totalAmount,
      currency: 'BDT',
      tran_id: `TXN_${order._id}_${Date.now()}`,
      success_url: `${process.env.BACKEND_URL}/api/orders/sslcommerz/success`,
      fail_url: `${process.env.BACKEND_URL}/api/orders/sslcommerz/fail`,
      cancel_url: `${process.env.BACKEND_URL}/api/orders/sslcommerz/cancel`,
      ipn_url: `${process.env.BACKEND_URL}/api/orders/sslcommerz/ipn`,
      shipping_method: 'Courier',
      product_name: 'Order Items',
      product_category: 'General',
      product_profile: 'general',
      cus_name: req.user.name,
      cus_email: req.user.email,
      cus_add1: shippingAddress,
      cus_phone: phone,
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      ship_name: req.user.name,
      ship_add1: shippingAddress,
      ship_city: 'Dhaka',
      ship_country: 'Bangladesh'
    }

    // Initialize payment
    const apiResponse = await sslcommerz.init(data)
    
    // Store transaction ID in order
    order.transactionId = data.tran_id
    await order.save()

    return res.status(200).json({
      success: true,
      data: apiResponse
    })
  } catch (error) {
    console.error('SSL Commerz Init Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    })
  }
}

// Handle successful payment
const sslcommerzSuccess = async (req, res) => {
  try {
    const { tran_id, val_id } = req.body

    // Validate payment with SSL Commerz
    const validation = await sslcommerz.validate({ val_id })

    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      // Find order by transaction ID
      const order = await Order.findOne({ transactionId: tran_id })
      
      if (order) {
        // Update order status
        order.paymentStatus = 'Paid'
        order.orderStatus = 'Pending'
        order.validationId = val_id
        await order.save()

        // Redirect to success page
        return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=success`)
      }
    }

    return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=failed`)
  } catch (error) {
    console.error('SSL Commerz Success Error:', error)
    return res.redirect(`${process.env.FRONTEND_URL}/orders?payment=failed`)
  }
}

// Handle failed payment
const sslcommerzFail = async (req, res) => {
  try {
    const { tran_id } = req.body

    // Update order status
    const order = await Order.findOne({ transactionId: tran_id })
    if (order) {
      order.paymentStatus = 'Failed'
      order.orderStatus = 'Cancelled'
      await order.save()
    }

    return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=failed`)
  } catch (error) {
    console.error('SSL Commerz Fail Error:', error)
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=failed`)
  }
}

// Handle cancelled payment
const sslcommerzCancel = async (req, res) => {
  try {
    const { tran_id } = req.body

    // Update order status
    const order = await Order.findOne({ transactionId: tran_id })
    if (order) {
      order.paymentStatus = 'Cancelled'
      order.orderStatus = 'Cancelled'
      await order.save()
    }

    return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=cancelled`)
  } catch (error) {
    console.error('SSL Commerz Cancel Error:', error)
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=cancelled`)
  }
}

module.exports = {
  initSSLCommerzPayment,
  sslcommerzSuccess,
  sslcommerzFail,
  sslcommerzCancel
}
```

**Order Routes** (`backend/src/routes/order.route.js`):
```javascript
router.post('/sslcommerz/init', authMiddleware, initSSLCommerzPayment)
router.post('/sslcommerz/success', sslcommerzSuccess)
router.post('/sslcommerz/fail', sslcommerzFail)
router.post('/sslcommerz/cancel', sslcommerzCancel)
```

## Payment Gateway Details

### Supported Payment Methods via SSL Commerz
1. **Credit/Debit Cards**: Visa, MasterCard, American Express
2. **Mobile Banking**: bKash, Rocket, Nagad, Upay
3. **Internet Banking**: All major banks in Bangladesh
4. **Mobile Wallets**: OK Wallet, mCash

### Security Features
- PCI DSS Compliant
- 256-bit SSL encryption
- Secure tokenization
- 3D Secure authentication
- Fraud detection system

## Testing

### Sandbox Testing
**Test Credentials**:
- Use SSL Commerz sandbox environment
- Test cards and mobile numbers provided by SSL Commerz
- No real money transactions

**Test Card Numbers**:
```
Card Type: Visa
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
```

## Design Elements

### Color Scheme
- Primary Color: `#284B63` (Navy Blue)
- Border Color: `#D9D9D9` (Light Gray)
- Success Color: `#10B981` (Green)
- Error Color: `#EF4444` (Red)

### Icons Used
- 💵 Cash on Delivery
- 💳 SSL Commerz / Credit Card
- 📱 Mobile Banking
- 🏦 Internet Banking
- 🔒 Security/Secure Payment
- 📦 Place Order

### Responsive Design
- Mobile-first approach
- Grid layout adapts to screen size
- Touch-friendly buttons and inputs
- Optimized for all devices

## Error Handling

### Frontend Validation
- All shipping fields required
- Phone number format validation
- Payment method selection required

### Backend Validation
- User authentication required
- Cart items validation
- Amount verification
- Transaction ID uniqueness

### Error Messages
- User-friendly error messages
- Fallback to checkout page on errors
- Clear error indication
- Retry options provided

## Future Enhancements
1. Add more payment gateways (Stripe, PayPal)
2. Save payment methods for future use
3. Installment payment options
4. Payment receipt generation
5. Email notifications for payment status
6. SMS notifications
7. Payment analytics dashboard

## Support & Troubleshooting

### Common Issues
1. **Payment Gateway Not Loading**: Check SSL Commerz credentials
2. **Redirect Not Working**: Verify callback URLs
3. **Order Not Created**: Check database connection
4. **Payment Validation Failed**: Ensure proper transaction ID

### Contact Information
- SSL Commerz Support: support@sslcommerz.com
- Documentation: https://developer.sslcommerz.com

## Conclusion
This implementation provides a secure, user-friendly payment experience with support for both traditional (COD) and modern online payment methods through SSL Commerz integration.
