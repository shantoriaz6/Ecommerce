import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Topbar from './components/Topbar'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductCategory from './pages/ProductCategory'

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Topbar />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:category" element={<ProductCategory />} />
      </Routes>
    </div>
  )
}

export default App
