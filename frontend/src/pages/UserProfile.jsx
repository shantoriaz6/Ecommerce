import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
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
    fetchUserProfile()
    fetchUserOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#284B63' }}>My Profile</h1>
          <p className="text-gray-600">Manage your account information and view your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold" style={{ color: '#284B63' }}>
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Information
                  </span>
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-5 py-2.5 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 font-medium"
                    style={{ backgroundColor: '#284B63' }}
                  >
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </span>
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#284B63' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#284B63' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#284B63' }}>
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white"
                             style={{ backgroundColor: '#284B63' }}>
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                          ) : user?.avatar ? (
                            <img src={user.avatar} alt="Current Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user?.fullName?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: '#284B63' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition duration-200"
                        />
                        <p className="text-xs text-gray-600 mt-2">PNG, JPG up to 5MB. Recommended 400x400px</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#284B63' }}>
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#284B63' }}>
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="1"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 resize-none"
                        placeholder="123 Main St, City, State, ZIP"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      className="px-8 py-3 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 font-semibold"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setAvatarPreview(null)
                        setAvatarFile(null)
                        setFormData({
                          fullName: user?.fullName || '',
                          email: user?.email || '',
                          contactNumber: user?.contactNumber || '',
                          address: user?.address || ''
                        })
                      }}
                      className="px-8 py-3 border-2 rounded-lg hover:bg-gray-50 transition duration-200 font-semibold"
                      style={{ borderColor: '#284B63', color: '#284B63' }}
                    >
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-6 pb-6 border-b">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-blue-50"
                           style={{ backgroundColor: '#284B63' }}>
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          user?.fullName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
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
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition duration-200"
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
                        <p className="text-lg font-bold" style={{ color: '#284B63' }}>{order.totalAmount.toFixed(2)}৳</p>
                      </div>
                      <button
                        onClick={() => navigate(`/orders?id=${order._id}`)}
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
