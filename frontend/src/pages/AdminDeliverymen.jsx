import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import AdminFooter from '../components/AdminFooter'
import axiosInstance from '../services/axios'

const AdminDeliverymen = () => {
  const navigate = useNavigate()
  const [deliverymen, setDeliverymen] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDeliveryman, setSelectedDeliveryman] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    licenseNumber: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDeliverymen()
  }, [navigate])

  const fetchDeliverymen = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/admin/deliverymen')
      setDeliverymen(response.data.data)
    } catch (err) {
      console.error('Error fetching delivery men:', err)
      setError('Failed to fetch delivery men')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await axiosInstance.post('/admin/deliverymen', formData)
      setSuccess('Delivery man created successfully!')
      setShowModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: 'bike',
        vehicleNumber: '',
        licenseNumber: ''
      })
      fetchDeliverymen()
    } catch (err) {
      console.error('Create deliveryman error:', err.response || err)
      let errorMessage = 'Failed to create delivery man'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.removeItem('adminAccessToken')
          localStorage.removeItem('adminRefreshToken')
          navigate('/admin/login')
        }, 2000)
      }
    }
  }

  const toggleStatus = async (deliverymanId, currentStatus) => {
    try {
      await axiosInstance.patch(`/admin/deliverymen/${deliverymanId}`, {
        isActive: !currentStatus
      })
      setSuccess('Status updated successfully!')
      fetchDeliverymen()
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const deleteDeliveryman = async (deliverymanId) => {
    if (!window.confirm('Are you sure you want to delete this delivery man?')) {
      return
    }

    try {
      await axiosInstance.delete(`/admin/deliverymen/${deliverymanId}`)
      setSuccess('Delivery man deleted successfully!')
      fetchDeliverymen()
    } catch (err) {
      setError('Failed to delete delivery man')
    }
  }

  const viewStats = async (deliverymanId) => {
    try {
      const response = await axiosInstance.get(`/admin/deliverymen/${deliverymanId}/stats`)
      setSelectedDeliveryman(response.data.data)
      setShowModal(true)
    } catch (err) {
      setError('Failed to fetch stats')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl" style={{ color: '#284B63' }}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminTopbar />
      <div className="flex-1 ml-64 mt-20 flex flex-col">
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#284B63' }}>
            Delivery Management
          </h1>
          <button
            onClick={() => {
              setSelectedDeliveryman(null)
              setShowModal(true)
            }}
            className="px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg"
            style={{ backgroundColor: '#284B63' }}
          >
            + Add Delivery Man
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-2" style={{ borderColor: '#D9D9D9' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Delivery Men</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#284B63' }}>{deliverymen.length}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <span className="text-3xl">🚚</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-2" style={{ borderColor: '#D9D9D9' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold mt-2 text-green-600">
                  {deliverymen.filter(d => d.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-2" style={{ borderColor: '#D9D9D9' }}>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Deliveries</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#284B63' }}>
                  {deliverymen.reduce((sum, d) => sum + d.totalDeliveries, 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <span className="text-3xl">📦</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Men Table */}
        <div className="bg-white rounded-xl shadow-md border-2 overflow-hidden" style={{ borderColor: '#D9D9D9' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Deliveries</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Rating</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliverymen.map((deliveryman) => (
                  <tr key={deliveryman._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                             style={{ backgroundColor: '#284B63' }}>
                          {deliveryman.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{deliveryman.name}</div>
                          <div className="text-xs text-gray-500">{deliveryman.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{deliveryman.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">{deliveryman.vehicleType}</div>
                      <div className="text-xs text-gray-500">{deliveryman.vehicleNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {deliveryman.completedDeliveries}/{deliveryman.totalDeliveries}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1 text-sm font-medium">{deliveryman.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        deliveryman.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {deliveryman.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewStats(deliveryman._id)}
                          className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                          title="View Stats"
                        >
                          📊 Stats
                        </button>
                        <button
                          onClick={() => toggleStatus(deliveryman._id, deliveryman.isActive)}
                          className={`px-3 py-1 text-xs font-semibold rounded ${
                            deliveryman.isActive 
                              ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                          title={deliveryman.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {deliveryman.isActive ? '🔒 Disable' : '🔓 Enable'}
                        </button>
                        <button
                          onClick={() => deleteDeliveryman(deliveryman._id)}
                          className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded hover:bg-red-200"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Create or Stats */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: '#284B63' }}>
                    {selectedDeliveryman ? 'Delivery Man Statistics' : 'Add New Delivery Man'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedDeliveryman(null)
                      setError('')
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedDeliveryman ? (
                  // Stats View
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Assigned</p>
                        <p className="text-3xl font-bold text-blue-600">{selectedDeliveryman.totalAssigned}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Delivered</p>
                        <p className="text-3xl font-bold text-green-600">{selectedDeliveryman.delivered}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-3xl font-bold text-orange-600">{selectedDeliveryman.pending}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="text-3xl font-bold text-purple-600">{selectedDeliveryman.successRate}%</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Profile Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedDeliveryman.deliveryman.name}</p>
                        <p><span className="font-medium">Email:</span> {selectedDeliveryman.deliveryman.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedDeliveryman.deliveryman.phone}</p>
                        <p><span className="font-medium">Vehicle:</span> {selectedDeliveryman.deliveryman.vehicleType} - {selectedDeliveryman.deliveryman.vehicleNumber}</p>
                        <p><span className="font-medium">Rating:</span> ⭐ {selectedDeliveryman.deliveryman.rating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Create Form
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                        <select
                          name="vehicleType"
                          value={formData.vehicleType}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="bike">Bike</option>
                          <option value="car">Car</option>
                          <option value="bicycle">Bicycle</option>
                          <option value="van">Van</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                        <input
                          type="text"
                          name="vehicleNumber"
                          value={formData.vehicleNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 py-3 px-6 rounded-lg text-white font-semibold transition-all"
                        style={{ backgroundColor: '#284B63' }}
                      >
                        Create Delivery Man
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false)
                          setError('')
                        }}
                        className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
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

export default AdminDeliverymen
