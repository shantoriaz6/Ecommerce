import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import AdminFooter from '../components/AdminFooter'
import axiosInstance from '../services/axios'

const AdminAddProduct = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Phone',
    brand: '',
    stock: '',
    discount: '',
    image: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const categories = ['Phone', 'Laptop', 'AirPods', 'Headphone', 'Charger', 'Printer', 'Camera', 'Monitor', 'Gaming', 'Sound', 'Gadget']

  useEffect(() => {
    // Component initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price)
      submitData.append('category', formData.category)
      submitData.append('brand', formData.brand)
      submitData.append('stock', formData.stock)
      submitData.append('discount', formData.discount || 0)
      
      if (imageFile) {
        submitData.append('image', imageFile)
      }
      
      await axiosInstance.post('/products', submitData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      })
      
      toast.success('Product added successfully!')
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Phone',
        brand: '',
        stock: '',
        discount: '',
        image: ''
      })
      setImageFile(null)
      setImagePreview('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product')
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <AdminSidebar />
      <AdminTopbar />
      <div className="flex-1 ml-64 mt-20 flex flex-col">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex items-center justify-center">
          {/* Form Container */}
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-6">
          {/* Form Header */}
          <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #284B63 0%, #3a5f7d 100%)' }}>
            <div className="flex items-center gap-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-white">Add New Product</h1>
                <p className="text-blue-100 text-xs mt-0.5">Fill in the details to add a product</p>
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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors"
                  style={{ borderColor: '#D9D9D9', focusBorderColor: '#667eea' }}
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
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
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
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
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
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
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
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition-colors bg-white"
                  style={{ borderColor: '#D9D9D9' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
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
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
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

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: '#284B63' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Product Image
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all"
                      style={{ borderColor: '#667eea', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}
                    >
                      <svg className="w-8 h-8 mb-1" style={{ color: '#667eea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-xs font-medium" style={{ color: '#667eea' }}>Click to upload</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF</p>
                      </label>
                  </div>
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-24 w-24 object-cover rounded-lg border-2 shadow-md"
                        style={{ borderColor: '#667eea' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    category: 'Phone',
                    brand: '',
                    stock: '',
                    discount: '',
                    image: ''
                  })
                  setImageFile(null)
                  setImagePreview('')
                }}
                className="px-5 py-2.5 border-2 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                style={{ borderColor: '#667eea', color: '#667eea' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </form>
        </div>
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default AdminAddProduct
