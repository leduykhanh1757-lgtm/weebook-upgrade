import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!user) {
    return <div className="container loading-placeholder"><p>Vui lòng đăng nhập để đổi mật khẩu.</p></div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check password policy: min 8 chars, 1 letter, 1 number
  const isPolicyValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.newPassword);
  
  // Check if confirmation matches
  const isMatch = formData.confirmPassword.length > 0 ? formData.newPassword === formData.confirmPassword : true;

  // Form isValid?
  const isValid = formData.currentPassword.length > 0 && 
                  isPolicyValid && 
                  formData.newPassword === formData.confirmPassword &&
                  formData.newPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!isValid) return;

    setLoading(true);
    try {
      const res = await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      setMessage({ type: 'success', text: res.message || 'Đổi mật khẩu thành công!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
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
            
            <form onSubmit={handleSubmit} className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label>Mật khẩu hiện tại</label>
                  <Link to="/forgot-password" className={styles.forgotLink}>Quên mật khẩu?</Link>
                </div>
                <div className={styles.inputWrapper}>
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    name="currentPassword" 
                    value={formData.currentPassword} 
                    onChange={handleChange} 
                    className={styles.formControl} 
                    required 
                  />
                  <span className={styles.eyeIcon} onClick={() => setShowCurrent(!showCurrent)}>
                    <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Mật khẩu mới</label>
                <div className={styles.inputWrapper}>
                  <input 
                    type={showNew ? "text" : "password"} 
                    name="newPassword" 
                    value={formData.newPassword} 
                    onChange={handleChange} 
                    className={styles.formControl} 
                    required 
                  />
                  <span className={styles.eyeIcon} onClick={() => setShowNew(!showNew)}>
                    <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
                {formData.newPassword.length > 0 && (
                  <p className={`${styles.policyText} ${isPolicyValid ? styles.policyValid : ''}`}>
                    Mật khẩu cần tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số.
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Xác nhận mật khẩu mới</label>
                <div className={styles.inputWrapper}>
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className={`${styles.formControl} ${!isMatch && formData.confirmPassword.length > 0 ? styles.inputError : ''}`} 
                    required 
                  />
                  <span className={styles.eyeIcon} onClick={() => setShowConfirm(!showConfirm)}>
                    <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
                {!isMatch && formData.confirmPassword.length > 0 && (
                  <p className={styles.errorText}>Mật khẩu xác nhận không khớp!</p>
                )}
              </div>
              
              <button type="submit" className={`btn btn-primary ${styles.btnSubmit}`} disabled={loading || !isValid}>
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
