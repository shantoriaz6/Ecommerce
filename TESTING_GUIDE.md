# Quick Testing Guide - Cart & Order System

## Prerequisites
- Backend running on: http://localhost:8000
- Frontend running on: http://localhost:5174
- MongoDB connected
- At least one admin account and one user account
- Some products in the database

## Step-by-Step Testing

### 1. User Registration & Login
1. Open http://localhost:5174
2. Click "Sign In" → "Register" (if not already registered)
3. Create a user account
4. Login with your credentials
5. Verify you see "Sign Out" in the navbar

### 2. Browse Products
1. On the Home page, you should see all products
2. Click on any category link (e.g., "Phone", "Laptop")
3. Verify products are filtered by category

### 3. Add Products to Cart
1. Click "Add to Cart" on any product
2. Check that:
   - You get an alert "Product added to cart!"
   - The cart count in the navbar increases
   - The count appears both in desktop (badge) and mobile menu

### 4. View Cart
1. Click the cart icon in the navbar (or "Cart (X)" in mobile menu)
2. Verify you can see:
   - All items you added
   - Product images, names, and prices
   - Quantity controls (- and +)
   - Remove button (trash icon)
   - Order summary with total
3. Test quantity changes:
   - Click + to increase quantity
   - Click - to decrease quantity
   - Verify total updates
4. Test remove:
   - Click trash icon on an item
   - Verify item is removed and total updates

### 5. Checkout Process
1. From cart page, click "Proceed to Checkout"
2. Fill in the shipping form:
   - Street Address
   - City
   - Postal Code
   - Phone Number
3. Verify order summary shows correct items and total
4. Click "Place Order"
5. Verify:
   - Success message appears
   - Cart is cleared (count becomes 0)
   - You're redirected to /orders

### 6. View Your Orders
1. Go to "My Orders" (click cart → you'll see link, or navigate to /orders)
2. Verify you can see:
   - Your order with "Pending" status (yellow badge)
   - Order date and total amount
   - All order items with images
   - Shipping address and phone number

### 7. Admin Login
1. In a new tab or after logging out, go to http://localhost:5174/admin/login
2. Login with admin credentials
3. Navigate to "User Orders" from admin sidebar

### 8. Admin Order Management
1. Find the pending order you just created
2. Verify you can see:
   - Customer name and email
   - Order items
   - Shipping address and phone
   - Status dropdown
3. Test order confirmation:
   - Click "Confirm Order" button
   - Verify success alert appears
   - Status changes to "Confirmed" (blue badge)
4. Test status updates:
   - Change status using dropdown (e.g., to "Shipped")
   - Verify alert appears and status updates

### 9. User Order Status Update
1. Go back to user account (logout admin, login as user)
2. Go to "My Orders" (/orders)
3. Verify order status shows "Confirmed" or "Shipped"
4. Check that status badge color matches:
   - Yellow = Pending
   - Blue = Confirmed
   - Purple = Shipped
   - Green = Delivered
   - Red = Cancelled

## Test Scenarios

### Scenario A: Empty Cart
1. Without adding any products, click cart icon
2. Verify empty cart message appears
3. Click "Continue Shopping" → should go to Home

### Scenario B: Stock Management
1. Add a product to cart with quantity more than available stock
2. Try to place order
3. Should get error about insufficient stock

### Scenario C: Multiple Products
1. Add 3-4 different products to cart
2. Adjust quantities for each
3. Remove one item
4. Place order
5. Verify all remaining items appear in order

### Scenario D: Cart Persistence
1. Add products to cart
2. Refresh the page
3. Verify cart count is still correct
4. Open cart → items should still be there

### Scenario E: Unauthenticated Access
1. Logout (if logged in)
2. Try to add product to cart
3. Should get error or be redirected to login
4. Try to access /cart, /checkout, /orders
5. Should be redirected to login

## Expected Results

### Cart Count Display:
✓ Shows correct number of items
✓ Updates immediately when adding to cart
✓ Updates when changing quantities
✓ Becomes 0 after placing order
✓ Shows badge only when count > 0 (desktop)

### Cart Page:
✓ Shows all items with correct details
✓ Quantity controls work correctly
✓ Can't decrease below 1
✓ Can't increase above stock
✓ Remove button works
✓ Total calculates correctly
✓ "Proceed to Checkout" navigates to /checkout

### Checkout:
✓ Form validation works
✓ Can't submit with empty fields
✓ Order is created successfully
✓ Cart is cleared after order
✓ Redirects to /orders

### Orders Page:
✓ Shows all user orders
✓ Displays correct order details
✓ Status badge shows correct color
✓ Empty state when no orders

### Admin Orders:
✓ Shows all customer orders
✓ Can update status
✓ Confirm button works
✓ Success notifications appear
✓ Changes reflect immediately

## Common Issues & Solutions

### Issue: Cart count not updating
**Solution**: Make sure CartProvider is wrapped around App in main.jsx

### Issue: "Unauthorized" errors
**Solution**: Verify you're logged in and token is in localStorage

### Issue: Products not showing in cart
**Solution**: Check browser console for errors, verify backend is running

### Issue: Can't place order
**Solution**: 
- Check that you filled all required fields
- Verify products have sufficient stock
- Check backend logs for errors

### Issue: Admin can't see orders
**Solution**: 
- Make sure you're logged in as admin
- Check that adminAccessToken is in localStorage
- Verify /api/v1/orders/all endpoint is working

### Issue: Order status not updating
**Solution**:
- Check admin authentication
- Verify status value is valid enum
- Check backend response in network tab

## API Testing (Optional)

Use Postman or similar tool:

### Get Cart (User)
```
GET http://localhost:8000/api/v1/cart
Headers: Authorization: Bearer <user_access_token>
```

### Add to Cart (User)
```
POST http://localhost:8000/api/v1/cart
Headers: Authorization: Bearer <user_access_token>
Body: {
  "productId": "<product_id>",
  "quantity": 1
}
```

### Create Order (User)
```
POST http://localhost:8000/api/v1/orders
Headers: Authorization: Bearer <user_access_token>
Body: {
  "items": [{
    "product": "<product_id>",
    "quantity": 1,
    "price": 999
  }],
  "totalAmount": 999,
  "shippingAddress": "123 Main St, City, 12345",
  "phone": "+1234567890"
}
```

### Get All Orders (Admin)
```
GET http://localhost:8000/api/v1/orders/all
Headers: Authorization: Bearer <admin_access_token>
```

### Update Order Status (Admin)
```
PATCH http://localhost:8000/api/v1/orders/<order_id>/status
Headers: Authorization: Bearer <admin_access_token>
Body: {
  "status": "Confirmed"
}
```

## Success Criteria
✓ Cart count displays correctly
✓ Can add products to cart
✓ Can view and manage cart
✓ Can checkout and place order
✓ Cart clears after order
✓ Can view order history
✓ Admin can see all orders
✓ Admin can confirm/update orders
✓ Status updates reflect immediately
✓ No console errors
✓ All pages responsive

## Notes
- The system uses JWT authentication for both users and admins
- Cart data is stored in MongoDB, not localStorage
- Order confirmations currently use browser alerts
- Stock is automatically reduced when order is placed
- Stock is restored if order is cancelled

Happy Testing! 🎉
