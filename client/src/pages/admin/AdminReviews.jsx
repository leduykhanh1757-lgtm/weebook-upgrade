import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await adminAPI.getReviews();
      setReviews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminAPI.updateReviewStatus(id, status);
      fetchReviews();
    } catch (error) {
      alert('Lỗi cập nhật');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quản lý Đánh giá</h1>
      </div>
      
      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Khách hàng</th>
              <th>Số sao</th>
              <th>Nội dung bình luận</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td><strong>{review.book_title}</strong></td>
                <td>{review.user_name || 'Người dùng ẩn danh'}</td>
                <td><span style={{ color: '#f59e0b' }}>{'★'.repeat(review.rating)}</span></td>
                <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={review.comment}>
                  {review.comment}
                </td>
                <td>
                  {review.status === 'pending' && <span className={styles.badgeCategory} style={{background: '#fef3c7', color: '#d97706'}}>Chờ duyệt</span>}
                  {review.status === 'approved' && <span className={styles.badgeSuccess}>Đã duyệt</span>}
                  {review.status === 'hidden' && <span className={styles.badgeDanger}>Đã ẩn</span>}
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    {review.status !== 'approved' && (
                      <button className={styles.enableBtn} onClick={() => handleStatusChange(review.id, 'approved')} title="Duyệt">
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                    {review.status !== 'hidden' && (
                      <button className={styles.disableBtn} onClick={() => handleStatusChange(review.id, 'hidden')} title="Ẩn">
                        <i className="fa-solid fa-eye-slash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan="6" className={styles.textCenter}>Chưa có đánh giá nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviews;
