import React, { useState, useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import AdminFooter from '../components/AdminFooter'
import axiosInstance from '../services/axios'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import toast from 'react-hot-toast'

const AdminRevenue = () => {
  const [loading, setLoading] = useState(true)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [availableYears, setAvailableYears] = useState([])
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    monthRevenue: 0,
    monthOrders: 0,
    dailyData: []
  })

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  useEffect(() => {
    fetchRevenueData()
  }, [selectedYear, selectedMonth])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/admin/revenue?year=${selectedYear}&month=${selectedMonth}`)
      const data = response.data.data
      setRevenueData(data)
      
      // Set available years if not already set
      if (data.availableYears && data.availableYears.length > 0) {
        setAvailableYears(data.availableYears)
      }
    } catch (err) {
      console.error('Error fetching revenue data:', err)
      toast.error('Failed to fetch revenue data')
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('BDT', '৳')
  }

  // Prepare data for charts
  const chartData = revenueData.dailyData || []

  // Calculate average daily revenue for the month
  const avgDailyRevenue = revenueData.monthOrders > 0 
    ? revenueData.monthRevenue / chartData.length 
    : 0

  // Calculate average order value for the month
  const avgOrderValue = revenueData.monthOrders > 0 
    ? revenueData.monthRevenue / revenueData.monthOrders 
    : 0

  // Get top 5 days by revenue
  const topDays = [...chartData]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((item, index) => ({
      name: `Day ${item.date}`,
      value: item.revenue,
      orders: item.orders
    }))

  // Get month name
  const getMonthName = (monthNum) => {
    return months.find(m => m.value === monthNum)?.label || ''
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />
      <AdminTopbar />
      <div className="flex-1 ml-64 mt-20 flex flex-col">
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#284B63' }}>
              Revenue Dashboard
            </h1>
            <p className="text-gray-600">Track your revenue and financial performance (Real-time data)</p>
          </div>

          {/* Year and Month Selectors */}
          <div className="mb-6 flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 bg-white"
                style={{ focusRingColor: '#284B63' }}
              >
                {availableYears.length > 0 ? (
                  availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))
                ) : (
                  <option value={currentYear}>{currentYear}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 bg-white"
                style={{ focusRingColor: '#284B63' }}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            <div className="ml-4 mt-7">
              <button
                onClick={fetchRevenueData}
                className="px-6 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
                style={{ backgroundColor: '#284B63' }}
              >
                🔄 Refresh Data
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">All-Time Revenue</p>
                      <p className="text-2xl font-bold" style={{ color: '#284B63' }}>
                        {formatCurrency(revenueData.totalRevenue)}
                      </p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-full">
                      <span className="text-3xl">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border-2" style={{ borderColor: '#284B63' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{getMonthName(selectedMonth)} Revenue</p>
                      <p className="text-2xl font-bold" style={{ color: '#284B63' }}>
                        {formatCurrency(revenueData.monthRevenue)}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-full">
                      <span className="text-3xl">📈</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Month Orders</p>
                      <p className="text-2xl font-bold" style={{ color: '#284B63' }}>
                        {revenueData.monthOrders}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-full">
                      <span className="text-3xl">📦</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Avg Order Value</p>
                      <p className="text-2xl font-bold" style={{ color: '#284B63' }}>
                        {formatCurrency(avgOrderValue)}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-full">
                      <span className="text-3xl">💳</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Daily Revenue Line Chart */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>
                    Daily Revenue - {getMonthName(selectedMonth)} {selectedYear}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#284B63" 
                        strokeWidth={3}
                        dot={{ fill: '#284B63', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily Orders Bar Chart */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>
                    Daily Orders - {getMonthName(selectedMonth)} {selectedYear}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                      <Legend />
                      <Bar dataKey="orders" fill="#3C6E71" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Area Chart */}
              <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>
                  Revenue Flow - {getMonthName(selectedMonth)} {selectedYear}
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#284B63" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#284B63" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#284B63" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Top Performing Days */}
              {topDays.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>
                    Top 5 Revenue Days - {getMonthName(selectedMonth)} {selectedYear}
                  </h3>
                  <div className="space-y-3">
                    {topDays.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ 
                              backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#284B63' 
                            }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-semibold text-lg">{item.name}</span>
                            <p className="text-sm text-gray-600">{item.orders} orders</p>
                          </div>
                        </div>
                        <span className="font-bold text-xl" style={{ color: '#284B63' }}>
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default AdminRevenue
