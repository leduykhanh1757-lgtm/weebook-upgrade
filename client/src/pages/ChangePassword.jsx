import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AccountSidebar from '../components/AccountSidebar';
import { authAPI } from '../services/api';
import styles from './ChangePassword.module.css';

const ChangePassword = () => {
  const { user } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!user) {
    return <div className="container loading-placeholder"><p>Vui lòng đăng nhập để đổi mật khẩu.</p></div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      setMessage({ type: 'success', text: res.message || 'Đổi mật khẩu thành công!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.accountLayout}`}>
      <aside className={styles.sidebarCol}>
        <AccountSidebar />
      </aside>
      
      <main className={styles.mainCol}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Đổi mật khẩu</h1>
            <p className={styles.cardSubtitle}>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
          </div>
          
          <div className={styles.cardBody}>
            {message.text && (
              <div style={{
                padding: '15px', 
                marginBottom: '20px', 
                borderRadius: '8px', 
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b'
              }}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={formData.currentPassword} 
                  onChange={handleChange} 
                  className={styles.formControl} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mật khẩu mới</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleChange} 
                  className={styles.formControl} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  className={styles.formControl} 
                  required 
                />
              </div>
              <button type="submit" className={`btn btn-primary ${styles.btnSubmit}`} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
