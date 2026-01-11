import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AdminSidebar from '../components/AdminSidebar'
import axiosInstance from '../services/axios'

const AdminInventory = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [categoryStats, setCategoryStats] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalStock, setTotalStock] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Colors for charts
  const COLORS = ['#284B63', '#3C6E71', '#D9D9D9', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminAccessToken')
    if (!adminToken) {
      navigate('/admin/login')
      return
    }
    
    fetchInventoryStats()

    // Auto-refresh every 30 seconds if enabled
    let intervalId
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchInventoryStats(true) // Silent refresh
      }, 30000) // 30 seconds
    }

    // Refresh when page becomes visible (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchInventoryStats(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalId) clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh])

  const handleManualRefresh = () => {
    fetchInventoryStats(false)
  }

  const fetchInventoryStats = async (silent = false) => {
    try {
      if (!silent) {
        setRefreshing(true)
      }
      const response = await axiosInstance.get('/products')
      const products = response.data.data

      // Calculate stats by category
      const categoryMap = {}
      let totalStockCount = 0
      let lowStock = 0

      products.forEach(product => {
        const category = product.category || 'Uncategorized'
        
        if (!categoryMap[category]) {
          categoryMap[category] = {
            category,
            productCount: 0,
            totalStock: 0,
            lowStockProducts: 0,
            products: []
          }
        }

        categoryMap[category].productCount += 1
        categoryMap[category].totalStock += product.stock || 0
        categoryMap[category].products.push({
          name: product.name,
          stock: product.stock || 0,
          price: product.price
        })

        if (product.stock < 10) {
          categoryMap[category].lowStockProducts += 1
          lowStock += 1
        }

        totalStockCount += product.stock || 0
      })

      // Convert to array and sort by product count
      const statsArray = Object.values(categoryMap).sort(
        (a, b) => b.productCount - a.productCount
      )

      setCategoryStats(statsArray)
      setTotalProducts(products.length)
      setTotalStock(totalStockCount)
      setLowStockCount(lowStock)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching inventory stats:', err)
    } finally {
      setLoading(false)
      if (!silent) {
        setRefreshing(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl" style={{ color: '#284B63' }}>Loading inventory statistics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#284B63' }}>
              Inventory Statistics
            </h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Auto-refresh toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#284B63' }}
              />
              <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
            </label>
            
            {/* Manual refresh button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50"
              style={{ backgroundColor: '#284B63' }}
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#284B63' }}></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md border-2" style={{ borderColor: '#D9D9D9' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#284B63' }}>{totalProducts}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-full">
                    <span className="text-3xl">📦</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-2" style={{ borderColor: '#D9D9D9' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Stock Units</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#284B63' }}>{totalStock}</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-full">
                    <span className="text-3xl">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-2" style={{ borderColor: '#D9D9D9' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#ef4444' }}>{lowStockCount}</p>
                    <p className="text-xs text-gray-500 mt-1">(Below 10 units)</p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-full">
                    <span className="text-3xl">⚠️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bar Chart - Stock by Category */}
              <div className="bg-white rounded-xl shadow-md border-2 p-6" style={{ borderColor: '#D9D9D9' }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>
                  Stock Availability by Category
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} style={{ fontSize: '12px' }} />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      formatter={(value, name) => {
                        if (name === 'Total Stock') return [value + ' units', name];
                        if (name === 'Products') return [value + ' items', name];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="totalStock" fill="#284B63" name="Total Stock" />
                    <Bar dataKey="productCount" fill="#3C6E71" name="Products" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Product Distribution */}
              <div className="bg-white rounded-xl shadow-md border-2 p-6" style={{ borderColor: '#D9D9D9' }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>
                  Product Distribution by Category
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, productCount, percent }) => 
                        `${category}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="productCount"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [value + ' products', 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Status Overview Chart */}
            <div className="bg-white rounded-xl shadow-md border-2 p-6 mb-8" style={{ borderColor: '#D9D9D9' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>
                Stock Status Overview - Low Stock Alert
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    formatter={(value, name) => {
                      if (name === 'Low Stock') return [value + ' items', name];
                      if (name === 'Good Stock') return [value + ' items', name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="lowStockProducts" 
                    fill="#EF4444" 
                    name="Low Stock"
                    stackId="a"
                  />
                  <Bar 
                    dataKey={(data) => data.productCount - data.lowStockProducts} 
                    fill="#10B981" 
                    name="Good Stock"
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Stats Table */}
            <div className="bg-white rounded-xl shadow-md border-2 overflow-hidden" style={{ borderColor: '#D9D9D9' }}>
              <div className="p-6 border-b-2" style={{ borderColor: '#D9D9D9' }}>
                <h2 className="text-xl font-bold" style={{ color: '#284B63' }}>
                  Category-wise Inventory
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Stock
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Avg Stock/Product
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Low Stock Items
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categoryStats.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold" 
                                 style={{ backgroundColor: '#284B63' }}>
                              {stat.category.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">{stat.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">{stat.productCount}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">{stat.totalStock}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {(stat.totalStock / stat.productCount).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {stat.lowStockProducts > 0 ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              {stat.lowStockProducts} items
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              All good
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Category Breakdown */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md border-2 p-6" style={{ borderColor: '#D9D9D9' }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#284B63' }}>
                    {stat.category} Products
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {stat.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">${product.price}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.stock < 10 ? 'bg-red-100 text-red-800' : 
                          product.stock < 30 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          Stock: {product.stock}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminInventory
