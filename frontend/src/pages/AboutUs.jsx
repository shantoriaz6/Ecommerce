import React from 'react'

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-5xl font-bold text-center mb-4" style={{ color: '#284B63' }}>
            About Us
          </h1>
          <p className="text-center text-gray-600 text-lg max-w-3xl mx-auto">
            Welcome to our e-commerce store, your trusted destination for quality electronics and accessories
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl mr-4"
                   style={{ backgroundColor: '#284B63' }}>
                🎯
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#284B63' }}>Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our mission is to provide our customers with the best quality products at reasonable prices. 
              We believe that everyone deserves access to top-notch electronics without breaking the bank. 
              Customer satisfaction is at the heart of everything we do.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl mr-4"
                   style={{ backgroundColor: '#284B63' }}>
                💎
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#284B63' }}>Our Promise</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We promise to deliver quality products at competitive prices with excellent customer service. 
              Every product we offer is carefully selected to ensure it meets our high standards of quality and reliability.
            </p>
          </div>
        </div>

        {/* What We Sell Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#284B63' }}>
            What We Sell
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg border-2 hover:shadow-lg transition duration-300"
                 style={{ borderColor: '#284B63' }}>
              <div className="text-5xl mb-4">💻</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#284B63' }}>Laptops</h3>
              <p className="text-gray-600">
                High-performance laptops from top brands for work, gaming, and everyday use
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border-2 hover:shadow-lg transition duration-300"
                 style={{ borderColor: '#284B63' }}>
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#284B63' }}>Smartphones</h3>
              <p className="text-gray-600">
                Latest smartphones with cutting-edge technology and features
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border-2 hover:shadow-lg transition duration-300"
                 style={{ borderColor: '#284B63' }}>
              <div className="text-5xl mb-4">🎧</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#284B63' }}>Accessories</h3>
              <p className="text-gray-600">
                Premium audio accessories including headphones, earbuds, and more
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#284B63' }}>
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-semibold mb-2" style={{ color: '#284B63' }}>Quality Products</h3>
              <p className="text-sm text-gray-600">Only authentic and high-quality items</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold mb-2" style={{ color: '#284B63' }}>Best Prices</h3>
              <p className="text-sm text-gray-600">Competitive pricing and great deals</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-semibold mb-2" style={{ color: '#284B63' }}>Fast Delivery</h3>
              <p className="text-sm text-gray-600">Quick and reliable shipping</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2" style={{ color: '#284B63' }}>Secure Shopping</h3>
              <p className="text-sm text-gray-600">Safe and secure transactions</p>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#284B63' }}>
            Visit Our Store
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#284B63' }}>
                  📍 Our Address
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Uttara Sector 11<br />
                  Dhaka, Bangladesh
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#284B63' }}>
                  🕐 Business Hours
                </h3>
                <p className="text-gray-700">
                  Saturday - Thursday: 10:00 AM - 9:00 PM<br />
                  Friday: 2:00 PM - 9:00 PM
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#284B63' }}>
                  📞 Contact Us
                </h3>
                <p className="text-gray-700">
                  Phone: +880 1XXX-XXXXXX<br />
                  Email: info@ecommerce.com
                </p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#284B63' }}>
                Our Outlet
              </h3>
              <p className="text-gray-700 mb-4">
                Visit our physical store at Uttara Sector 11 to experience our products firsthand. 
                Our friendly staff is ready to assist you with all your needs.
              </p>
              <button
                className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition duration-200 font-semibold"
                style={{ backgroundColor: '#284B63' }}
              >
                Get Directions
              </button>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#284B63' }}>
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl"
                   style={{ backgroundColor: '#284B63' }}>
                🤝
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#284B63' }}>Trust</h3>
              <p className="text-gray-600 text-sm">
                Building long-term relationships based on trust and transparency
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl"
                   style={{ backgroundColor: '#284B63' }}>
                ⭐
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#284B63' }}>Excellence</h3>
              <p className="text-gray-600 text-sm">
                Striving for excellence in every product and service we offer
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl"
                   style={{ backgroundColor: '#284B63' }}>
                ❤️
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#284B63' }}>Customer First</h3>
              <p className="text-gray-600 text-sm">
                Your satisfaction is our top priority in everything we do
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
