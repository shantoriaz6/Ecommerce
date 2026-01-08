import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Gadget WORLD</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Your one-stop shop for all electronic gadgets and accessories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products/phone" className="text-gray-400 hover:text-blue-400 transition">
                  Phones
                </Link>
              </li>
              <li>
                <Link to="/products/laptop" className="text-gray-400 hover:text-blue-400 transition">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/products/airpods" className="text-gray-400 hover:text-blue-400 transition">
                  AirPods
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Customer Service</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>Contact Us</li>
              <li>Track Order</li>
              <li>Returns</li>
              <li>FAQs</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Contact Us</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>📧 support@gadgetworld.com</li>
              <li>📞 1-800-123-4567</li>
              <li>📍 123 Tech Street, NY 10001</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Gadget WORLD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
