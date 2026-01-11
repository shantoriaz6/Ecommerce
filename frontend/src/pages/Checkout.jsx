import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import axiosInstance from '../services/axios'

const Checkout = () => {
  const { cart, cartCount, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod') // 'cod' or 'sslcommerz'
  const [formData, setFormData] = useState({
    shippingAddress: '',
    city: '',
    postalCode: '',
    phone: ''
  })

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0).toFixed(2)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (cartCount === 0) {
      toast.warning('Your cart is empty')
      return
    }

    // Validate form
    if (!formData.shippingAddress || !formData.city || !formData.postalCode || !formData.phone) {
      toast.warning('Please fill in all fields')
      return
    }

    // If SSL Commerz is selected, redirect to payment page with form data
    if (paymentMethod === 'sslcommerz') {
      // Store form data and navigate to payment page
      navigate('/payment', {
        state: {
          shippingInfo: formData,
          cart: cart,
          totalAmount: calculateTotal()
        }
      })
      return
    }

    // Handle Cash on Delivery
    try {
      setLoading(true)

      // Prepare order items from cart
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }))

      const orderData = {
        items: orderItems,
        totalAmount: parseFloat(calculateTotal()),
        shippingAddress: `${formData.shippingAddress}, ${formData.city}, ${formData.postalCode}`,
        phone: formData.phone,
        paymentMethod: 'Cash on Delivery'
      }

      const response = await axiosInstance.post('/orders', orderData)

      if (response.data.success) {
        // Clear the cart after successful order
        await clearCart()
        toast.success('Order placed successfully! You will receive confirmation once admin approves.')
        navigate('/orders')
      }
    } catch (err) {
      console.error('Error placing order:', err)
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#284B63' }}>Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before checking out!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            style={{ backgroundColor: '#284B63' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#284B63' }}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#284B63' }}>Shipping Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New York"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="border-t pt-6 mt-6">
                  <label className="block text-lg font-semibold mb-4" style={{ color: '#284B63' }}>
                    Payment Method *
                  </label>
                  
                  <div className="space-y-3">
                    {/* Cash on Delivery Option */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition duration-200 ${
                        paymentMethod === 'cod'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={paymentMethod === 'cod' ? { borderColor: '#284B63', backgroundColor: '#f0f4f8' } : {}}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="cod"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 mr-3"
                          style={{ accentColor: '#284B63' }}
                        />
                        <div className="flex-1">
                          <label htmlFor="cod" className="font-semibold cursor-pointer" style={{ color: '#284B63' }}>
                            💵 Cash on Delivery
                          </label>
                          <p className="text-sm text-gray-600 mt-1">Pay with cash when your order is delivered</p>
                        </div>
                      </div>
                    </div>

                    {/* SSL Commerz Option */}
                    <div
                      onClick={() => setPaymentMethod('sslcommerz')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition duration-200 ${
                        paymentMethod === 'sslcommerz'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={paymentMethod === 'sslcommerz' ? { borderColor: '#284B63', backgroundColor: '#f0f4f8' } : {}}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="sslcommerz"
                          name="paymentMethod"
                          value="sslcommerz"
                          checked={paymentMethod === 'sslcommerz'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 mr-3"
                          style={{ accentColor: '#284B63' }}
                        />
                        <div className="flex-1">
                          <label htmlFor="sslcommerz" className="font-semibold cursor-pointer" style={{ color: '#284B63' }}>
                            💳 SSL Commerz
                          </label>
                          <p className="text-sm text-gray-600 mt-1">Pay securely online with credit/debit card, mobile banking, or internet banking</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#284B63' }}
                >
                  {loading 
                    ? 'Processing...' 
                    : paymentMethod === 'sslcommerz' 
                      ? '🔒 Proceed to Payment' 
                      : '📦 Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#284B63' }}>Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart?.items?.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: '#284B63' }}>{item.product.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold" style={{ color: '#284B63' }}>
                      {(item.product.price * item.quantity).toFixed(2)}৳
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span style={{ color: '#284B63' }}>{calculateTotal()}৳</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span style={{ color: '#284B63' }}>Total</span>
                  <span style={{ color: '#284B63' }}>{calculateTotal()}৳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
