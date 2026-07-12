import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import styles from './PublicProfile.module.css';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

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

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Logic to call API to follow/unfollow user would go here
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fa-solid fa-star"></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star"></i>);
      }
    }
    return stars;
  };

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
            <div className={styles.profileNameRow}>
              <h1 className={styles.userName}>{userProfile.name}</h1>
              <button 
                className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <><i className="fa-solid fa-check"></i> Đang theo dõi</>
                ) : (
                  <><i className="fa-solid fa-plus"></i> Theo dõi</>
                )}
              </button>
            </div>
            <p className={styles.userRole}>{userProfile.member_rank || 'Thành viên Weebook'}</p>
          </div>
        </div>
        
        <div className={styles.profileDetails}>
          <h3>Thông tin cơ bản</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><i className="fa-regular fa-calendar-days"></i> Ngày tham gia</span>
              <span className={styles.detailValue}>{joinDate}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><i className="fa-solid fa-star"></i> Tổng số đánh giá</span>
              <span className={styles.detailValue}>{userProfile.review_count || 0}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><i className="fa-solid fa-heart"></i> Lượt hữu ích</span>
              <span className={styles.detailValue}>{userProfile.helpful_votes || 0}</span>
            </div>
            {userProfile.favorite_categories && userProfile.favorite_categories.length > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}><i className="fa-solid fa-tags"></i> Thể loại yêu thích</span>
                <span className={styles.detailValue}>
                  {userProfile.favorite_categories.map(cat => {
                    const categoryMap = {
                      vietnamese: 'Sách Tiếng Việt',
                      foreign: 'Sách Ngoại Văn',
                      manga: 'Manga/Comic',
                      comics: 'Truyện tranh',
                      children: 'Sách Thiếu Nhi',
                      stationery: 'Văn phòng phẩm',
                      'office-supplies': 'Văn phòng phẩm',
                      gifts: 'Quà lưu niệm',
                      stationeries: 'Văn phòng phẩm',
                      toys: 'Đồ chơi'
                    };
                    return categoryMap[cat] || cat;
                  }).join(', ')}
                </span>
              </div>
            )}
          </div>

          {userProfile.recent_reviews && userProfile.recent_reviews.length > 0 && (
            <div className={styles.recentReviewsSection}>
              <h3>Các đánh giá gần đây</h3>
              <div className={styles.reviewList}>
                {userProfile.recent_reviews.map(review => {
                  const bookImages = review.book_images ? JSON.parse(review.book_images) : [];
                  const coverImage = bookImages.length > 0 ? bookImages[0] : '/src/assets/images/placeholder.jpg';
                  return (
                    <div key={review.id} className={styles.reviewCard}>
                      <Link to={`/product/${review.book_id}`}>
                        <img src={coverImage} alt={review.book_title} className={styles.reviewBookImage} />
                      </Link>
                      <div className={styles.reviewContent}>
                        <Link to={`/product/${review.book_id}`} className={styles.reviewBookTitle}>
                          {review.book_title}
                        </Link>
                        <div className={styles.reviewStars}>
                          {renderStars(review.rating)}
                        </div>
                        <p className={styles.reviewText}>{review.comment}</p>
                        <span className={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
