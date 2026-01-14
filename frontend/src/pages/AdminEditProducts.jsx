import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import AdminFooter from '../components/AdminFooter'
import axiosInstance from '../services/axios'

const AdminEditProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  // Edit form state - each field has its own state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState('')
  const [editBrand, setEditBrand] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDiscount, setEditDiscount] = useState('')

  const categories = ['All', 'Phone', 'Laptop', 'AirPods', 'Headphone', 'Charger', 'Printer', 'Camera', 'Monitor', 'Gaming', 'Sound', 'Gadget', 'Offers', 'Hot Deals', 'Discount']

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      let url = '/products'
      let fetchedProducts = []
      
      if (selectedCategory === 'All') {
        const response = await axiosInstance.get(url)
        fetchedProducts = Array.isArray(response.data.data) ? response.data.data : []
      } else if (selectedCategory === 'Offers' || selectedCategory === 'Discount') {
        const response = await axiosInstance.get(url)
        const data = Array.isArray(response.data.data) ? response.data.data : []
        fetchedProducts = data.filter(product => product.discount && product.discount > 0)
      } else if (selectedCategory === 'Hot Deals') {
        const response = await axiosInstance.get(url)
        const data = Array.isArray(response.data.data) ? response.data.data : []
        fetchedProducts = data.filter(product => product.discount && product.discount >= 15)
      } else {
        url = `/products?category=${selectedCategory}`
        const response = await axiosInstance.get(url)
        fetchedProducts = Array.isArray(response.data.data) ? response.data.data : []
      }
      
      setProducts(fetchedProducts)
    } catch (err) {
      console.error('Error fetching products:', err)
      toast.error('Failed to fetch products. Please try again.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setEditName(product.name)
    setEditDescription(product.description)
    setEditPrice(product.price)
    setEditStock(product.stock)
    setEditBrand(product.brand || '')
    setEditCategory(product.category)
    setEditDiscount(product.discount || 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('=== FRONTEND SUBMIT ===')
    console.log('editCategory state:', editCategory)
    console.log('editCategory type:', typeof editCategory)
    
    try {
      const updateData = {
        name: editName,
        description: editDescription,
        category: editCategory,
        brand: editBrand,
        price: parseFloat(editPrice),
        stock: parseInt(editStock),
        discount: parseInt(editDiscount || 0)
      }
      
      console.log('Update data being sent:', updateData)

      await axiosInstance.patch(`/products/${selectedProduct._id}`, updateData)
      
      toast.success('Product updated successfully!')
      setSelectedProduct(null)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product')
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: selectedProduct ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f9fafb' }}>
      <AdminSidebar />
      <AdminTopbar />
      <div className="flex-1 ml-64 mt-20 flex flex-col">
      {selectedProduct ? (
        // Edit Form (Similar to Add Product Design)
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-6">
            {/* Form Header */}
            <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #284B63 0%, #3a5f7d 100%)' }}>
              <div className="flex items-center gap-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <h1 className="text-2xl font-bold text-white">Edit Product</h1>
                  <p className="text-blue-100 text-xs mt-0.5">Update product details</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: '#284B63' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors"
                    style={{ borderColor: '#D9D9D9' }}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: '#284B63' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Description *
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                    rows="2"
                    placeholder="Enter detailed product description"
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors resize-none"
                    style={{ borderColor: '#D9D9D9' }}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: '#284B63' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    Price (৳) *
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors"
                    style={{ borderColor: '#D9D9D9' }}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: '#284B63' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    required
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors"
                    style={{ borderColor: '#D9D9D9' }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: '#284B63' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors bg-white"
                    style={{ borderColor: '#D9D9D9' }}
                  >
                    <option value="">Select Category</option>
                    <option value="Phone">Phone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="AirPods">AirPods</option>
                    <option value="Headphone">Headphone</option>
                    <option value="Charger">Charger</option>
                    <option value="Printer">Printer</option>
                    <option value="Camera">Camera</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Sound">Sound</option>
                    <option value="Gadget">Gadget</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: '#284B63' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    placeholder="Enter brand name (optional)"
                    className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors"
                    style={{ borderColor: '#D9D9D9' }}
                  />
                </div>

                {/* Discount */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: '#284B63' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                    Discount Percentage
                  </label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(e.target.value)}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors"
                        style={{ borderColor: '#D9D9D9' }}
                      />
                      <span className="absolute right-3 top-2 text-gray-500 font-semibold text-sm">%</span>
                    </div>
                    <div className="flex-1 p-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                      <p className="text-xs text-purple-700">
                        <strong>Tip:</strong> 1%+ = Offers, 15%+ = Hot Deals
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2.5 border-2 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                  style={{ borderColor: '#667eea', color: '#667eea' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // Product List View
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8" style={{ color: '#284B63' }}>
            Edit Products
          </h1>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
              Filter by Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border-2 rounded-lg focus:outline-none"
              style={{ borderColor: '#284B63' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                {product.image && (
                  <div className="mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
                <h3 className="font-bold mb-2" style={{ color: '#284B63' }}>{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                <p className="font-bold mb-2" style={{ color: '#284B63' }}>{product.price}৳</p>
                {product.discount > 0 && (
                  <p className="text-sm text-green-600 mb-2">Discount: {product.discount}%</p>
                )}
                <button
                  onClick={() => handleEdit(product)}
                  className="w-full py-2 px-4 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <AdminFooter />
      </div>
    </div>
  )
}

export default AdminEditProducts
