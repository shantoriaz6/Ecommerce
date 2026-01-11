import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import axiosInstance from '../services/axios'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Get data from checkout page
  const { shippingInfo, cart, totalAmount } = location.state || {}

  useEffect(() => {
    // Redirect if no shipping info
    if (!shippingInfo || !cart) {
      toast.error('Please complete checkout first')
      navigate('/checkout')
    }
  }, [shippingInfo, cart, navigate])

  const handlePayment = async () => {
    try {
      setProcessingPayment(true)

      // Prepare order items from cart
      const orderItems = cart.items.map(item => ({
        product: typeof item.product === 'object' ? item.product._id : item.product,
        quantity: item.quantity,
        price: typeof item.product === 'object' ? item.product.price : item.price
      }))

      const paymentData = {
        items: orderItems,
        totalAmount: parseFloat(totalAmount),
        shippingAddress: shippingInfo.shippingAddress,
        city: shippingInfo.city,
        postalCode: shippingInfo.postalCode,
        phone: shippingInfo.phone
      }

      // Initialize payment with backend
      const response = await axiosInstance.post('/payment/init', paymentData)

      if (response.data.success && response.data.data.GatewayPageURL) {
        // Redirect to SSL Commerz payment gateway
        window.location.href = response.data.data.GatewayPageURL
      } else {
        throw new Error('Failed to initiate payment')
      }
    } catch (err) {
      console.error('Error initiating payment:', err)
      toast.error(err.response?.data?.message || 'Failed to initiate payment. Please try again.')
      setProcessingPayment(false)
    }
  }

  const handleBackToCheckout = () => {
    navigate('/checkout')
  }

  if (!shippingInfo || !cart) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#284B63' }}>
              🔒 Secure Payment
            </h1>
            <p className="text-gray-600">Complete your payment using SSL Commerz</p>
          </div>

          {/* Main Payment Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6" style={{ border: '2px solid #D9D9D9' }}>
            {/* Payment Gateway Info */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">💳</div>
                  <h2 className="text-2xl font-bold" style={{ color: '#284B63' }}>SSL Commerz Payment Gateway</h2>
                  <p className="text-gray-600 mt-2">Secure & Trusted Payment Solution</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4" style={{ color: '#284B63' }}>Available Payment Methods:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg text-center border" style={{ borderColor: '#D9D9D9' }}>
                    <div className="text-3xl mb-2">💳</div>
                    <p className="text-sm font-medium">Credit Card</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center border" style={{ borderColor: '#D9D9D9' }}>
                    <div className="text-3xl mb-2">💳</div>
                    <p className="text-sm font-medium">Debit Card</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center border" style={{ borderColor: '#D9D9D9' }}>
                    <div className="text-3xl mb-2">📱</div>
                    <p className="text-sm font-medium">Mobile Banking</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center border" style={{ borderColor: '#D9D9D9' }}>
                    <div className="text-3xl mb-2">🏦</div>
                    <p className="text-sm font-medium">Internet Banking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-6 mb-6" style={{ borderColor: '#D9D9D9' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cart?.items?.map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#D9D9D9' }}>
                    <div className="flex items-center space-x-3">
                      {item.product?.images?.[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                          style={{ borderColor: '#D9D9D9' }}
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 flex items-center justify-center rounded-lg border bg-gray-100"
                          style={{ borderColor: '#D9D9D9' }}
                        >
                          <span className="text-3xl">📦</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium" style={{ color: '#284B63' }}>{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold" style={{ color: '#284B63' }}>
                      {((item.product?.price || 0) * item.quantity).toFixed(2)}৳
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span style={{ color: '#284B63' }}>{totalAmount}৳</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between pt-3 border-t text-xl font-bold" style={{ borderColor: '#D9D9D9' }}>
                  <span style={{ color: '#284B63' }}>Total Amount:</span>
                  <span style={{ color: '#284B63' }}>{totalAmount}৳</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="border-t pt-6 mb-6" style={{ borderColor: '#D9D9D9' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>Shipping Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><strong>Address:</strong> {shippingInfo.shippingAddress}</p>
                <p><strong>City:</strong> {shippingInfo.city}</p>
                <p><strong>Postal Code:</strong> {shippingInfo.postalCode}</p>
                <p><strong>Phone:</strong> {shippingInfo.phone}</p>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-2xl mr-3">🔒</div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: '#284B63' }}>Secure Payment</h4>
                  <p className="text-sm text-gray-700">
                    Your payment information is encrypted and secure. SSL Commerz is a certified payment gateway trusted by thousands of businesses.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleBackToCheckout}
                disabled={processingPayment}
                className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back to Checkout
              </button>
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="flex-1 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#284B63' }}
              >
                {processingPayment ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  '🔒 Proceed to SSL Commerz'
                )}
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-md p-6" style={{ border: '2px solid #D9D9D9' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#284B63' }}>Payment Process Information</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start">
                <span className="text-xl mr-3">1️⃣</span>
                <p>Click "Proceed to SSL Commerz" to be redirected to the secure payment gateway</p>
              </div>
              <div className="flex items-start">
                <span className="text-xl mr-3">2️⃣</span>
                <p>Select your preferred payment method (Card, Mobile Banking, or Internet Banking)</p>
              </div>
              <div className="flex items-start">
                <span className="text-xl mr-3">3️⃣</span>
                <p>Enter your payment details and complete the transaction</p>
              </div>
              <div className="flex items-start">
                <span className="text-xl mr-3">4️⃣</span>
                <p>You will be redirected back to our website after successful payment</p>
              </div>
              <div className="flex items-start">
                <span className="text-xl mr-3">5️⃣</span>
                <p>Your order will be confirmed and you'll receive an email notification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
