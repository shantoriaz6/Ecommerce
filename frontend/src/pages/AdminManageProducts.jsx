import React from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminTopbar from '../components/AdminTopbar'
import AdminFooter from '../components/AdminFooter'

const AdminManageProducts = () => {
  const navigate = useNavigate()

  const productOptions = [
    {
      title: 'Add Product',
      description: 'Add new products to your inventory',
      icon: '➕',
      path: '/admin/manage-products/add',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      title: 'Edit Products',
      description: 'Update existing product information',
      icon: '✏️',
      path: '/admin/manage-products/edit',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      title: 'Delete Products',
      description: 'Remove products from your inventory',
      icon: '🗑️',
      path: '/admin/manage-products/delete',
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    }
  ]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <AdminSidebar />
      <AdminTopbar />
      
      <div className="flex-1 ml-64 mt-20 flex flex-col">
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Manage Products
              </h1>
              <p className="text-gray-600">
                Choose an action to manage your product inventory
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => navigate(option.path)}
                  className={`bg-gradient-to-br ${option.color} ${option.hoverColor} rounded-xl shadow-lg cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl`}
                >
                  <div className="p-8 text-white">
                    <div className="text-5xl mb-4">{option.icon}</div>
                    <h2 className="text-2xl font-bold mb-3">{option.title}</h2>
                    <p className="text-white text-opacity-90">
                      {option.description}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 px-8 py-4 rounded-b-xl">
                    <span className="text-white font-semibold flex items-center">
                      Get Started
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Info Section */}
            <div className="mt-12 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Quick Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Add Product</h4>
                    <p className="text-sm text-gray-600">
                      Upload images, set prices, and add new items to your store
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Edit Product</h4>
                    <p className="text-sm text-gray-600">
                      Update product details, prices, stock, and images
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold">3</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Delete Product</h4>
                    <p className="text-sm text-gray-600">
                      Remove discontinued or out-of-stock items permanently
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <AdminFooter />
      </div>
    </div>
  )
}

export default AdminManageProducts
