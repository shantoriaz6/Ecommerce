import React, { useState, useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import axiosInstance from '../services/axios'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminAccessToken')
      const [productsRes, ordersRes] = await Promise.all([
        axiosInstance.get('/products'),
        axiosInstance.get('/orders/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const orders = ordersRes.data.data
      setStats({
        totalProducts: productsRes.data.data.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#284B63' }}>
          Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#284B63' }}>
              Total Products
            </h3>
            <p className="text-4xl font-bold" style={{ color: '#284B63' }}>
              {stats.totalProducts}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#284B63' }}>
              Total Orders
            </h3>
            <p className="text-4xl font-bold" style={{ color: '#284B63' }}>
              {stats.totalOrders}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#284B63' }}>
              Pending Orders
            </h3>
            <p className="text-4xl font-bold text-orange-600">
              {stats.pendingOrders}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
