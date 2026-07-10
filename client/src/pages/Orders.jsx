import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../services/api';

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

  return (
    <div className="container orders-page-container">
      <h1 className="orders-page-title">Đơn hàng của tôi</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="order-card" style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
            <h3>Đơn hàng #{order.id} - {new Date(order.created_at).toLocaleDateString()}</h3>
            <p>Trạng thái: <strong>{order.status}</strong></p>
            <div>
              {order.items?.map(item => (
                <p key={item.book_id}>{item.title} x {item.quantity} - {formatPrice(item.price)}</p>
              ))}
            </div>
            <h4>Tổng: {formatPrice(order.total)}</h4>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
