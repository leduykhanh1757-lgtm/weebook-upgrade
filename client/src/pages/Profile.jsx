import React from 'react';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector(state => state.auth);

  if (!user) {
    return <div className="container"><p>Vui lòng đăng nhập để xem hồ sơ.</p></div>;
  }

  return (
    <div className="container profile-page">
      <h1>Hồ sơ của tôi</h1>
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <p><strong>Họ tên:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa cập nhật'}</p>
        <p><strong>Địa chỉ:</strong> {user.address || 'Chưa cập nhật'}</p>
      </div>
    </div>
  );
};

export default Profile;
