import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import axiosInstance from '../services/axios'
import { useCart } from '../context/CartContext'
import LiveChatWidget from '../components/LiveChatWidget'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await axiosInstance.get(`/products/${id}`)
        setProduct(response.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!product?._id) return

    const result = await addToCart(product._id)
    if (result.success) {
      toast.success('Product added to cart!')
    } else {
      toast.error(result.message || 'Failed to add product to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#284B63' }}></div>
          <p className="mt-4" style={{ color: '#284B63' }}>Loading product...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border-2 font-semibold hover:bg-gray-100 transition"
              style={{ borderColor: '#284B63', color: '#284B63' }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: '#284B63' }}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const discountedPrice = product.discount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 font-semibold hover:underline"
          style={{ color: '#284B63' }}
        >
          <span aria-hidden>←</span>
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="w-full">
            <div className="w-full max-w-md mx-auto aspect-[4/3] lg:aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#284B63' }}>
              {product.name}
            </h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {product.category && (
                <span className="text-sm px-3 py-1 rounded-full bg-gray-100" style={{ color: '#284B63' }}>
                  {product.category}
                </span>
              )}
              {product.brand && (
                <span className="text-sm px-3 py-1 rounded-full bg-gray-100" style={{ color: '#284B63' }}>
                  Brand: {product.brand}
                </span>
              )}
              <span className="text-sm px-3 py-1 rounded-full bg-gray-100" style={{ color: '#284B63' }}>
                Stock: {product.stock}
              </span>
              {product.discount > 0 && (
                <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <div className="mb-6">
              {product.discount > 0 ? (
                <div>
                  <p className="text-gray-500 line-through">{product.price}৳</p>
                  <p className="text-3xl font-bold text-red-600">{discountedPrice}৳</p>
                </div>
              ) : (
                <p className="text-3xl font-bold" style={{ color: '#284B63' }}>
                  {product.price}৳
                </p>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2" style={{ color: '#284B63' }}>Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#284B63' }}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full sm:w-auto border-2 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-200"
                style={{ borderColor: '#284B63', color: '#284B63' }}
              >
                Go to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <LiveChatWidget contextProductId={product._id} />
    </div>
  )
}

export default ProductDetails
