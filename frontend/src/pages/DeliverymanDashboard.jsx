import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axios'

const DeliverymanDashboard = () => {
  const navigate = useNavigate()
  const [deliveryman, setDeliveryman] = useState(null)
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('deliverymanData')
    if (userData) {
      setDeliveryman(JSON.parse(userData))
    }

    fetchData()
  }, [navigate, filter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ordersRes, statsRes] = await Promise.all([
        axiosInstance.get(`/deliveryman/orders${filter !== 'all' ? `?status=${filter}` : ''}`),
        axiosInstance.get('/deliveryman/stats')
      ])
      setOrders(ordersRes.data.data)
      setStats(statsRes.data.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status, notes = '') => {
    try {
      await axiosInstance.patch(`/deliveryman/orders/${orderId}/status`, {
        status,
        deliveryNotes: notes
      })
      alert('Order status updated successfully!')
      setShowModal(false)
      fetchData()
    } catch (err) {
      console.error('Error updating order:', err)
      alert('Failed to update order status')
    }
  }

  const decideOrder = async (orderId, decision) => {
    try {
      await axiosInstance.patch(`/deliveryman/orders/${orderId}/decision`, {
        decision
      })
      alert(`Order ${decision.toLowerCase()} successfully!`)
      fetchData()
    } catch (err) {
      console.error('Error deciding order:', err)
      alert(err.response?.data?.message || 'Failed to update decision')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('deliverymanAccessToken')
    localStorage.removeItem('deliverymanRefreshToken')
    localStorage.removeItem('deliverymanData')
    navigate('/deliveryman/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-blue-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <span className="text-3xl">🚚</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {deliveryman?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Assigned</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalAssigned || 0}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <span className="text-3xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.delivered || 0}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats?.pending || 0}</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-full">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.successRate || 0}%</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <span className="text-3xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('Out for Delivery')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'Out for Delivery' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Out for Delivery
            </button>
            <button
              onClick={() => setFilter('Delivered')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === 'Delivered' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-xl text-gray-600">No orders found</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Order #{order._id.slice(-8)}</h3>
                    <p className="text-sm text-gray-600">
                      Placed: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                    </span>

                    {order.deliverymanDecision && (
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.deliverymanDecision === 'Accepted' ? 'bg-green-100 text-green-800' :
                        order.deliverymanDecision === 'Denied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.deliverymanDecision === 'Pending' ? 'Pending Response' : order.deliverymanDecision}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Customer Details</h4>
                    <p className="text-sm"><span className="font-medium">Name:</span> {order.user?.fullName}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {order.phone}</p>
                    <p className="text-sm"><span className="font-medium">Address:</span> {order.shippingAddress}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Order Details</h4>
                    <p className="text-sm"><span className="font-medium">Items:</span> {order.items?.length}</p>
                    <p className="text-sm"><span className="font-medium">Total:</span> ৳{order.totalAmount}</p>
                    <p className="text-sm"><span className="font-medium">Payment:</span> {order.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowModal(true)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    View Details
                  </button>

                  {order.deliverymanDecision === 'Pending' && (
                    <>
                      <button
                        onClick={() => decideOrder(order._id, 'Accepted')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => decideOrder(order._id, 'Denied')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                      >
                        ✕ Deny
                      </button>
                    </>
                  )}

                  {order.status === 'Out for Delivery' && order.deliverymanDecision === 'Accepted' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'Delivered')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      ✓ Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedOrder.user?.fullName}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.user?.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.phone}</p>
                  <p><span className="font-medium">Address:</span> {selectedOrder.shippingAddress}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                      {item.product?.image && (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product?.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ৳{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">৳{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">৳{selectedOrder.totalAmount}</span>
                </div>
              </div>

              {selectedOrder.deliveryNotes && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Delivery Notes</h3>
                  <p className="bg-yellow-50 p-4 rounded-lg">{selectedOrder.deliveryNotes}</p>
                </div>
              )}

              {selectedOrder.status === 'Out for Delivery' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder._id, 'Delivered')}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✓ Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliverymanDashboard
