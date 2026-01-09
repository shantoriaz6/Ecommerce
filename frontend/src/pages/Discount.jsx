import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axios'
import { useCart } from '../context/CartContext'

const Discount = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDiscount, setSelectedDiscount] = useState('all')
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
    fetchDiscountProducts()
  }, [])

  const fetchDiscountProducts = async () => {
    try {
      const response = await axiosInstance.get('/products')
      // Filter products with any discount
      const discountProducts = response.data.data.filter(product => 
        product.discount && product.discount > 0
      )
      setProducts(discountProducts)
    } catch (error) {
      console.error('Error fetching discount products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = () => {
    if (selectedDiscount === 'all') return products
    
    if (selectedDiscount === '0-10') {
      return products.filter(p => p.discount > 0 && p.discount <= 10)
    } else if (selectedDiscount === '10-20') {
      return products.filter(p => p.discount > 10 && p.discount <= 20)
    } else if (selectedDiscount === '20-30') {
      return products.filter(p => p.discount > 20 && p.discount <= 30)
    } else if (selectedDiscount === '30+') {
      return products.filter(p => p.discount > 30)
    }
    return products
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#284B63' }}></div>
          <p className="mt-4" style={{ color: '#284B63' }}>Loading discounts...</p>
        </div>
      </div>
    )
  }

  const displayProducts = filteredProducts()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#284B63' }}>Discount Products</h1>
          <p className="text-gray-600">Save big on all your favorite items!</p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#284B63' }}>Filter by Discount</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedDiscount('all')}
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                selectedDiscount === 'all'
                  ? 'text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={selectedDiscount === 'all' ? { backgroundColor: '#284B63' } : { color: '#284B63' }}
            >
              All Discounts ({products.length})
            </button>
            <button
              onClick={() => setSelectedDiscount('0-10')}
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                selectedDiscount === '0-10'
                  ? 'text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={selectedDiscount === '0-10' ? { backgroundColor: '#284B63' } : { color: '#284B63' }}
            >
              Up to 10%
            </button>
            <button
              onClick={() => setSelectedDiscount('10-20')}
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                selectedDiscount === '10-20'
                  ? 'text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={selectedDiscount === '10-20' ? { backgroundColor: '#284B63' } : { color: '#284B63' }}
            >
              10% - 20%
            </button>
            <button
              onClick={() => setSelectedDiscount('20-30')}
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                selectedDiscount === '20-30'
                  ? 'text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={selectedDiscount === '20-30' ? { backgroundColor: '#284B63' } : { color: '#284B63' }}
            >
              20% - 30%
            </button>
            <button
              onClick={() => setSelectedDiscount('30+')}
              className={`px-4 py-2 rounded-lg transition duration-200 ${
                selectedDiscount === '30+'
                  ? 'text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={selectedDiscount === '30+' ? { backgroundColor: '#284B63' } : { color: '#284B63' }}
            >
              30% and above
            </button>
          </div>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products available in this discount range.</p>
            <p className="text-gray-500 mt-2">Try selecting a different discount filter!</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold" style={{ color: '#284B63' }}>{displayProducts.length}</span> products
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full font-bold">
                      {product.discount}% OFF
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
                      <p className="text-xl font-bold text-green-600">
                        ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        You save: ${(product.price * (product.discount / 100)).toFixed(2)}
                      </p>
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
          </>
        )}
      </div>
    </div>
  )
}

export default Discount
