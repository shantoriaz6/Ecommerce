import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Topbar from './components/Topbar'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductCategory from './pages/ProductCategory'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminOrders from './pages/AdminOrders'
import AdminAddProduct from './pages/AdminAddProduct'
import AdminEditProducts from './pages/AdminEditProducts'
import AdminDeleteProducts from './pages/AdminDeleteProducts'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="bg-gray-50 min-h-screen">
      {!isAdminRoute && (
        <>
          <Topbar />
          <Navbar />
        </>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:category" element={<ProductCategory />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/add-product" element={<AdminAddProduct />} />
        <Route path="/admin/edit-products" element={<AdminEditProducts />} />
        <Route path="/admin/delete-products" element={<AdminDeleteProducts />} />
      </Routes>
    </div>
  )
}

export default App
