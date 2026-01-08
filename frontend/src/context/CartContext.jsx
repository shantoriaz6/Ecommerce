import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../services/axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axiosInstance.get('/cart');
      setCart(response.data.data);
      setCartCount(response.data.data.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/cart/add', { productId, quantity });
      setCart(response.data.data);
      setCartCount(response.data.data.items.reduce((sum, item) => sum + item.quantity, 0));
      return { success: true, message: 'Added to cart successfully' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item
  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const response = await axiosInstance.patch('/cart/update', { productId, quantity });
      setCart(response.data.data);
      setCartCount(response.data.data.items.reduce((sum, item) => sum + item.quantity, 0));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update cart' };
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/cart/remove/${productId}`);
      setCart(response.data.data);
      setCartCount(response.data.data.items.reduce((sum, item) => sum + item.quantity, 0));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to remove from cart' };
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete('/cart/clear');
      setCart({ items: [] });
      setCartCount(0);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to clear cart' };
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCart();
    }
  }, []);

  const value = {
    cart,
    cartCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
