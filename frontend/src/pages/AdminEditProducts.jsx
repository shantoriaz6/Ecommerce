import React, { useState, useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import axiosInstance from '../services/axios'

const AdminEditProducts = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Phone', 'Laptop', 'AirPods', 'Headphone', 'Charger', 'Printer', 'Camera', 'Monitor', 'Gaming', 'Sound', 'Gadget', 'Offers', 'Hot Deals', 'Discount']

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      let url = '/products'
      let fetchedProducts = []
      
      if (selectedCategory === 'All') {
        const response = await axiosInstance.get(url)
        fetchedProducts = response.data.data
      } else if (selectedCategory === 'Offers' || selectedCategory === 'Discount') {
        // Products with any discount (1% or more)
        const response = await axiosInstance.get(url)
        fetchedProducts = response.data.data.filter(product => product.discount && product.discount > 0)
      } else if (selectedCategory === 'Hot Deals') {
        // Products with 15% or more discount
        const response = await axiosInstance.get(url)
        fetchedProducts = response.data.data.filter(product => product.discount && product.discount >= 15)
      } else {
        // Regular category filter
        url = `/products?category=${selectedCategory}`
        const response = await axiosInstance.get(url)
        fetchedProducts = response.data.data
      }
      
      setProducts(fetchedProducts)
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setFormData(product)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('adminAccessToken')
      await axiosInstance.patch(`/products/${selectedProduct._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Product updated successfully!')
      setSelectedProduct(null)
      fetchProducts()
    } catch (err) {
      alert('Failed to update product')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
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
            className="px-4 py-2 border rounded-md"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {selectedProduct ? (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>
              Edit Product
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount || ''}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    1%+ = Offers, 15%+ = Hot Deals
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 text-white font-semibold rounded-md"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-6 py-2 text-white font-semibold rounded-md hover:opacity-80 transition duration-200"
                  style={{ backgroundColor: '#284B63', opacity: 0.7 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-lg shadow-md">
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
                <p className="font-bold mb-2" style={{ color: '#284B63' }}>${product.price}</p>
                {product.discount > 0 && (
                  <p className="text-sm text-green-600 mb-2">Discount: {product.discount}%</p>
                )}
                <button
                  onClick={() => handleEdit(product)}
                  className="w-full py-2 px-4 text-white font-semibold rounded-md"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminEditProducts
