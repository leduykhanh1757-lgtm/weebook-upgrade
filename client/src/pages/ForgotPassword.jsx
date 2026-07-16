import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Step 1: Request code
  const [email, setEmail] = useState('');
  
  // Step 2: Reset password
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // UI State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await authAPI.forgotPassword(email);
      setMessage({ type: 'success', text: res.message || 'Đã gửi mã xác nhận qua email' });
      setStep(2); // Go to step 2
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự' });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.resetPassword(email, code, newPassword);
      setMessage({ type: 'success', text: res.message || 'Đổi mật khẩu thành công!' });
      
      // Navigate to login after 2 seconds
      setTimeout(() => {
          navigate('/auth');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Mã xác nhận không đúng hoặc đã hết hạn' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.authPage}`}>
      <div className={styles.authContainer}>
        <div style={{ padding: '30px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Quên Mật Khẩu</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{step === 1 ? 'Nhập email của bạn để nhận mã xác nhận' : 'Nhập mã xác nhận và mật khẩu mới'}</p>
        </div>

        <form onSubmit={step === 1 ? handleRequestCode : handleResetPassword} className={styles.authForm}>
          {message.text && (
            <div style={{
                padding: '12px 15px',
                marginBottom: '20px',
                borderRadius: '8px',
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
                fontSize: '0.95rem',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {message.text}
            </div>
          )}

          {step === 1 ? (
            <>
              <div className={styles.formGroup}>
                <label>Địa chỉ Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Nhập email của bạn" 
                  required 
                />
              </div>

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading || !email}>
                {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
              </button>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label>Mã xác nhận (Gửi qua Email)</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  placeholder="Nhập mã 6 chữ số" 
                  maxLength="6"
                  required 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Mật khẩu mới</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Nhập mật khẩu mới" 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  placeholder="Nhập lại mật khẩu mới" 
                  required 
                />
              </div>

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading || !code || !newPassword || !confirmNewPassword}>
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
              
              <button 
                type="button" 
                className={styles.submitBtn} 
                style={{ marginTop: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '14px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 500 }}
                onClick={() => setStep(1)}
              >
                Trở lại
              </button>
            </>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nhớ ra mật khẩu? <Link to="/auth" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Đăng nhập ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
