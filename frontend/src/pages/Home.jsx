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
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Featured Products</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h2>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <p className="text-xl font-bold text-blue-600 mb-4">{product.price}</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
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