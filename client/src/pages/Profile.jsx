import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileThunk } from '../store/authSlice';
import AccountSidebar from '../components/AccountSidebar';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    address: user?.address || ''
  });
  const [saving, setSaving] = useState(false);

  if (!user) {
    return <div className="container loading-placeholder"><p>Vui lòng đăng nhập để xem hồ sơ.</p></div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfileThunk(formData)).unwrap();
      setIsEditing(false);
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      alert('Lỗi cập nhật hồ sơ');
    } finally {
      setSaving(false);
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
            <h1 className={styles.cardTitle}>Hồ sơ của tôi</h1>
            <p className={styles.cardSubtitle}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>
          
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{user.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Họ và tên</span>
              {isEditing ? (
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.editInput} />
              ) : (
                <span className={styles.infoValue}>{user.name}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Số điện thoại</span>
              {isEditing ? (
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.editInput} />
              ) : (
                <span className={styles.infoValue}>{user.phone || 'Chưa cập nhật'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày sinh</span>
              {isEditing ? (
                <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className={styles.editInput} />
              ) : (
                <span className={styles.infoValue}>{user.birthday ? formatDate(user.birthday) : 'Chưa cập nhật'}</span>
              )}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Địa chỉ</span>
              {isEditing ? (
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={styles.editInput} />
              ) : (
                <span className={styles.infoValue}>{user.address || 'Chưa cập nhật'}</span>
              )}
            </div>

            <div className={styles.actionRow}>
              {isEditing ? (
                <>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button className="btn" onClick={() => setIsEditing(false)} style={{ border: '1px solid var(--border-color)', marginLeft: '10px' }}>
                    Hủy
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Thay đổi thông tin</button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
