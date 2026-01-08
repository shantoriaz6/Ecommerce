import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const AdminSidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'User Orders', icon: '📦' },
    { path: '/admin/add-product', label: 'Add Product', icon: '➕' },
    { path: '/admin/edit-products', label: 'Edit Products', icon: '✏️' },
    { path: '/admin/delete-products', label: 'Delete Products', icon: '🗑️' },
  ]

  return (
    <div className="w-64 min-h-screen shadow-lg" style={{ backgroundColor: '#353535' }}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default AdminSidebar
