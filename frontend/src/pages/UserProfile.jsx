import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axios'

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    address: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
      return
    }
    fetchUserProfile()
    fetchUserOrders()
  }, [navigate])

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/users/profile')
      setUser(response.data.data)
      setFormData({
        fullName: response.data.data.fullName || '',
        email: response.data.data.email || '',
        contactNumber: response.data.data.contactNumber || '',
        address: response.data.data.address || ''
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders')
      setOrders(response.data.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = new FormData()
      submitData.append('fullName', formData.fullName)
      submitData.append('contactNumber', formData.contactNumber)
      submitData.append('address', formData.address)
      
      if (avatarFile) {
        submitData.append('avatar', avatarFile)
      }

      const response = await axiosInstance.patch('/users/profile', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setUser(response.data.data)
      setEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      alert('Profile updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'Shipped':
        return 'bg-purple-100 text-purple-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#284B63' }}></div>
          <p className="mt-4" style={{ color: '#284B63' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#284B63' }}>My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#284B63' }}>Profile Information</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    style={{ backgroundColor: '#284B63' }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                      Avatar
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold"
                           style={{ backgroundColor: '#284B63' }}>
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : user?.avatar ? (
                          <img src={user.avatar} alt="Current Avatar" className="w-full h-full object-cover" />
                        ) : (
                          user?.fullName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload a new avatar image</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#284B63' }}>
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main Street, City, State, ZIP"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-6 py-2 text-white rounded-lg hover:bg-green-700 transition duration-200"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          fullName: user?.fullName || '',
                          email: user?.email || '',
                          contactNumber: user?.contactNumber || '',
                          address: user?.address || ''
                        })
                      }}
                      className="px-6 py-2 border-2 rounded-lg hover:bg-gray-100 transition duration-200"
                      style={{ borderColor: '#284B63', color: '#284B63' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold"
                         style={{ backgroundColor: '#284B63' }}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.fullName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: '#284B63' }}>{user?.fullName}</h3>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-semibold" style={{ color: '#284B63' }}>
                        {user?.contactNumber || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold" style={{ color: '#284B63' }}>
                        {user?.address || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-semibold" style={{ color: '#284B63' }}>
                        {new Date(user?.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#284B63' }}>Quick Stats</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0F4F8' }}>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold" style={{ color: '#284B63' }}>{orders.length}</p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0F4F8' }}>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'Pending').length}
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0F4F8' }}>
                  <p className="text-sm text-gray-600">Delivered Orders</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'Delivered').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#284B63' }}>Recent Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-600 mb-4">No orders yet</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  style={{ backgroundColor: '#284B63' }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-mono text-sm text-gray-600">#{order._id.slice(-8)}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {order.items.length} item(s) • Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#284B63' }}>${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => navigate('/orders')}
                        className="px-4 py-2 border-2 rounded-lg hover:bg-gray-100 transition duration-200 text-sm"
                        style={{ borderColor: '#284B63', color: '#284B63' }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                
                {orders.length > 5 && (
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full py-3 border-2 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold"
                    style={{ borderColor: '#284B63', color: '#284B63' }}
                  >
                    View All Orders
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
