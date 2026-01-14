import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import AdminFooter from '../components/AdminFooter'
import axiosInstance from '../services/axios'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axiosInstance.get('/products'),
        axiosInstance.get('/orders/all')
      ])

      // The orders endpoint returns { orders: [], stats: {} }
      const ordersData = ordersRes.data.data
      const orders = ordersData.orders || []
      
      setStats({
        totalProducts: Array.isArray(productsRes.data.data) ? productsRes.data.data.length : 0,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />
      <AdminTopbar />
      <div className="flex-1 ml-64 mt-20 flex flex-col">
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#284B63' }}>
              Dashboard
            </h1>
            <p className="text-gray-600">Welcome to your admin panel</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Products Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" style={{ border: '2px solid #D9D9D9' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#284B63' }}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total</p>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#284B63' }}>
              Products
            </h3>
            <p className="text-5xl font-bold mb-2" style={{ color: '#284B63' }}>
              {stats.totalProducts}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span className="text-green-600 font-semibold">↗ Active</span>
            </p>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" style={{ border: '2px solid #D9D9D9' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#284B63' }}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total</p>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#284B63' }}>
              Orders
            </h3>
            <p className="text-5xl font-bold mb-2" style={{ color: '#284B63' }}>
              {stats.totalOrders}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span className="text-blue-600 font-semibold">All time</span>
            </p>
          </div>

          {/* Pending Orders Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" style={{ border: '2px solid #D9D9D9' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 rounded-xl bg-orange-500">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Needs Action</p>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#284B63' }}>
              Pending Orders
            </h3>
            <p className="text-5xl font-bold mb-2 text-orange-600">
              {stats.pendingOrders}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span className="text-orange-600 font-semibold">⚠ Awaiting review</span>
            </p>
          </div>
        </div>
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default AdminDashboard
