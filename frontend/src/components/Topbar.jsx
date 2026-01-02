import React from 'react'

const Topbar = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Gadget WORLD</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm font-semibold">
                Search
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="flex items-center space-x-2 ml-8">
            <div className="text-right">
              <p className="text-sm font-semibold">Customer Support</p>
              <p className="text-xl font-bold">1-800-123-4567</p>
            </div>
            <div className="text-2xl ml-2">📞</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar