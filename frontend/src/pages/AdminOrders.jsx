import React, { useState, useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import axiosInstance from '../services/axios'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminAccessToken')
      const response = await axiosInstance.get('/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminAccessToken')
      const response = await axiosInstance.patch(
        `/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        alert(`Order ${newStatus === 'Confirmed' ? 'confirmed' : 'status updated'} successfully! User will be notified.`)
        fetchOrders()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#284B63' }}>
          User Orders
        </h1>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold" style={{ color: '#284B63' }}>
                      Order #{order._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.fullName || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Email: {order.user?.email || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: '#284B63' }}>
                      ${order.totalAmount}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2" style={{ color: '#284B63' }}>Shipping Address:</h4>
                  <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                  {order.phone && (
                    <p className="text-sm text-gray-700">Phone: {order.phone}</p>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2" style={{ color: '#284B63' }}>Items:</h4>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      {item.product?.name || 'Product'} x {item.quantity} - ${item.price}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="font-semibold" style={{ color: '#284B63' }}>Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: '#284B63' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'Confirmed')}
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition duration-200"
                      style={{ backgroundColor: '#284B63' }}
                    >
                      Confirm Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders
