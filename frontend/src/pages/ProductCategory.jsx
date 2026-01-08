import React from 'react'
import { useParams } from 'react-router-dom'

const ProductCategory = () => {
  const { category } = useParams()
  const formatted = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">{formatted}</h1>
        <p className="text-sm sm:text-base text-gray-600">Showing products for {formatted}.</p>
      </div>
    </div>
  )
}

export default ProductCategory
