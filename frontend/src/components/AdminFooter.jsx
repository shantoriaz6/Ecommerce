import React from 'react'

const AdminFooter = () => {
  return (
    <footer 
      className="w-full py-6 text-center border-t-2 mt-auto"
      style={{ 
        backgroundColor: '#353535',
        borderColor: '#284B63'
      }}
    >
      <div className="space-y-2">
        <p className="text-gray-300 text-sm">
          © 2026 Gadget WORLD. All rights reserved.
        </p>
        <p className="text-gray-400 text-xs">
          Developed by Riaz Uddin Shanto
        </p>
      </div>
    </footer>
  )
}

export default AdminFooter
