import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, registerUser } from '../store/authSlice';
import { fetchCart } from '../store/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './Auth.module.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const res = await dispatch(login({ email: formData.email, password: formData.password }));
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchCart());
        navigate('/');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }
      const res = await dispatch(registerUser(formData));
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchCart());
        navigate('/');
      }
    }
  };

  return (
    <div className={`container ${styles.authPage}`}>
      <div className={styles.authContainer}>
        <div className={styles.authTabs}>
          <button className={`${styles.tabBtn} ${isLogin ? styles.active : ''}`} onClick={() => setIsLogin(true)}>Đăng nhập</button>
          <button className={`${styles.tabBtn} ${!isLogin ? styles.active : ''}`} onClick={() => setIsLogin(false)}>Đăng ký</button>
        </div>
        
        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && <div style={{ color: 'white', background: 'var(--danger-color)', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</div>}
          
          {!isLogin && (
            <>
              <div className={styles.formGroup}>
                <label>Họ và tên *</label>
                <input type="text" name="name" onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Số điện thoại *</label>
                <input type="tel" name="phone" onChange={handleChange} required />
              </div>
            </>
          )}
          <div className={styles.formGroup}>
            <label>Email *</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Mật khẩu *</label>
            <input type="password" name="password" onChange={handleChange} required />
          </div>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Xác nhận mật khẩu *</label>
              <input type="password" name="confirmPassword" onChange={handleChange} required />
            </div>
          )}
          {isLogin && (
            <div style={{ textAlign: 'right', marginTop: '-10px' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                Quên mật khẩu?
              </Link>
            </div>
          )}
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
