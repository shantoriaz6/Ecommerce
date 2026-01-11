import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminSidebar from '../components/AdminSidebar'
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
    // Check admin authentication
    const adminToken = localStorage.getItem('adminAccessToken')
    if (!adminToken) {
      navigate('/admin/login')
      return
    }
    
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      let url = '/products'
      let fetchedProducts = []
      
      if (selectedCategory === 'All') {
        const response = await axiosInstance.get(url)
        fetchedProducts = response.data.data
      } else if (selectedCategory === 'Offers' || selectedCategory === 'Discount') {
        const response = await axiosInstance.get(url)
        fetchedProducts = response.data.data.filter(product => product.discount && product.discount > 0)
      } else if (selectedCategory === 'Hot Deals') {
        const response = await axiosInstance.get(url)
        fetchedProducts = response.data.data.filter(product => product.discount && product.discount >= 15)
      } else {
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
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Price</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Stock</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Brand</label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => {
                      console.log('Category dropdown changed to:', e.target.value)
                      setEditCategory(e.target.value)
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    required
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#284B63' }}>Discount (%)</label>
                <input
                  type="number"
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1%+ = Offers, 15%+ = Hot Deals
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 text-white font-semibold rounded-md hover:opacity-90"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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
                <p className="font-bold mb-2" style={{ color: '#284B63' }}>{product.price}৳</p>
                {product.discount > 0 && (
                  <p className="text-sm text-green-600 mb-2">Discount: {product.discount}%</p>
                )}
                <button
                  onClick={() => handleEdit(product)}
                  className="w-full py-2 px-4 text-white font-semibold rounded-md hover:opacity-90"
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
