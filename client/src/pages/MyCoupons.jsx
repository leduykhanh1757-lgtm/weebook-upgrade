import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { marketingAPI } from '../services/api';
import AccountSidebar from '../components/AccountSidebar';
import { toast } from 'react-hot-toast';
import styles from './MyCoupons.module.css';

const MyCoupons = () => {
  const { user } = useSelector(state => state.auth);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      marketingAPI.getActiveCoupons(user.email)
        .then(res => setCoupons(res))
        .catch(() => toast.error('Lỗi tải danh sách voucher'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã: ' + code);
  };

  if (!user) {
    return <div className="container loading-placeholder"><p>Vui lòng đăng nhập để xem kho voucher.</p></div>;
  }

  return (
    <div className={`container ${styles.accountLayout}`}>
      <aside className={styles.sidebarCol}>
        <AccountSidebar />
      </aside>
      
      <main className={styles.mainCol}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Kho Voucher của tôi</h1>
            <p className={styles.cardSubtitle}>Quản lý các mã giảm giá và ưu đãi dành riêng cho bạn</p>
          </div>
          
          <div className={styles.cardBody}>
            {loading ? (
              <div className={styles.loading}>Đang tải voucher...</div>
            ) : coupons.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-ticket-simple"></i>
                <p>Bạn chưa có mã giảm giá nào.</p>
                <span>Hãy mua sắm thêm để tích lũy mã ưu đãi nhé!</span>
              </div>
            ) : (
              <div className={styles.couponGrid}>
                {coupons.map((c, idx) => {
                  const isPersonal = c.user_email === user.email;
                  return (
                    <div key={idx} className={`${styles.couponCard} ${isPersonal ? styles.personalCard : ''}`}>
                      <div className={styles.couponLeft}>
                        <div className={styles.discountValue}>
                          {c.discount_type === 'percent' 
                            ? `${c.discount_value}%` 
                            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.discount_value)}
                        </div>
                        <div className={styles.couponBadge}>
                          {isPersonal ? 'Mã Độc Quyền' : 'Mã Khuyến Mãi'}
                        </div>
                      </div>
                      <div className={styles.couponRight}>
                        <div className={styles.couponHeader}>
                          <span className={styles.codeText}>{c.code}</span>
                          <button className={styles.copyBtn} onClick={() => handleCopy(c.code)}>
                            Sao chép
                          </button>
                        </div>
                        <div className={styles.couponDetails}>
                          <p>Đơn tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.min_order_value)}</p>
                          <p className={styles.expiry}>
                            HSD: {c.end_date ? new Date(c.end_date).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyCoupons;
