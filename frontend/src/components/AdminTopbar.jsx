import React from 'react'

const AdminTopbar = () => {
  return (
    <div 
      className="h-20 bg-gradient-to-r from-white via-gray-50 to-white shadow-lg flex items-center justify-between px-8 fixed top-0 right-0 z-40" 
      style={{ 
        left: '256px', 
        borderBottom: '3px solid #284B63',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="flex items-center gap-5">
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full opacity-20"
            style={{ backgroundColor: '#284B63', filter: 'blur(8px)' }}
          ></div>
          <img 
            src="/logo.png" 
            alt="Gadget World Logo" 
            className="h-14 w-14 object-contain relative z-10 transform hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-wide" style={{ color: '#284B63' }}>
            Gadget World
          </h1>
          <p className="text-xs text-gray-500 font-medium tracking-wider">ADMIN DASHBOARD</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#F0F4F8' }}>
          <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
          <p className="text-sm font-bold" style={{ color: '#284B63' }}>Management System</p>
        </div>
      </div>
    </div>
  )
}

export default AdminTopbar
