import React from 'react'

const Home = () => {
  const products = [
    { id: 1, name: 'iPhone 15', category: 'Phone', price: '$999' },
    { id: 2, name: 'Samsung S24', category: 'Phone', price: '$899' },
    { id: 3, name: 'MacBook Pro', category: 'Laptop', price: '$1999' },
    { id: 4, name: 'Dell XPS', category: 'Laptop', price: '$1499' },
    { id: 5, name: 'AirPods Pro', category: 'AirPods', price: '$249' },
    { id: 6, name: 'Sony WH-1000XM5', category: 'AirPods', price: '$399' },
    { id: 7, name: 'iPhone Charger', category: 'Charger', price: '$29' },
    { id: 8, name: 'Fast Charger', category: 'Charger', price: '$49' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12" style={{ color: '#284B63' }}>Featured Products</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 sm:p-6">
              <div className="h-40 sm:h-48 bg-gray-200 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm sm:text-base">Product Image</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold mb-2" style={{ color: '#284B63' }}>{product.name}</h2>
              <p className="text-xs sm:text-sm mb-2" style={{ color: '#284B63' }}>{product.category}</p>
              <p className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: '#284B63' }}>{product.price}</p>
              <button className="w-full hover:bg-blue-700 font-bold py-2 px-4 rounded-lg transition duration-200 text-sm sm:text-base" style={{ backgroundColor: '#284B63', color: '#FFFFFF' }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home