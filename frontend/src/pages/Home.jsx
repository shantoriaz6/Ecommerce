import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import axiosInstance from '../services/axios'
import { useCart } from '../context/CartContext'

const Home = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const searchQuery = searchParams.get('search') || ''

  const slides = [
    {
      image: '/header image/header1.jpg',
      title: 'Welcome to Gadget WORLD',
      subtitle: 'Discover the Latest Technology at Unbeatable Prices'
    },
    {
      image: '/header image/header2.jpeg',
      title: 'Premium Quality Products',
      subtitle: 'Shop the Best Electronics and Accessories'
    },
    {
      image: '/header image/header4.jpg',
      title: 'Exclusive Deals & Offers',
      subtitle: 'Save Big on Your Favorite Gadgets Today'
    }
  ]

  useEffect(() => {
    fetchProducts()
    
    // Auto-advance slider every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery) {
      const filtered = products.filter(product => {
        const searchLower = searchQuery.toLowerCase()
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
        )
      })
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, products])

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
    const result = await addToCart(product._id)
    if (result.success) {
      toast.success('Product added to cart!')
    } else {
      toast.error(result.message || 'Failed to add product to cart')
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
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
      {/* Hero Slider */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* Slides */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light animate-fade-in-delay">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 p-2 sm:p-3 rounded-full transition duration-200 z-10"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 p-2 sm:p-3 rounded-full transition duration-200 z-10"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition duration-200 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#284B63' }}>
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear search
            </button>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12" style={{ color: '#284B63' }}>
          {searchQuery ? 'Search Results' : 'Featured Products'}
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              {searchQuery ? (
                <div>
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-xl font-semibold mb-2" style={{ color: '#284B63' }}>No products found</p>
                  <p className="text-gray-600">Try searching with different keywords</p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#284B63' }}
                  >
                    View All Products
                  </button>
                </div>
              ) : (
                <p style={{ color: '#284B63' }}>No products available</p>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
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
                <p className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: '#284B63' }}>{product.price}৳</p>
                <p className="text-xs sm:text-sm mb-3 text-gray-600">Stock: {product.stock}</p>
                <button 
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full hover:opacity-90 font-bold py-2 px-4 rounded-lg transition duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed" 
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