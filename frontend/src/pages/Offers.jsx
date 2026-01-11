import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axios'
import { useCart } from '../context/CartContext'

const Offers = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const handleAddToCart = async (e, product) => {
    e.stopPropagation()
    const result = await addToCart(product._id)
    if (result.success) {
      toast.success('Product added to cart!')
    } else {
      toast.error(result.message || 'Failed to add product to cart')
    }
  }

  useEffect(() => {
    fetchOfferProducts()
  }, [])

  const fetchOfferProducts = async () => {
    try {
      const response = await axiosInstance.get('/products')
      // Filter products that have offers (you can adjust this logic based on your needs)
      const offerProducts = response.data.data.filter(product => 
        product.discount && product.discount > 0
      )
      setProducts(offerProducts)
    } catch (error) {
      console.error('Error fetching offer products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#284B63' }}></div>
          <p className="mt-4" style={{ color: '#284B63' }}>Loading offers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#284B63' }}>Special Offers</h1>
          <p className="text-gray-600">Grab the best deals on your favorite products!</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No offers available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
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
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                      {product.discount}% OFF
                    </div>
                  )}
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

                  {product.discount > 0 ? (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 line-through">{product.price}৳</p>
                      <p className="text-xl font-bold text-red-600">
                        {(product.price * (1 - product.discount / 100)).toFixed(2)}৳
                      </p>
                    </div>
                  ) : (
                    <p className="text-xl font-bold mb-3" style={{ color: '#284B63' }}>
                      {product.price}৳
                    </p>
                  )}

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

export default Offers
