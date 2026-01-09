import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const { cart, cartCount, updateCartItem, removeFromCart, loading } = useCart()
  const navigate = useNavigate()

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      await updateCartItem(itemId, newQuantity)
    } catch (err) {
      alert(err.message || 'Failed to update cart')
    }
  }

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId)
    } catch (err) {
      alert(err.message || 'Failed to remove item')
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0).toFixed(2)
  }

  const handleCheckout = () => {
    if (cartCount === 0) {
      alert('Your cart is empty')
      return
    }
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#284B63' }}></div>
          <p className="mt-4" style={{ color: '#284B63' }}>Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#284B63' }}>Shopping Cart</h1>

        {cartCount === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#284B63' }}>Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              style={{ backgroundColor: '#284B63' }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart?.items?.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#284B63' }}>{item.product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.product.category}</p>
                    {item.product.brand && (
                      <p className="text-gray-500 text-sm mb-2">Brand: {item.product.brand}</p>
                    )}
                    <p className="text-lg font-semibold" style={{ color: '#284B63' }}>${item.product.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col justify-between items-end">
                    <button
                      onClick={() => handleRemove(item.product._id)}
                      className="text-red-500 hover:text-red-700 transition duration-200 mb-4"
                      title="Remove from cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition duration-200"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="px-4 py-1 border-x border-gray-300">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100 transition duration-200"
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                    </div>

                    <p className="text-lg font-bold mt-4" style={{ color: '#284B63' }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#284B63' }}>Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cartCount})</span>
                    <span style={{ color: '#284B63' }}>${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span style={{ color: '#284B63' }}>Total</span>
                    <span style={{ color: '#284B63' }}>${calculateTotal()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition duration-200"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-3 border-2 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-200"
                  style={{ borderColor: '#284B63', color: '#284B63' }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
