import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../services/api';
import AccountSidebar from '../components/AccountSidebar';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import styles from './Orders.module.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

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

  const handleCancelOrder = (id) => {
    setOrderToCancel(id);
    setIsCancelModalOpen(true);
  };

  const executeCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await ordersAPI.cancelOrder(orderToCancel);
      const res = await ordersAPI.getOrders();
      setOrders(res.orders || []);
      toast.success('Hủy đơn hàng thành công!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi hủy đơn hàng');
    } finally {
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch(s) {
      case 'pending':
        return <span className={`${styles.statusBadge} ${styles.pending}`}>Chờ xác nhận</span>;
      case 'processing':
        return <span className={`${styles.statusBadge} ${styles.pending}`}>Đang xử lý</span>;
      case 'shipped':
        return <span className={`${styles.statusBadge} ${styles.shipped}`}>Đang giao hàng</span>;
      case 'completed':
        return <span className={`${styles.statusBadge} ${styles.completed}`}>Đã giao</span>;
      case 'cancelled':
        return <span className={`${styles.statusBadge} ${styles.cancelled}`}>Đã hủy</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'processing', label: 'Đang xử lý' },
    { id: 'shipped', label: 'Đang giao' },
    { id: 'completed', label: 'Đã giao' },
    { id: 'cancelled', label: 'Đã hủy' }
  ];

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => (o.status || 'pending').toLowerCase() === activeTab);

  return (
    <div className={`container ${styles.accountLayout}`}>
      <aside className={styles.sidebarCol}>
        <AccountSidebar />
      </aside>
      
      <main className={styles.mainCol}>
        <div className={styles.ordersContainer}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Quản lý đơn hàng</h1>
            <p className={styles.cardSubtitle}>Theo dõi và quản lý các đơn hàng bạn đã mua</p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.tabsContainer}>
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading-placeholder"><p>Đang tải đơn hàng...</p></div>
            ) : filteredOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-box-open" style={{fontSize: '3rem', color: 'var(--border-color)', marginBottom: '15px'}}></i>
                <p>Không có đơn hàng nào.</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>Mã ĐH: #{order.order_code || order.id}</span>
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

                  <div className={styles.orderFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <p style={{ margin: '0 0 5px 0' }}>Phương thức: <strong>{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.payment_method}</strong></p>
                      <p style={{ margin: 0 }}>Phí vận chuyển: <strong>{order.shipping_cost === 0 ? 'Miễn phí' : formatPrice(order.shipping_cost)}</strong></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <span className={styles.totalLabel}>Tổng cộng: </span>
                        <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                      </div>
                      {order.status === 'pending' && (
                        <button 
                          className="btn" 
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 15px', fontSize: '0.9rem' }}
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."
        confirmText="Hủy đơn hàng"
        cancelText="Đóng"
        onConfirm={executeCancelOrder}
        onCancel={() => { setIsCancelModalOpen(false); setOrderToCancel(null); }}
      />
    </div>
  );
};

export default Orders;
