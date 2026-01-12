import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import AdminFooter from '../components/AdminFooter'
import axiosInstance from '../services/axios'

const AdminOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [deliverymen, setDeliverymen] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedDeliveryman, setSelectedDeliveryman] = useState('')

  useEffect(() => {
    fetchOrders()
    fetchDeliverymen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders/all')
      setOrders(response.data.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliverymen = async () => {
    try {
      const response = await axiosInstance.get('/admin/deliverymen')
      setDeliverymen(response.data.data.filter(d => d.isActive))
    } catch (err) {
      console.error('Error fetching delivery men:', err)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/orders/${orderId}/status`,
        { status: newStatus }
      )
      
      if (response.data.success) {
        toast.success(`Order ${newStatus === 'Confirmed' ? 'confirmed' : 'status updated'} successfully! User will be notified.`)
        fetchOrders()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status')
    }
  }

  const openAssignModal = (order) => {
    setSelectedOrder(order)
    setShowAssignModal(true)
  }

  const assignDeliveryman = async () => {
    if (!selectedDeliveryman) {
      toast.error('Please select a delivery man')
      return
    }

    try {
      await axiosInstance.post('/admin/assign-order', {
        orderId: selectedOrder._id,
        deliverymanId: selectedDeliveryman
      })
      
      toast.success('Order assigned to delivery man successfully!')
      setShowAssignModal(false)
      setSelectedOrder(null)
      setSelectedDeliveryman('')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign delivery man')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminTopbar />
      <div className="flex-1 ml-64 mt-20 flex flex-col">
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
                      {order.totalAmount}৳
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
                      {item.product?.name || 'Product'} x {item.quantity} - {item.price}৳
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
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
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {order.deliveryman && (
                    <div className="text-sm bg-blue-50 px-4 py-2 rounded-lg">
                      <span className="font-semibold">Assigned to:</span> {order.deliveryman.name}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'Confirmed')}
                        className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition duration-200"
                        style={{ backgroundColor: '#284B63' }}
                      >
                        Confirm Order
                      </button>
                    )}
                    
                    {(order.status === 'Confirmed' || order.status === 'Shipped') && !order.deliveryman && (
                      <button
                        onClick={() => openAssignModal(order)}
                        className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition duration-200 bg-green-600"
                      >
                        🚚 Assign Delivery Man
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Delivery Man Modal */}
        {showAssignModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold" style={{ color: '#284B63' }}>
                  Assign Delivery Man
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Order #{selectedOrder._id.slice(-8)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Delivery Man
                </label>
                <select
                  value={selectedDeliveryman}
                  onChange={(e) => setSelectedDeliveryman(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Delivery Man --</option>
                  {deliverymen.map((dm) => (
                    <option key={dm._id} value={dm._id}>
                      {dm.name} ({dm.vehicleType}) - ⭐ {dm.rating.toFixed(1)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  All active delivery men
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={assignDeliveryman}
                  className="flex-1 py-3 px-6 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Assign
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedOrder(null)
                    setSelectedDeliveryman('')
                  }}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default AdminOrders
