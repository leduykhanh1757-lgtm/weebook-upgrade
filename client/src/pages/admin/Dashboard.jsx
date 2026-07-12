import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminAPI.getDashboard();
        setData(res);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  if (!data) return <div className={styles.error}>Không thể tải dữ liệu</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Tổng quan</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <i className="fa-solid fa-dollar-sign"></i>
          </div>
          <div className={styles.statInfo}>
            <p>Doanh thu</p>
            <h3>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.revenue)}</h3>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <i className="fa-solid fa-shopping-bag"></i>
          </div>
          <div className={styles.statInfo}>
            <p>Tổng đơn hàng</p>
            <h3>{data.orders.total}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className={styles.statInfo}>
            <p>Chờ xác nhận</p>
            <h3>{data.orders.pending}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className={styles.statInfo}>
            <p>Khách hàng</p>
            <h3>{data.users}</h3>
          </div>
        </div>
      </div>

      <div className={styles.dashboardLayout}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Sách bán chạy nhất</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng đã bán</th>
              </tr>
            </thead>
            <tbody>
              {data.bestsellers.map(book => {
                const images = book.images ? JSON.parse(book.images) : [];
                return (
                  <tr key={book.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img src={images[0] || 'https://via.placeholder.com/50'} alt={book.title} />
                        <span>{book.title}</span>
                      </div>
                    </td>
                    <td><span className={styles.badgeSuccess}>{book.sold_count}</span></td>
                  </tr>
                );
              })}
              {data.bestsellers.length === 0 && (
                <tr><td colSpan="2" className={styles.textCenter}>Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Sách sắp hết hàng</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockBooks.map(book => {
                const images = book.images ? JSON.parse(book.images) : [];
                return (
                  <tr key={book.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img src={images[0] || 'https://via.placeholder.com/50'} alt={book.title} />
                        <span>{book.title}</span>
                      </div>
                    </td>
                    <td><span className={styles.badgeDanger}>{book.stock}</span></td>
                  </tr>
                );
              })}
              {data.lowStockBooks.length === 0 && (
                <tr><td colSpan="2" className={styles.textCenter}>Kho đang đầy đủ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
