import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { clearCart } from '../store/cartSlice';
import styles from './Checkout.module.css';

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

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (items.length === 0) {
    return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><h2>Giỏ hàng trống!</h2></div>;
  }

  return (
    <div className={`container ${styles.checkoutPage}`}>
      <div className={styles.checkoutLayout}>
        <div className="checkout-form-section">
          <div className={styles.checkoutCard}>
            <h2>Thông tin giao hàng</h2>
            <div className={styles.formGroup}>
              <label>Họ và tên *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Số điện thoại *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Tỉnh/Thành phố</label>
              <select name="city" value={formData.city} onChange={handleChange}>
                <option value="hanoi">Hà Nội</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
                <option value="danang">Đà Nẵng</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Địa chỉ chi tiết *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Số nhà, tên đường..." />
            </div>
            <div className={styles.formGroup}>
              <label>Ghi chú đơn hàng</label>
              <input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Ghi chú thêm về việc giao hàng" />
            </div>
          </div>
          
          <div className={styles.checkoutCard}>
            <h2>Phương thức vận chuyển & thanh toán</h2>
            <div className={styles.formGroup}>
              <label>Vận chuyển</label>
              <select name="delivery" value={formData.delivery} onChange={handleChange}>
                <option value="standard">Giao hàng tiêu chuẩn (Miễn phí)</option>
                <option value="express">Giao hàng hỏa tốc (30.000 đ)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Thanh toán</label>
              <select name="payment" value={formData.payment} onChange={handleChange}>
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="bank">Chuyển khoản ngân hàng</option>
                <option value="momo">Ví Momo</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="order-summary-section">
          <div className={styles.checkoutCard}>
            <h3>Tóm tắt đơn hàng ({items.length} sản phẩm)</h3>
            <div className={styles.orderTotals}>
              <p><span>Tạm tính:</span> <span>{formatPrice(subtotal)}</span></p>
              <p><span>Phí vận chuyển:</span> <span>{formatPrice(shipping)}</span></p>
              <p><strong><span>Tổng cộng:</span> <span>{formatPrice(total)}</span></strong></p>
            </div>
            <button className={`btn btn-primary ${styles.checkoutBtn}`} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
