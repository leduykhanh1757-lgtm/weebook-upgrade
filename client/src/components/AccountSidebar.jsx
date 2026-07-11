import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import styles from './AccountSidebar.module.css';

const AccountSidebar = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className={styles.userDetails}>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.userRole}>{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</p>
        </div>
      </div>

      <nav className={styles.navMenu}>
        <div className={styles.navGroup}>
          <h4 className={styles.groupTitle}>Tài khoản của tôi</h4>
          <NavLink 
            to="/profile" 
            end
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <i className="fa-regular fa-user"></i> Hồ sơ cá nhân
          </NavLink>
          <NavLink 
            to="/profile/address" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <i className="fa-solid fa-location-dot"></i> Sổ địa chỉ
          </NavLink>
          <NavLink 
            to="/profile/password" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <i className="fa-solid fa-lock"></i> Đổi mật khẩu
          </NavLink>
        </div>

        <div className={styles.navGroup}>
          <h4 className={styles.groupTitle}>Quản lý đơn hàng</h4>
          <NavLink 
            to="/orders" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <i className="fa-solid fa-clipboard-list"></i> Đơn mua
          </NavLink>
        </div>

        <div className={styles.navGroup}>
          <h4 className={styles.groupTitle}>Sản phẩm quan tâm</h4>
          <NavLink 
            to="/wishlist" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <i className="fa-solid fa-heart"></i> Danh sách yêu thích
          </NavLink>
        </div>

        <div className={styles.navGroup}>
          <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutBtn}`}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AccountSidebar;
