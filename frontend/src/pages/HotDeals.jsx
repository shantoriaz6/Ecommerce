import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axios'
import { useCart } from '../context/CartContext'

const HotDeals = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const handleAddToCart = async (e, product) => {
    e.stopPropagation()
    try {
      await addToCart(product._id)
      alert('Product added to cart!')
    } catch (err) {
      alert(err.message || 'Failed to add product to cart')
    }
  }

  useEffect(() => {
    fetchHotDeals()
  }, [])

  const fetchHotDeals = async () => {
    try {
      const response = await axiosInstance.get('/products')
      // Filter hot deals - products with high discount (>= 15%)
      const hotDeals = response.data.data.filter(product => 
        product.discount && product.discount >= 15
      )
      setProducts(hotDeals)
    } catch (error) {
      console.error('Error fetching hot deals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#284B63' }}></div>
          <p className="mt-4" style={{ color: '#284B63' }}>Loading hot deals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-red-600">🔥</span>
            <span style={{ color: '#284B63' }}>Hot Deals</span>
            <span className="text-red-600">🔥</span>
          </h1>
          <p className="text-lg text-gray-700 font-medium">Limited time offers with massive discounts!</p>
          <p className="text-gray-600 mt-1">Hurry up! These deals won't last forever</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">No hot deals available right now.</p>
            <p className="text-gray-500 mt-2">Stay tuned for upcoming amazing offers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md hover:shadow-2xl transition duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg animate-pulse">
                      {product.discount}% OFF
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <div className="bg-yellow-400 text-red-600 px-3 py-1 rounded-full font-bold text-sm">
                      HOT 🔥
                    </div>
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2" style={{ color: '#284B63' }}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500 line-through">${product.price}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-red-600">
                        ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
                        Save ${(product.price * (product.discount / 100)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm mb-3 text-gray-600">Stock: {product.stock}</p>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.stock === 0}
                    className="w-full hover:opacity-90 font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#284B63', color: '#FFFFFF' }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HotDeals
