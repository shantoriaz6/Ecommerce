import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const [showCategories, setShowCategories] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const categories = ['Phone', 'Laptop', 'AirPods', 'Headphone', 'Charger', 'Printer', 'Camera', 'Monitor', 'Gaming', 'Sound', 'Gadget']

  useEffect(() => {
    // Check if user is logged in by checking for accessToken
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken')
      setIsLoggedIn(!!token)
    }
    
    checkAuth()
    
    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  const handleAuthClick = () => {
    if (isLoggedIn) {
      // Logout
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('storage'))
      
      setIsLoggedIn(false)
      navigate('/')
    } else {
      // Navigate to login
      navigate('/login')
    }
  }

  return (
    <nav className="text-white py-6 shadow-md" style={{ backgroundColor: '#353535' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              Home
            </Link>

            <Link 
              to="/offers" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              Offers
            </Link>

            <Link 
              to="/hot-deals" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              Hot Deals
            </Link>

            <Link 
              to="/discount" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              Discount
            </Link>

            <Link 
              to="/about-us" 
              className="hover:text-blue-400 font-semibold transition duration-200"
            >
              About Us
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

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Icons - Cart and Auth */}
          <div className="flex items-center space-x-4 sm:space-x-6 ml-auto">
            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="relative hover:text-blue-400 transition duration-200"
              title="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Icon with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hover:text-blue-400 transition duration-200"
                title="Account"
              >
                {isLoggedIn ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-2 z-10">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 transition duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleAuthClick()
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 transition duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleAuthClick()
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 transition duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-2">
            <Link 
              to="/" 
              className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/offers" 
              className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Offers
            </Link>
            <Link 
              to="/hot-deals" 
              className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hot Deals
            </Link>
            <Link 
              to="/discount" 
              className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Discount
            </Link>
            <Link 
              to="/about-us" 
              className="block py-2 px-4 hover:bg-gray-700 rounded transition duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            
            {/* All Categories Dropdown in Mobile */}
            <div className="border-t border-gray-700 pt-2">
              <p className="px-4 py-2 text-sm text-gray-400 font-semibold">All Categories</p>
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/products/${category.toLowerCase()}`}
                  className="block py-2 px-6 hover:bg-gray-700 rounded transition duration-200 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-700 mt-2 pt-2 space-y-2">
              <Link 
                to="/cart" 
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded transition duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Cart ({cartCount})</span>
              </Link>
              {isLoggedIn && (
                <Link 
                  to="/orders" 
                  className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded transition duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>My Orders</span>
                </Link>
              )}
              <button
                onClick={() => {
                  handleAuthClick()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded transition duration-200"
              >
                {isLoggedIn ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                    </svg>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
