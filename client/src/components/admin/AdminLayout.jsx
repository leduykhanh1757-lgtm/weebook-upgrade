import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import ConfirmModal from '../ConfirmModal';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <div className={styles.deniedWrapper}>
        <div className={styles.deniedBox}>
          <i className="fa-solid fa-lock" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '20px' }}></i>
          <h2>Quyền Truy Cập Bị Từ Chối</h2>
          <p>Khu vực này chỉ dành cho Quản trị viên (Admin).</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <i className="fa-solid fa-book-open"></i> BookSelf <span>Admin</span>
        </div>
        <nav className={styles.navMenu}>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <i className="fa-solid fa-chart-pie"></i> Tổng quan
          </NavLink>
          <NavLink to="/admin/catalog" className={({ isActive }) => window.location.pathname.includes('/admin/catalog') ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <i className="fa-solid fa-book"></i> Quản lý Kho sách
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <i className="fa-solid fa-box-open"></i> Quản lý Đơn hàng
          </NavLink>
          <NavLink to="/admin/customers" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <i className="fa-solid fa-users"></i> Quản lý Khách hàng
          </NavLink>
          <NavLink to="/admin/marketing" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <i className="fa-solid fa-bullhorn"></i> Marketing
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <i className="fa-solid fa-gear"></i> Hệ thống & Cài đặt
          </NavLink>
          <NavLink to="/" className={styles.navItem} style={{ marginTop: 'auto' }}>
            <i className="fa-solid fa-store"></i> Xem Website
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={styles.mainWrapper}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerTitle}>Hệ thống quản trị</div>
          <div className={styles.userMenu}>
            <div className={styles.userInfo}>
              <img src={user.avatar || 'https://ui-avatars.com/api/?name=Admin'} alt="admin" className={styles.avatar} />
              <span>{user.name}</span>
            </div>
            <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Thoát
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Xác nhận thoát"
        message="Bạn có chắc chắn muốn thoát khỏi hệ thống quản trị?"
        confirmText="Thoát"
        cancelText="Hủy"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default AdminLayout;
