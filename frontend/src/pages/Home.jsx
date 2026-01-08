import React, { useState, useEffect } from 'react'
import axiosInstance from '../services/axios'
import { useCart } from '../context/CartContext'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/products')
      setProducts(response.data.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id)
      alert('Product added to cart!')
    } catch (err) {
      alert(err.message || 'Failed to add product to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#284B63' }}></div>
          <p className="mt-4" style={{ color: '#284B63' }}>Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#284B63' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12" style={{ color: '#284B63' }}>Featured Products</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p style={{ color: '#284B63' }}>No products available</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 sm:p-6">
                <div className="h-40 sm:h-48 bg-gray-200 rounded-lg mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm sm:text-base">Product Image</span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold mb-2" style={{ color: '#284B63' }}>{product.name}</h2>
                <p className="text-xs sm:text-sm mb-2" style={{ color: '#284B63' }}>{product.category}</p>
                {product.brand && (
                  <p className="text-xs sm:text-sm mb-2 text-gray-500">Brand: {product.brand}</p>
                )}
                <p className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: '#284B63' }}>${product.price}</p>
                <p className="text-xs sm:text-sm mb-3 text-gray-600">Stock: {product.stock}</p>
                <button 
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full hover:bg-blue-700 font-bold py-2 px-4 rounded-lg transition duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: '#284B63', color: '#FFFFFF' }}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Home