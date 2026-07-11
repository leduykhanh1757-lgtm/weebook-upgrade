import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('code') || searchParams.get('id');

  return (
    <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1 style={{ color: '#38a169', fontSize: '32px' }}>Đặt hàng thành công!</h1>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>Cảm ơn bạn đã mua sắm tại BookSelf.</p>
      {orderCode && <p>Mã đơn hàng của bạn là: <strong>#{orderCode}</strong></p>}
      <div style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link to="/orders" className="btn btn-primary">Xem đơn hàng</Link>
        <Link to="/" className="btn" style={{ background: '#e2e8f0' }}>Về trang chủ</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
