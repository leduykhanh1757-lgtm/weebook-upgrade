import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../services/api';
import AccountSidebar from '../components/AccountSidebar';
import styles from './Orders.module.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersAPI.getOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return <span className={`${styles.statusBadge} ${styles.pending}`}>Đang chờ duyệt</span>;
      case 'shipped':
        return <span className={`${styles.statusBadge} ${styles.shipped}`}>Đang giao hàng</span>;
      case 'completed':
        return <span className={`${styles.statusBadge} ${styles.completed}`}>Đã nhận hàng</span>;
      case 'cancelled':
        return <span className={`${styles.statusBadge} ${styles.cancelled}`}>Đã hủy</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  return (
    <div className={`container ${styles.accountLayout}`}>
      <aside className={styles.sidebarCol}>
        <AccountSidebar />
      </aside>
      
      <main className={styles.mainCol}>
        <div className={styles.ordersContainer}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Lịch sử đơn hàng</h1>
            <p className={styles.cardSubtitle}>Quản lý các đơn hàng bạn đã mua</p>
          </div>

          <div className={styles.cardBody}>
            {loading ? (
              <div className="loading-placeholder"><p>Đang tải đơn hàng...</p></div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-box-open" style={{fontSize: '3rem', color: 'var(--border-color)', marginBottom: '15px'}}></i>
                <p>Bạn chưa có đơn hàng nào.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>Mã ĐH: #{order.id}</span>
                      <span className={styles.orderDate}>Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {getStatusBadge(order.status || 'pending')}
                  </div>
                  
                  <div className={styles.orderItems}>
                    {order.items?.map(item => (
                      <div key={item.book_id} className={styles.orderItem}>
                        <div className={styles.itemImage}>
                          <img src={item.image || '/src/assets/images/placeholder.jpg'} alt={item.title} />
                        </div>
                        <div className={styles.itemDetails}>
                          <h4 className={styles.itemTitle}>{item.title}</h4>
                          <p className={styles.itemAuthor}>{item.author}</p>
                          <p className={styles.itemQuantity}>x{item.quantity}</p>
                        </div>
                        <div className={styles.itemPrice}>
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderFooter}>
                    <span className={styles.totalLabel}>Thành tiền:</span>
                    <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Orders;
