import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Topbar from './components/Topbar'
import Navbar from './components/Navbar'
import Footer from './components/footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductCategory from './pages/ProductCategory'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import Orders from './pages/Orders'
import UserProfile from './pages/UserProfile'
import Offers from './pages/Offers'
import HotDeals from './pages/HotDeals'
import Discount from './pages/Discount'
import AboutUs from './pages/AboutUs'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminOrders from './pages/AdminOrders'
import AdminInventory from './pages/AdminInventory'
import AdminAddProduct from './pages/AdminAddProduct'
import AdminEditProducts from './pages/AdminEditProducts'
import AdminDeleteProducts from './pages/AdminDeleteProducts'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {!isAdminRoute && (
        <>
          <Topbar />
          <Navbar />
        </>
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/hot-deals" element={<HotDeals />} />
          <Route path="/discount" element={<Discount />} />
          <Route path="/about-us" element={<AboutUs />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/add-product" element={<AdminAddProduct />} />
          <Route path="/admin/edit-products" element={<AdminEditProducts />} />
          <Route path="/admin/delete-products" element={<AdminDeleteProducts />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
