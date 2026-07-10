import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { clearCart } from '../store/cartSlice';

const Checkout = () => {
  const { user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: 'hanoi',
    district: '',
    address: user?.address || '',
    delivery: 'standard',
    payment: 'cod',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = formData.delivery === 'express' ? 30000 : 0;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Vui lòng điền đủ thông tin giao hàng');
      return;
    }
    setLoading(true);
    try {
      const res = await ordersAPI.createOrder(formData);
      dispatch(clearCart());
      navigate(`/order-success?id=${res.orderId}`);
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Thanh toán thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return <div className="container"><p>Giỏ hàng trống!</p></div>;
  }

  return (
    <div className="container checkout-page">
      <div className="checkout-layout">
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h2>Thông tin giao hàng</h2>
            <div className="form-group">
              <label>Họ và tên *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Số điện thoại *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Địa chỉ *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required />
            </div>
          </div>
        </div>
        <div className="order-summary-section">
          <div className="order-summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="order-totals">
              <p>Tạm tính: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</p>
              <p>Phí ship: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping)}</p>
              <p><strong>Tổng cộng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</strong></p>
            </div>
            <button className="checkout-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Hoàn tất đơn hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
