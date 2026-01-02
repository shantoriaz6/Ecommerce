import React from 'react'
import { useParams } from 'react-router-dom'

const ProductCategory = () => {
  const { category } = useParams()
  const formatted = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{formatted}</h1>
        <p className="text-gray-600">Showing products for {formatted}.</p>
      </div>
    </div>
  )
}

export default ProductCategory
