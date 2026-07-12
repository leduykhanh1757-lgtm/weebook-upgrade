import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await adminAPI.getOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    try {
      await adminAPI.updateOrderStatus(id, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Lỗi cập nhật', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Quản lý Đơn hàng</h1>
      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td><strong>{order.order_code}</strong></td>
                <td>
                  <div>{order.full_name}</div>
                  <div className={styles.textSmall}>{order.phone}</div>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</td>
                <td>{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</td>
                <td>
                  <select 
                    className={styles.statusSelect}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                  >
                    <option value="Chờ xác nhận">Chờ xác nhận</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan="6" className={styles.textCenter}>Chưa có đơn hàng nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
