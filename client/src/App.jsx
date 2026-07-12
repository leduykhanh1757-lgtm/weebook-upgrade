import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCart } from './store/cartSlice';

import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import Category from './pages/Category';
import Product from './pages/Product';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AddressBook from './pages/AddressBook';
import ChangePassword from './pages/ChangePassword';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import Info from './pages/Info';
import PublicProfile from './pages/PublicProfile';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminCatalog from './pages/admin/AdminCatalog';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch cart on load
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <div className="app-container">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { borderRadius: '8px', background: '#333', color: '#fff' } }} />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="catalog/*" element={<AdminCatalog />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<div style={{padding: 30}}><h2>Quản lý Khách hàng</h2><p>Tính năng đang phát triển...</p></div>} />
          <Route path="marketing" element={<div style={{padding: 30}}><h2>Marketing & Khuyến mãi</h2><p>Tính năng đang phát triển...</p></div>} />
          <Route path="settings" element={<div style={{padding: 30}}><h2>Hệ thống & Cài đặt</h2><p>Tính năng đang phát triển...</p></div>} />
        </Route>

        {/* Storefront Routes */}
        <Route path="/*" element={
          <>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/category" element={<Category />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/address" element={<AddressBook />} />
                <Route path="/profile/password" element={<ChangePassword />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/user/:id" element={<PublicProfile />} />
                <Route path="/info/:slug" element={<Info />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
