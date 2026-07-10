import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, registerUser } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

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
        navigate('/');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
      }
      const res = await dispatch(registerUser(formData));
      if (res.meta.requestStatus === 'fulfilled') {
        navigate('/');
      }
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-container">
        <div className="auth-tabs">
          <button className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Đăng nhập</button>
          <button className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Đăng ký</button>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form className="auth-form active" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Họ và tên *</label>
                <input type="text" name="name" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input type="tel" name="phone" onChange={handleChange} required />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input type="password" name="password" onChange={handleChange} required />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Xác nhận mật khẩu *</label>
              <input type="password" name="confirmPassword" onChange={handleChange} required />
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
