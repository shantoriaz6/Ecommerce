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
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    paidOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  })
  const [deliverymen, setDeliverymen] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedDeliveryman, setSelectedDeliveryman] = useState('')
  
  // Date range filter
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchOrders()
    fetchDeliverymen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOrders = async (start = '', end = '') => {
    try {
      setLoading(true)
      let url = '/orders/all'
      const params = []
      
      if (start) params.push(`startDate=${start}`)
      if (end) params.push(`endDate=${end}`)
      
      if (params.length > 0) {
        url += '?' + params.join('&')
      }
      
      const response = await axiosInstance.get(url)
      setOrders(response.data.data.orders)
      setStats(response.data.data.stats)
    } catch (err) {
      console.error('Error fetching orders:', err)
      toast.error('Failed to fetch orders')
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

  const handleFilterApply = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date')
      return
    }
    fetchOrders(startDate, endDate)
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    fetchOrders()
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/orders/${orderId}/status`,
        { status: newStatus }
      )
      
      if (response.data.success) {
        toast.success(`Order ${newStatus === 'Confirmed' ? 'confirmed' : 'status updated'} successfully! User will be notified.`)
        fetchOrders(startDate, endDate)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status')
    }
  }

  const openAssignModal = (order) => {
    setSelectedOrder(order)
    setShowAssignModal(true)
  }

  const openDetailsModal = (order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
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
      fetchOrders(startDate, endDate)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign delivery man')
    }
  }

  const printReport = () => {
    const printWindow = window.open('', '_blank')
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Report - ${startDate || 'All Time'} to ${endDate || 'Present'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #284B63;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #284B63;
            margin: 0;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-box {
            border: 2px solid #284B63;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-box h3 {
            margin: 0 0 10px 0;
            color: #284B63;
            font-size: 14px;
          }
          .stat-box p {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: #284B63;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #284B63;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-pending { background-color: #FEF3C7; color: #92400E; }
          .status-confirmed { background-color: #DBEAFE; color: #1E40AF; }
          .status-delivered { background-color: #D1FAE5; color: #065F46; }
          .status-cancelled { background-color: #FEE2E2; color: #991B1B; }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .no-print {
            display: block;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            button {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📦 Order Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          ${startDate || endDate ? `<p>Period: ${startDate || 'Start'} to ${endDate || 'Present'}</p>` : '<p>Period: All Time</p>'}
        </div>

        <div class="stats">
          <div class="stat-box">
            <h3>Total Orders</h3>
            <p>${stats.totalOrders}</p>
          </div>
          <div class="stat-box">
            <h3>Total Revenue</h3>
            <p>৳${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div class="stat-box">
            <h3>Paid Orders</h3>
            <p>${stats.paidOrders}</p>
          </div>
          <div class="stat-box">
            <h3>Pending</h3>
            <p>${stats.pendingOrders}</p>
          </div>
          <div class="stat-box">
            <h3>Delivered</h3>
            <p>${stats.deliveredOrders}</p>
          </div>
          <div class="stat-box">
            <h3>Cancelled</h3>
            <p>${stats.cancelledOrders}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>#${order._id.slice(-8)}</td>
                <td>${order.user?.fullName || 'N/A'}<br/><small>${order.user?.email || ''}</small></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>৳${order.totalAmount}</td>
                <td><span class="status status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${order.paymentStatus}</td>
                <td>${order.items.length} item(s)</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>End of Report</strong></p>
          <p>This is a computer-generated report and does not require a signature.</p>
        </div>

        <button class="no-print" onclick="window.print()" style="margin: 20px auto; display: block; padding: 10px 30px; background: #284B63; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🖨️ Print Report</button>
      </body>
      </html>
    `
    
    printWindow.document.write(reportHTML)
    printWindow.document.close()
  }

  const formatCurrency = (amount) => {
    return `৳${amount.toLocaleString()}`
  }

  const printOrderDetails = (order) => {
    const printWindow = window.open('', '_blank')
    
    const orderHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Details - #${order._id.slice(-8)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #284B63;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #284B63;
            margin: 0 0 10px 0;
          }
          .section {
            margin-bottom: 25px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: #f9f9f9;
          }
          .section h3 {
            color: #284B63;
            margin: 0 0 15px 0;
            font-size: 16px;
            border-bottom: 2px solid #284B63;
            padding-bottom: 8px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 3px;
          }
          .info-value {
            font-weight: bold;
            font-size: 14px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          .items-table th {
            background-color: #284B63;
            color: white;
            font-weight: bold;
          }
          .items-table tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .status-badge {
            padding: 5px 12px;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
            font-size: 14px;
          }
          .status-delivered { background-color: #D1FAE5; color: #065F46; }
          .status-cancelled { background-color: #FEE2E2; color: #991B1B; }
          .status-pending { background-color: #FEF3C7; color: #92400E; }
          .status-confirmed { background-color: #DBEAFE; color: #1E40AF; }
          .status-shipped { background-color: #E0E7FF; color: #3730A3; }
          .total-section {
            background: #284B63;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            button {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📦 ORDER INVOICE</h1>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <h3>👤 Customer Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Customer Name</div>
              <div class="info-value">${order.user?.fullName || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email Address</div>
              <div class="info-value">${order.user?.email || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Contact Number</div>
              <div class="info-value">${order.phone || order.user?.contactNumber || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Order Date</div>
              <div class="info-value">${new Date(order.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>📍 Shipping Address</h3>
          <p style="margin: 0; font-size: 14px;">${order.shippingAddress}</p>
        </div>

        <div class="section">
          <h3>📦 Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product?.name || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td>৳${item.price.toLocaleString()}</td>
                  <td><strong>৳${(item.price * item.quantity).toLocaleString()}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>💰 Order Summary</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Order Status</div>
              <div class="info-value">
                <span class="status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Payment Method</div>
              <div class="info-value">${order.paymentMethod}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Payment Status</div>
              <div class="info-value" style="color: ${order.paymentStatus === 'Paid' ? '#059669' : '#D97706'}">
                ${order.paymentStatus}
              </div>
            </div>
            ${order.transactionId ? `
            <div class="info-item">
              <div class="info-label">Transaction ID</div>
              <div class="info-value">${order.transactionId}</div>
            </div>
            ` : ''}
            ${order.deliveryman ? `
            <div class="info-item">
              <div class="info-label">Delivery Person</div>
              <div class="info-value">${order.deliveryman.name}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="total-section">
          TOTAL AMOUNT: ৳${order.totalAmount.toLocaleString()}
        </div>

        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>

        <button class="no-print" onclick="window.print()" style="margin: 20px auto; display: block; padding: 12px 40px; background: #284B63; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">🖨️ Print Invoice</button>
      </body>
      </html>
    `
    
    printWindow.document.write(orderHTML)
    printWindow.document.close()
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <AdminSidebar />
      <AdminTopbar />
      <div className="flex-1 ml-64 mt-20 flex flex-col">
        <div className="flex-1 p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                  Order Management
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Real-time order tracking and management
                </p>
              </div>
              <button
                onClick={printReport}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="text-2xl">🖨️</span>
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#284B63' }}>
                  Filter Orders by Date Range
                </h3>
                <p className="text-sm text-gray-500">Select a custom date range to view specific orders</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-blue-600">📍</span> Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-blue-600">📍</span> End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                />
              </div>
              <button
                onClick={handleFilterApply}
                className="px-8 py-3 text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                style={{ backgroundColor: '#284B63' }}
              >
                <span>🔍</span> Apply Filter
              </button>
              <button
                onClick={handleClearFilter}
                className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>✖️</span> Clear
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-5 border-l-4 border-blue-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Orders</p>
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#284B63' }}>
                {stats.totalOrders}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-5 border-l-4 border-green-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Revenue</p>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg p-5 border-l-4 border-emerald-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Paid</p>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {stats.paidOrders}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-lg p-5 border-l-4 border-yellow-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pending</p>
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-5 border-l-4 border-blue-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirmed</p>
                <span className="text-2xl">👍</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {stats.confirmedOrders}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-lg p-5 border-l-4 border-green-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Delivered</p>
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {stats.deliveredOrders}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-lg p-5 border-l-4 border-red-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cancelled</p>
                <span className="text-2xl">❌</span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {stats.cancelledOrders}
              </p>
            </div>
          </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-xl">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-semibold">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="mb-6">
              <span className="text-8xl">📭</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500 text-lg">No orders match the selected date range</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div 
                key={order._id} 
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-white font-bold text-sm">#{order._id.slice(-8)}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-green-400 text-green-900' :
                        order.status === 'Cancelled' ? 'bg-red-400 text-red-900' :
                        order.status === 'Pending' ? 'bg-yellow-400 text-yellow-900' :
                        order.status === 'Confirmed' ? 'bg-blue-400 text-blue-900' :
                        'bg-purple-400 text-purple-900'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-2xl">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Customer Info Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <h4 className="font-bold text-sm text-blue-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">👤</span> Customer Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 text-sm">•</span>
                          <div>
                            <p className="text-xs text-gray-600">Name</p>
                            <p className="font-semibold text-gray-800">{order.user?.fullName || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 text-sm">•</span>
                          <div>
                            <p className="text-xs text-gray-600">Email</p>
                            <p className="font-semibold text-gray-800 text-sm">{order.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 text-sm">•</span>
                          <div>
                            <p className="text-xs text-gray-600">Phone</p>
                            <p className="font-semibold text-gray-800">{order.phone || order.user?.contactNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Info Section */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <h4 className="font-bold text-sm text-purple-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">📋</span> Order Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 text-sm">•</span>
                          <div>
                            <p className="text-xs text-gray-600">Order Date</p>
                            <p className="font-semibold text-gray-800 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 text-sm">•</span>
                          <div>
                            <p className="text-xs text-gray-600">Time</p>
                            <p className="font-semibold text-gray-800 text-sm">{new Date(order.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 text-sm">•</span>
                          <div>
                            <p className="text-xs text-gray-600">Payment Status</p>
                            <p className={`font-bold text-sm ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {order.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ ' + order.paymentStatus}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Assignment Badge */}
                  {order.deliveryman && (
                    <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg px-4 py-3">
                      <p className="text-sm flex items-center gap-2 flex-wrap">
                        <span className="text-lg">🚚</span>
                        <span className="font-semibold text-gray-700">Assigned to:</span>
                        <span className="font-bold text-green-700">{order.deliveryman.name}</span>
                        {order.deliverymanDecision && (
                          <span
                            className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                              order.deliverymanDecision === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : order.deliverymanDecision === 'Denied'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.deliverymanDecision === 'Pending' ? 'Pending Response' : order.deliverymanDecision}
                          </span>
                        )}
                      </p>
                      {order.deliverymanDecisionAt && (
                        <p className="text-xs text-gray-600 mt-1">
                          Response time: {new Date(order.deliverymanDecisionAt).toLocaleString()}
                        </p>
                      )}
                      {order.deliverymanDecisionNote && (
                        <p className="text-xs text-gray-700 mt-1">
                          Note: {order.deliverymanDecisionNote}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                      <label className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                        <span>🔄</span> Status:
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold transition-all hover:border-blue-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openDetailsModal(order)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <span>👁️</span> View Details
                      </button>
                      
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'Confirmed')}
                          className="px-5 py-2.5 text-white rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                          style={{ backgroundColor: '#284B63' }}
                        >
                          <span>✓</span> Confirm
                        </button>
                      )}
                      
                      {(order.status === 'Confirmed' || order.status === 'Shipped') && !order.deliveryman && (
                        <button
                          onClick={() => openAssignModal(order)}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          <span>🚚</span> Assign Delivery
                        </button>
                      )}

                      {order.deliveryman && order.deliverymanDecision === 'Denied' && (
                        <button
                          onClick={() => openAssignModal(order)}
                          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          <span>🔁</span> Reassign Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 my-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#284B63' }}>
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Order ID: #{selectedOrder._id}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3" style={{ color: '#284B63' }}>
                    👤 Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{selectedOrder.user?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{selectedOrder.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{selectedOrder.phone || selectedOrder.user?.contactNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2" style={{ color: '#284B63' }}>
                    📍 Shipping Address
                  </h3>
                  <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3" style={{ color: '#284B63' }}>
                    📦 Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-bold" style={{ color: '#284B63' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3" style={{ color: '#284B63' }}>
                    💰 Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold px-3 py-1 rounded ${
                        selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`font-semibold ${selectedOrder.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {selectedOrder.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-semibold text-sm">{selectedOrder.transactionId}</span>
                      </div>
                    )}
                    {selectedOrder.deliveryman && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Person:</span>
                        <span className="font-semibold">{selectedOrder.deliveryman.name}</span>
                      </div>
                    )}
                    <div className="border-t-2 pt-2 mt-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Total Amount:</span>
                        <span className="font-bold" style={{ color: '#284B63' }}>
                          {formatCurrency(selectedOrder.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => printOrderDetails(selectedOrder)}
                  className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center gap-2"
                >
                  🖨️ Print Invoice
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Close
                </button>
              </div>
            </div>
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
