import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'User Orders', icon: '📦' },
    { path: '/admin/inventory', label: 'Inventory Stats', icon: '📈' },
    { path: '/admin/add-product', label: 'Add Product', icon: '➕' },
    { path: '/admin/edit-products', label: 'Edit Products', icon: '✏️' },
    { path: '/admin/delete-products', label: 'Delete Products', icon: '🗑️' },
    { path: '/admin/deliverymen', label: 'Delivery Management', icon: '🚚' },
  ]

  const handleLogout = () => {
    // Clear admin tokens
    localStorage.removeItem('adminAccessToken')
    localStorage.removeItem('adminRefreshToken')
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'))
    
    // Redirect to admin login
    navigate('/admin/login')
  }

  return (
    <div className="w-64 h-screen shadow-lg flex flex-col fixed left-0 top-0 overflow-y-auto" style={{ backgroundColor: '#353535' }}>
      <div className="p-6 flex-1">
        <h2 className="text-xl font-bold text-white mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                location.pathname === item.path
                  ? 'text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              style={location.pathname === item.path ? { backgroundColor: '#284B63' } : {}}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Logout button at the bottom */}
      <div className="p-6 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-300 hover:bg-red-600 hover:text-white transition duration-200"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar
