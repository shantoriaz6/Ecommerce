import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [showCategories, setShowCategories] = useState(false)

  const categories = ['Phone', 'Laptop', 'AirPods', 'Charger']

  return (
    <nav className="bg-gray-800 text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              Home
            </Link>

            <Link 
              to="/products/phone" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              Phone
            </Link>

            <Link 
              to="/products/laptop" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              Laptop
            </Link>

            <Link 
              to="/products/airpods" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              AirPods
            </Link>

            <Link 
              to="/products/charger" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              Charger
            </Link>

            {/* All Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="hover:text-blue-400 font-semibold transition duration-200 flex items-center space-x-1"
              >
                <span>All Categories</span>
                <span className={`transform transition-transform ${showCategories ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {showCategories && (
                <div className="absolute left-0 mt-2 bg-gray-700 rounded-lg shadow-lg w-48 py-2 z-10">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/products/${category.toLowerCase()}`}
                      className="block px-4 py-2 hover:bg-gray-600 transition duration-200"
                      onClick={() => setShowCategories(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Auth Links */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition duration-200"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition duration-200"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar