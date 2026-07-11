import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import styles from './PublicProfile.module.css';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersAPI.getUserProfile(id);
        if (res.user) {
          setUserProfile(res.user);
        }
      } catch (err) {
        console.error('Failed to load user profile', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return <div className="container loading-placeholder"><p>Đang tải hồ sơ...</p></div>;
  }

  if (!userProfile) {
    return (
      <div className="container loading-placeholder">
        <h2>Không tìm thấy người dùng</h2>
        <p>Hồ sơ này không tồn tại hoặc đã bị xóa.</p>
        <button className="btn btn-primary" style={{marginTop: '20px'}} onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  const joinDate = new Date(userProfile.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`container ${styles.publicProfilePage}`}>
      <div className={styles.profileCard}>
        <div className={styles.coverPhoto}></div>
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarPlaceholder}>{userProfile.name.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.userName}>{userProfile.name}</h1>
            <p className={styles.userRole}>Thành viên Weebook</p>
          </div>
        </div>
        
        <div className={styles.profileDetails}>
          <h3>Thông tin cơ bản</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><i className="fa-solid fa-venus-mars"></i> Giới tính</span>
              <span className={styles.detailValue}>{userProfile.gender || 'Khác'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><i className="fa-regular fa-calendar-days"></i> Ngày tham gia</span>
              <span className={styles.detailValue}>{joinDate}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><i className="fa-solid fa-star"></i> Tổng số đánh giá</span>
              <span className={styles.detailValue}>{userProfile.review_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
