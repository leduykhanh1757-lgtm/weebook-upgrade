import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileThunk } from '../store/authSlice';
import AccountSidebar from '../components/AccountSidebar';
import { toast } from 'react-hot-toast';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    gender: user?.gender || 'Khác',
    newsletter_subscribed: user?.newsletter_subscribed !== undefined ? user.newsletter_subscribed : 1
  });
  const [avatarBase64, setAvatarBase64] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return <div className="container loading-placeholder"><p>Vui lòng đăng nhập để xem hồ sơ.</p></div>;
  }

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 3) return email;
    return `${name.substring(0, 3)}***@${domain}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked ? 1 : 0 });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh phải nhỏ hơn 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfileThunk({ ...formData, avatar: avatarBase64 })).unwrap();
      setIsEditing(false);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err) {
      toast.error('Lỗi cập nhật hồ sơ');
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
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="Avatar" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{user.name.charAt(0).toUpperCase()}</div>
                )}
                {isEditing && (
                  <label className={styles.uploadAvatarBtn}>
                    <i className="fa-solid fa-camera"></i>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                  </label>
                )}
              </div>
              <div className={styles.avatarText}>
                <h3>{user.name}</h3>
                <p>Thành viên Weebook</p>
              </div>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>
                {maskEmail(user.email)}
                {user.email_verified === 1 ? (
                  <span className={styles.verifiedBadge} title="Đã xác minh"><i className="fa-solid fa-circle-check"></i> Đã xác minh</span>
                ) : (
                  <span className={styles.unverifiedBadge}><i className="fa-solid fa-circle-exclamation"></i> Chưa xác minh</span>
                )}
              </span>
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
              <span className={styles.infoValue}>
                {isEditing ? (
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.editInput} />
                ) : (
                  user.phone || <span className={styles.emptyValue}>Chưa cập nhật</span>
                )}
                {!isEditing && user.phone && (
                  user.phone_verified === 1 ? (
                    <span className={styles.verifiedBadge} title="Đã xác minh"><i className="fa-solid fa-circle-check"></i> Đã xác minh</span>
                  ) : (
                    <span className={styles.unverifiedBadge}><i className="fa-solid fa-circle-exclamation"></i> Chưa xác minh</span>
                  )
                )}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Giới tính</span>
              {isEditing ? (
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="gender" value="Nam" checked={formData.gender === 'Nam'} onChange={handleChange} /> Nam
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="gender" value="Nữ" checked={formData.gender === 'Nữ'} onChange={handleChange} /> Nữ
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="gender" value="Khác" checked={formData.gender === 'Khác'} onChange={handleChange} /> Khác
                  </label>
                </div>
              ) : (
                <span className={styles.infoValue}>{user.gender || 'Khác'}</span>
              )}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày sinh</span>
              {isEditing ? (
                <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className={styles.editInput} />
              ) : (
                <span className={styles.infoValue}>
                  {user.birthday ? formatDate(user.birthday) : <span className={styles.emptyValue}>Chưa cập nhật</span>}
                </span>
              )}
            </div>

            {isEditing && (
              <div className={styles.infoRow} style={{ borderBottom: 'none' }}>
                <span className={styles.infoLabel}></span>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="newsletter_subscribed" checked={formData.newsletter_subscribed === 1} onChange={handleCheckboxChange} />
                  Nhận thông báo ưu đãi và sách mới qua email
                </label>
              </div>
            )}

            <div className={styles.actionRow}>
              {isEditing ? (
                <>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button className="btn" onClick={() => {
                    setIsEditing(false);
                    setAvatarBase64(user.avatar);
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                      birthday: user.birthday || '',
                      gender: user.gender || 'Khác',
                      newsletter_subscribed: user.newsletter_subscribed !== undefined ? user.newsletter_subscribed : 1
                    });
                  }} style={{ border: '1px solid var(--border-color)', marginLeft: '10px' }}>
                    Hủy
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Thay đổi thông tin</button>
              )}
            </div>
            
            {!isEditing && (
              <div className={styles.socialLinksSection}>
                <h3>Liên kết mạng xã hội</h3>
                <p className={styles.socialDesc}>Liên kết tài khoản của bạn với các mạng xã hội để đăng nhập dễ dàng hơn.</p>
                <div className={styles.socialButtons}>
                  <button 
                    className={`${styles.socialBtn} ${styles.googleBtn}`}
                    onClick={() => window.open('https://accounts.google.com/signin', '_blank')}
                  >
                    <i className="fa-brands fa-google"></i> Liên kết Google
                  </button>
                  <button 
                    className={`${styles.socialBtn} ${styles.facebookBtn}`}
                    onClick={() => window.open('https://www.facebook.com/login', '_blank')}
                  >
                    <i className="fa-brands fa-facebook-f"></i> Liên kết Facebook
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
