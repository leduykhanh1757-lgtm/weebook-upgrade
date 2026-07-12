import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import styles from './Auth.module.css'; // Reusing Auth styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await authAPI.forgotPassword(email);
      setMessage({ type: 'success', text: res.message || 'Đã gửi hướng dẫn khôi phục qua email' });
      setEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          <div className={styles.authHeader}>
            <h2>Quên Mật Khẩu</h2>
            <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
          </div>

          {message.text && (
            <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage} style={{
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
                fontSize: '0.9rem'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label>Địa chỉ Email</label>
              <div className={styles.inputWrapper}>
                <i className="fa-regular fa-envelope"></i>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Nhập email của bạn" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading || !email}>
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>Nhớ ra mật khẩu? <Link to="/auth">Đăng nhập ngay</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
