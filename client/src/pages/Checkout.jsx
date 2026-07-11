import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { clearCart } from '../store/cartSlice';
import { toast } from 'react-hot-toast';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { user } = useSelector(state => state.auth);
  const { items: cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  const items = buyNowItem ? [{...buyNowItem.book, quantity: buyNowItem.quantity, bookId: buyNowItem.bookId}] : cartItems;

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: '',
    district: '',
    ward: '',
    address: user?.address || '',
    payment: 'cod',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Error fetching provinces", err));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let shipping = 35000;
  if (formData.city === 'Thành phố Hà Nội' || formData.city === 'Thành phố Hồ Chí Minh') {
    shipping = 20000;
  }
  if (subtotal >= 300000) {
    shipping = 0;
  }
  if (!formData.city) {
    shipping = 0; // Chưa chọn tỉnh thì hiển thị 0 hoặc ẩn
  }

  const total = subtotal + shipping;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, city: name, district: '', ward: '' });
    if (code) {
      fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts));
      setWards([]);
    }
  };

  const handleDistrictChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, district: name, ward: '' });
    if (code) {
      fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards));
    }
  };

  const handleWardChange = (e) => {
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData({ ...formData, ward: name });
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.district || !formData.ward) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData, shippingCost: shipping };
      if (buyNowItem) {
        payload.buyNowItem = { bookId: buyNowItem.bookId, quantity: buyNowItem.quantity };
      }
      const res = await ordersAPI.createOrder(payload);
      if (!buyNowItem) {
        dispatch(clearCart());
      }
      navigate(`/order-success?id=${res.orderId}&code=${res.orderCode}`);
      toast.success('Đặt hàng thành công!');
    } catch (err) {
      console.error('Checkout failed', err);
      toast.error('Thanh toán thất bại');
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
            <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className={styles.formGroup}>
                <label>Tỉnh/Thành phố *</label>
                <select onChange={handleProvinceChange} required defaultValue="">
                  <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Quận/Huyện *</label>
                <select onChange={handleDistrictChange} required disabled={districts.length === 0} defaultValue="">
                  <option value="" disabled>Chọn Quận/Huyện</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Phường/Xã *</label>
              <select onChange={handleWardChange} required disabled={wards.length === 0} defaultValue="">
                <option value="" disabled>Chọn Phường/Xã</option>
                {wards.map(w => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Địa chỉ cụ thể *</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Số nhà, tên đường..." />
            </div>
            <div className={styles.formGroup}>
              <label>Ghi chú đơn hàng</label>
              <input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Ghi chú thêm về việc giao hàng" />
            </div>
          </div>
          
          <div className={styles.checkoutCard}>
            <h2>Phương thức thanh toán</h2>
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
            <div style={{ margin: '15px 0', maxHeight: '300px', overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.bookId || item.id} style={{ display: 'flex', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                  <img src={item.images?.[0] || '/src/assets/images/placeholder.jpg'} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'contain', border: '1px solid var(--border-color)', padding: '5px', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Số lượng: {item.quantity}</p>
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--danger-color)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.orderTotals}>
              <p><span>Tạm tính:</span> <span>{formatPrice(subtotal)}</span></p>
              <p>
                <span>Phí vận chuyển:</span> 
                <span>
                  {shipping === 0 ? (formData.city ? 'Miễn phí' : '0 đ') : formatPrice(shipping)}
                </span>
              </p>
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
