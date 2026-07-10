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
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.userDetails}>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.userRole}>{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</p>
        </div>
      </div>

      <nav className={styles.navMenu}>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          <i className="fa-regular fa-user"></i> Hồ sơ của tôi
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          <i className="fa-solid fa-clipboard-list"></i> Đơn mua
        </NavLink>
        <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutBtn}`}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
        </button>
      </nav>
    </div>
  );
};

export default AccountSidebar;
