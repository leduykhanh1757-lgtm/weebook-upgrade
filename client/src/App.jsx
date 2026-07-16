import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from './store/cartSlice';

import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbox from './components/Chatbox';

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
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminSettings from './pages/admin/AdminSettings';
import MyCoupons from './pages/MyCoupons';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch cart on load if logged in
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="app-container">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { borderRadius: '8px', background: '#333', color: '#fff' } }} />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="catalog/*" element={<AdminCatalog />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="marketing" element={<AdminMarketing />} />
          <Route path="settings" element={<AdminSettings />} />
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
                <Route path="/profile/orders" element={<Orders />} />
                <Route path="/profile/coupons" element={<MyCoupons />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/user/:id" element={<PublicProfile />} />
                <Route path="/info/:slug" element={<Info />} />
              </Routes>
            </main>
            <Footer />
            <Chatbox />
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
