import React from 'react'

const Topbar = () => {
  return (
    <div className="bg-white py-2 sticky top-0 z-50 shadow-md" style={{ color: '#284B63' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Gadget World Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
            <h1 className="text-lg sm:text-xl font-bold">Gadget WORLD</h1>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:flex-1 sm:max-w-md sm:mx-4 lg:mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-3 sm:px-4 py-1.5 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base border-2"
                style={{ borderColor: '#284B63', boxShadow: '0 10px 25px -5px rgba(40, 75, 99, 0.3), 0 8px 10px -6px rgba(40, 75, 99, 0.2)' }}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold text-white" style={{ backgroundColor: '#284B63' }}>
                Search
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="text-right">
              <p className="text-xs lg:text-sm font-semibold">Customer Support</p>
              <p className="text-lg lg:text-xl font-bold">1-800-123-4567</p>
            </div>
            <div className="text-xl lg:text-2xl ml-2">📞</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar