import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('month'); // today, week, month, year

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

  if (loading) return <div className={styles.loading}>Đang tải dữ liệu báo cáo...</div>;
  if (!data) return <div className={styles.error}>Không thể tải dữ liệu</div>;

  const renderTrend = (growth) => {
    if (growth > 0) return <div className={styles.trendUp}><i className="fa-solid fa-arrow-up"></i> Tăng {growth}% so với kỳ trước</div>;
    if (growth < 0) return <div className={styles.trendDown}><i className="fa-solid fa-arrow-down"></i> Giảm {Math.abs(growth)}% so với kỳ trước</div>;
    return <div className={styles.trendNeutral}><i className="fa-solid fa-minus"></i> Không đổi so với kỳ trước</div>;
  };

  const currentRevenue = data.revenue[revenuePeriod];
  
  return (
    <div>
      <h1 className={styles.pageTitle}>Tổng quan (Báo cáo hoạt động)</h1>
      
      {/* 1. Doanh Thu Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 15, color: '#334155' }}>Thống kê Doanh thu</h2>
        <select 
          className={styles.revenueSelector}
          value={revenuePeriod} 
          onChange={(e) => setRevenuePeriod(e.target.value)}
        >
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="year">Năm nay</option>
        </select>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <i className="fa-solid fa-coins"></i>
          </div>
          <div className={styles.statInfo}>
            <p>Doanh thu ({revenuePeriod === 'today' ? 'Hôm nay' : revenuePeriod === 'week' ? 'Tuần này' : revenuePeriod === 'month' ? 'Tháng này' : 'Năm nay'})</p>
            <h3>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentRevenue.value)}</h3>
            {renderTrend(currentRevenue.growth)}
          </div>
        </div>
        
        {/* 2. Đơn hàng Section (3 stats + 1 User) */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="fa-solid fa-box-open"></i>
          </div>
          <div className={styles.statInfo}>
            <p>Đơn mới (Chờ xác nhận)</p>
            <h3>{data.orders.pending}</h3>
            <div className={styles.textSmall} style={{color: '#64748b'}}>Đang xử lý: {data.orders.processing} đơn</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <i className="fa-solid fa-truck-fast"></i>
          </div>
          <div className={styles.statInfo}>
            <p>Đã giao thành công</p>
            <h3>{data.orders.completed}</h3>
            <div className={styles.textSmall} style={{color: '#64748b'}}>Tổng số đơn: {data.orders.total}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
            <i className="fa-solid fa-ban"></i>
          </div>
          <div className={styles.statInfo}>
            <p>Đơn bị hủy</p>
            <h3>{data.orders.canceled}</h3>
            <div className={styles.textSmall} style={{color: '#dc2626'}}>Tỷ lệ hủy: {data.orders.cancelRate}%</div>
          </div>
        </div>
      </div>

      {/* 3. Grid 2 Columns: Bestsellers & Alerts */}
      <div className={styles.dashboardGrid}>
        
        {/* Left Column: Bestsellers */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Top 5 Sách Bán Chạy (Tháng này)</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th style={{textAlign: 'center'}}>Đã bán</th>
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
                        <span style={{fontWeight: 500, color: '#334155'}}>{book.title}</span>
                      </div>
                    </td>
                    <td style={{textAlign: 'center'}}><span className={styles.badgeSuccess} style={{fontSize: '1rem'}}>{book.sold_count}</span></td>
                  </tr>
                );
              })}
              {data.bestsellers.length === 0 && (
                <tr><td colSpan="2" className={styles.textCenter}>Chưa có đơn hàng nào hoàn thành trong tháng</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Column: Alerts */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Cảnh báo Hệ thống</h3>
          
          {/* Stagnant Orders Alert */}
          {data.alerts.stagnantOrders.length > 0 ? (
            <div className={styles.alertBox}>
              <div className={styles.alertTitle}>
                <i className="fa-solid fa-triangle-exclamation"></i> Đơn hàng tồn đọng quá lâu (&gt; 3 ngày)
              </div>
              {data.alerts.stagnantOrders.map(order => (
                <div key={order.id} className={styles.alertItem}>
                  <span><strong>{order.order_code}</strong> ({new Date(order.created_at).toLocaleDateString('vi-VN')})</span>
                  <span className={styles.badgeWarning}>{order.status === 'pending' ? 'Chờ xác nhận' : 'Đang xử lý'}</span>
                </div>
              ))}
            </div>
          ) : (
             <div className={`${styles.alertBox} ${styles.warning}`} style={{background: '#f0fdf4', border: '1px solid #bbf7d0'}}>
              <div className={styles.alertTitle} style={{color: '#16a34a'}}>
                <i className="fa-solid fa-check-circle"></i> Xử lý đơn hàng rất tốt!
              </div>
              <p style={{fontSize: '0.9rem', color: '#15803d', margin: 0}}>Không có đơn hàng nào tồn đọng quá 3 ngày.</p>
            </div>
          )}

          {/* Low Stock Alert */}
          {data.alerts.lowStock.length > 0 ? (
            <div className={`${styles.alertBox} ${styles.warning}`}>
              <div className={styles.alertTitle}>
                <i className="fa-solid fa-boxes-stacked"></i> Sách sắp hết hàng (Tồn kho &lt; 5)
              </div>
              {data.alerts.lowStock.map(book => {
                const images = book.images ? JSON.parse(book.images) : [];
                return (
                  <div key={book.id} className={styles.alertItem}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <img src={images[0] || 'https://via.placeholder.com/30'} style={{width: 30, height: 30, objectFit: 'cover', borderRadius: 4}} alt="" />
                      <span style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{book.title}</span>
                    </div>
                    <strong style={{color: '#b45309'}}>Còn {book.stock}</strong>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`${styles.alertBox} ${styles.warning}`} style={{background: '#f0fdf4', border: '1px solid #bbf7d0'}}>
              <div className={styles.alertTitle} style={{color: '#16a34a'}}>
                <i className="fa-solid fa-check-circle"></i> Tồn kho ổn định!
              </div>
              <p style={{fontSize: '0.9rem', color: '#15803d', margin: 0}}>Mọi đầu sách đều có lượng tồn kho an toàn.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
