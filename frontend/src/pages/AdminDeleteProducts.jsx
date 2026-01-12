import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import AdminFooter from '../components/AdminFooter'
import axiosInstance from '../services/axios'

const AdminDeleteProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return
    }

    try {
      await axiosInstance.delete(`/products/${productId}`)
      toast.success('Product deleted successfully!')
      fetchProducts()
    } catch (err) {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminTopbar />
      <div className="flex-1 ml-64 mt-20 flex flex-col">
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
                <p className="font-bold mb-3" style={{ color: '#284B63' }}>{product.price}৳</p>
                <button
                  onClick={() => handleDelete(product._id, product.name)}
                  className="w-full py-2 px-4 text-white font-semibold rounded-md hover:opacity-90 transition duration-200"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default AdminDeleteProducts
