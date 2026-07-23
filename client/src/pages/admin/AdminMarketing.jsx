import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminMarketing = () => {
  const [activeTab, setActiveTab] = useState('coupons');

  // States cho Coupons
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editCouponId, setEditCouponId] = useState(null);
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'fixed', discount_value: '', min_order_value: '0', max_uses: '', start_date: '', end_date: '', user_email: '' });

  // States cho Banners
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    image_url: '', title: '', description: '', link_url: '', is_active: 1, sort_order: 0
  });

  // States cho Xóa
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: null, name: '' });

  useEffect(() => {
    if (activeTab === 'coupons') fetchCoupons();
    else fetchBanners();
  }, [activeTab]);

  // --- Logic Coupons ---
  const fetchCoupons = async () => {
    if (coupons.length === 0) setLoadingCoupons(true);
    try {
      const data = await adminAPI.getCoupons();
      setCoupons(data);
    } catch (err) {
      toast.error('Lỗi tải danh sách mã giảm giá');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      if (!couponForm.code || !couponForm.discount_value) {
        return toast.error('Vui lòng nhập mã và giá trị giảm');
      }
      const payload = {
        ...couponForm,
        discount_value: Number(couponForm.discount_value),
        min_order_value: Number(couponForm.min_order_value),
        max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null
      };

      if (editCouponId) {
        await adminAPI.updateCoupon(editCouponId, payload);
        toast.success('Cập nhật mã giảm giá thành công');
      } else {
        await adminAPI.createCoupon(payload);
        toast.success('Thêm mã giảm giá thành công');
      }

      setShowCouponModal(false);
      setEditCouponId(null);
      fetchCoupons();
      setCouponForm({ code: '', discount_type: 'fixed', discount_value: '', min_order_value: '0', max_uses: '', start_date: '', end_date: '', user_email: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi xử lý mã giảm giá');
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditCouponId(coupon.id);
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value || '0',
      max_uses: coupon.max_uses || '',
      start_date: coupon.start_date || '',
      end_date: coupon.end_date || '',
      user_email: coupon.user_email || ''
    });
    setShowCouponModal(true);
  };

  const toggleCouponStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      await adminAPI.updateCouponStatus(id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchCoupons();
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  // --- Logic Banners ---
  const fetchBanners = async () => {
    if (banners.length === 0) setLoadingBanners(true);
    try {
      const data = await adminAPI.getBanners();
      setBanners(data);
    } catch (err) {
      toast.error('Lỗi tải danh sách Banners');
    } finally {
      setLoadingBanners(false);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      if (!bannerForm.image_url) {
        return toast.error('Vui lòng nhập Link hình ảnh (URL)');
      }
      await adminAPI.createBanner(bannerForm);
      toast.success('Thêm Banner thành công');
      setShowBannerModal(false);
      fetchBanners();
      setBannerForm({ image_url: '', title: '', description: '', link_url: '', is_active: 1, sort_order: 0 });
    } catch (err) {
      toast.error('Lỗi thêm banner');
    }
  };

  const toggleBannerStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await adminAPI.updateBannerStatus(id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchBanners();
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  // --- Xóa chung ---
  const handleDelete = async () => {
    try {
      if (deleteConfirm.type === 'coupon') {
        await adminAPI.deleteCoupon(deleteConfirm.id);
        toast.success('Xóa mã giảm giá thành công');
        fetchCoupons();
      } else {
        await adminAPI.deleteBanner(deleteConfirm.id);
        toast.success('Xóa banner thành công');
        fetchBanners();
      }
    } catch (err) {
      toast.error('Lỗi xóa dữ liệu');
    } finally {
      setDeleteConfirm({ show: false, type: '', id: null, name: '' });
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Marketing & Khuyến mãi</h1>

      <div className={styles.tabsContainer}>
        <button className={activeTab === 'coupons' ? styles.tabBtnActive : styles.tabBtn} onClick={() => setActiveTab('coupons')}>
          Mã giảm giá (Coupons)
        </button>
        <button className={activeTab === 'banners' ? styles.tabBtnActive : styles.tabBtn} onClick={() => setActiveTab('banners')}>
          Banners Quảng cáo
        </button>
      </div>

      <div className={styles.panel}>
        {activeTab === 'coupons' && (
          <div>
            <div className={styles.toolbar} style={{ justifyContent: 'flex-end' }}>
              <button className={styles.btnPrimary} onClick={() => {
                setEditCouponId(null);
                setCouponForm({ code: '', discount_type: 'fixed', discount_value: '', min_order_value: '0', max_uses: '', start_date: '', end_date: '' });
                setShowCouponModal(true);
              }}>
                <i className="fa-solid fa-plus"></i> Tạo mã giảm giá mới
              </button>
            </div>

            {loadingCoupons ? <div className={styles.loading}>Đang tải...</div> : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã (Code)</th>
                    <th>Giảm giá</th>
                    <th>Đơn tối thiểu</th>
                    <th>Đã dùng / Tối đa</th>
                    <th>Thời gian</th>
                    <th>Chủ sở hữu</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.code}</strong></td>
                      <td>
                        {c.discount_type === 'percent'
                          ? <span className={styles.badgeSuccess}>- {c.discount_value}%</span>
                          : <span className={styles.badgeNeutral}>- {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.discount_value)}</span>
                        }
                      </td>
                      <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.min_order_value)}</td>
                      <td>{c.used_count} / {c.max_uses === null ? '∞' : c.max_uses}</td>
                      <td className={styles.textSmall}>
                        {c.start_date ? new Date(c.start_date).toLocaleDateString('vi-VN') : 'Luôn'} - {c.end_date ? new Date(c.end_date).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                      </td>
                      <td>
                        {c.user_email ? (
                          <span className={styles.badgeNeutral} title="Mã sinh tự động cho cá nhân" style={{ background: '#fef3c7', color: '#d97706' }}>
                            {c.user_email}
                          </span>
                        ) : (
                          <span className={styles.badgeSuccess} title="Mã tạo thủ công dùng chung">
                            Đại trà
                          </span>
                        )}
                      </td>
                      <td>
                        <button className={c.status === 'active' ? styles.enableBtn : styles.disableBtn} onClick={() => toggleCouponStatus(c.id, c.status)}>
                          {c.status === 'active' ? 'Hoạt động' : 'Đã tắt'}
                        </button>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={`${styles.btnAction} ${styles.editBtn}`} title="Cập nhật" onClick={() => handleEditCoupon(c)}>
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button className={`${styles.btnAction} ${styles.btnDanger}`} title="Xóa" onClick={() => setDeleteConfirm({ show: true, type: 'coupon', id: c.id, name: c.code })}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && <tr><td colSpan="8" className={styles.textCenter}>Chưa có mã giảm giá nào</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'banners' && (
          <div>
            <div className={styles.toolbar} style={{ justifyContent: 'flex-end' }}>
              <button className={styles.btnPrimary} onClick={() => setShowBannerModal(true)}>
                <i className="fa-solid fa-plus"></i> Thêm Banner mới
              </button>
            </div>

            {loadingBanners ? <div className={styles.loading}>Đang tải...</div> : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tiêu đề / Mô tả</th>
                    <th>Liên kết (Link)</th>
                    <th>Thứ tự</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map(b => (
                    <tr key={b.id}>
                      <td>
                        <img src={b.image_url} alt="banner" style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                      </td>
                      <td>
                        <strong>{b.title || 'Không có tiêu đề'}</strong>
                        <div className={styles.textSmall}>{b.description}</div>
                      </td>
                      <td>
                        {b.link_url ? <a href={b.link_url} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>Xem link</a> : 'Không'}
                      </td>
                      <td>{b.sort_order}</td>
                      <td>
                        <button className={b.is_active === 1 ? styles.enableBtn : styles.disableBtn} onClick={() => toggleBannerStatus(b.id, b.is_active)}>
                          {b.is_active === 1 ? 'Hiển thị' : 'Đã ẩn'}
                        </button>
                      </td>
                      <td>
                        <button className={`${styles.btnAction} ${styles.btnDanger}`} onClick={() => setDeleteConfirm({ show: true, type: 'banner', id: b.id, name: 'Banner này' })}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {banners.length === 0 && <tr><td colSpan="6" className={styles.textCenter}>Chưa có Banner nào</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal Thêm Coupon */}
      {showCouponModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editCouponId ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowCouponModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveCoupon}>
              <div className={styles.modalBody}>
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Mã (Code) *</label>
                    <input type="text" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="VD: SUMMER50" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email chủ sở hữu (Để trống nếu Mã đại trà)</label>
                    <input type="email" value={couponForm.user_email} onChange={e => setCouponForm({ ...couponForm, user_email: e.target.value })} placeholder="VD: khachhang@gmail.com" />
                  </div>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Loại giảm giá</label>
                    <select value={couponForm.discount_type} onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })}>
                      <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                      <option value="percent">Giảm theo %</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Giá trị giảm *</label>
                    <input type="number" min="1" value={couponForm.discount_value} onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })} placeholder="VD: 50000 hoặc 10" required />
                  </div>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Đơn tối thiểu (VNĐ)</label>
                    <input type="number" min="0" value={couponForm.min_order_value} onChange={e => setCouponForm({ ...couponForm, min_order_value: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Lượt dùng tối đa</label>
                    <input type="number" min="1" value={couponForm.max_uses} onChange={e => setCouponForm({ ...couponForm, max_uses: e.target.value })} placeholder="Để trống nếu không giới hạn" />
                  </div>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Ngày bắt đầu</label>
                    <input type="date" value={couponForm.start_date} onChange={e => setCouponForm({ ...couponForm, start_date: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày kết thúc</label>
                    <input type="date" value={couponForm.end_date} onChange={e => setCouponForm({ ...couponForm, end_date: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="submit" className={styles.btnPrimary}>{editCouponId ? 'Cập nhật' : 'Tạo mã'}</button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowCouponModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Banner */}
      {showBannerModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Thêm Banner mới</h2>
              <button className={styles.closeBtn} onClick={() => setShowBannerModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveBanner}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>URL Hình ảnh *</label>
                  <input type="text" value={bannerForm.image_url} onChange={e => setBannerForm({ ...bannerForm, image_url: e.target.value })} placeholder="VD: https://link-to-image.jpg" required />
                  {bannerForm.image_url && <img src={bannerForm.image_url} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} onLoad={(e) => e.target.style.display = 'block'} />}
                </div>
                <div className={styles.formGroup}>
                  <label>Tiêu đề (Tùy chọn)</label>
                  <input type="text" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Liên kết khi click (Tùy chọn)</label>
                  <input type="text" value={bannerForm.link_url} onChange={e => setBannerForm({ ...bannerForm, link_url: e.target.value })} placeholder="/category?category=foreign" />
                </div>
                <div className={styles.formGroup}>
                  <label>Thứ tự hiển thị (0 là đầu tiên)</label>
                  <input type="number" min="0" value={bannerForm.sort_order} onChange={e => setBannerForm({ ...bannerForm, sort_order: e.target.value })} />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="submit" className={styles.btnPrimary}>Lưu Banner</button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowBannerModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title={`Xóa ${deleteConfirm.type === 'coupon' ? 'mã giảm giá' : 'banner'}`}
        message={`Bạn có chắc chắn muốn xóa ${deleteConfirm.name}? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, type: '', id: null, name: '' })}
      />
    </div>
  );
};

export default AdminMarketing;
