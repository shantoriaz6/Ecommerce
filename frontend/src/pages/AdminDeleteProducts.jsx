import React, { useState, useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import axiosInstance from '../services/axios'

const AdminDeleteProducts = () => {
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Phone', 'Laptop', 'AirPods', 'Charger', 'Printer', 'Camera', 'Monitor', 'Gaming', 'Sound', 'Gadget']

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      const url = selectedCategory === 'All' 
        ? '/products' 
        : `/products?category=${selectedCategory}`
      const response = await axiosInstance.get(url)
      setProducts(response.data.data)
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('adminAccessToken')
      await axiosInstance.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Product deleted successfully!')
      fetchProducts()
    } catch (err) {
      alert('Failed to delete product')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#284B63' }}>
          Delete Products
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

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-lg shadow-md">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded mb-3" />
                )}
                <h3 className="font-bold mb-2" style={{ color: '#284B63' }}>{product.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                <p className="text-sm text-gray-600 mb-1">Stock: {product.stock}</p>
                <p className="font-bold mb-3" style={{ color: '#284B63' }}>${product.price}</p>
                <button
                  onClick={() => handleDelete(product._id, product.name)}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDeleteProducts
