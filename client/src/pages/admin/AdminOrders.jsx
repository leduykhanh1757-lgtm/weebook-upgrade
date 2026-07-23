import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import styles from './AdminPages.module.css';
import toast from 'react-hot-toast';

const statusMap = {
  'pending': 'Chờ xác nhận',
  'processing': 'Đang xử lý',
  'shipped': 'Đang giao',
  'completed': 'Hoàn thành',
  'cancelled': 'Đã hủy'
};

const reverseStatusMap = {
  'Chờ xác nhận': 'pending',
  'Đang xử lý': 'processing',
  'Đang giao': 'shipped',
  'Hoàn thành': 'completed',
  'Đã hủy': 'cancelled'
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState({ id: null, status: '' });

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

  const handleOpenDetails = async (id) => {
    setShowModal(true);
    setModalLoading(true);
    try {
      const data = await adminAPI.getOrderDetails(id);
      setSelectedOrder(data.order);
      setOrderItems(data.items);
      setDraftStatus(statusMap[data.order.status] || data.order.status);
    } catch (error) {
      console.error('Error fetching order details', error);
      alert('Không thể lấy chi tiết đơn hàng');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = (id, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    setPendingStatusChange({ id, status: newStatus });
    setShowConfirm(true);
  };

  const executeStatusChange = async () => {
    const { id, status: newStatus } = pendingStatusChange;
    
    try {
      // Send English status to the backend
      const backendStatus = reverseStatusMap[newStatus] || newStatus;
      await adminAPI.updateOrderStatus(id, backendStatus);
      
      toast.success('Cập nhật trạng thái thành công!');
      fetchOrders();
      
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({...selectedOrder, status: backendStatus});
        setShowModal(false);
      }
    } catch (error) {
      console.error('Lỗi cập nhật', error);
      toast.error(error.response?.data?.error || 'Không thể cập nhật trạng thái');
    } finally {
      setShowConfirm(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = (o.order_code || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (o.phone || '').includes(searchTerm);
    const mappedStatus = statusMap[o.status] || o.status;
    const matchStatus = statusFilter ? mappedStatus === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div>
      <h1 className={`${styles.pageTitle} no-print`}>Quản lý Đơn hàng</h1>
      
      <div className={`${styles.toolbar} no-print`}>
        <input 
          type="text" 
          placeholder="Tìm theo Mã ĐH hoặc Số điện thoại..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Chờ xác nhận">Chờ xác nhận</option>
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Đang giao">Đang giao</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>

      <div className={`${styles.panel} no-print`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td><strong>{order.order_code}</strong></td>
                <td>
                  <div>{order.full_name}</div>
                  <div className={styles.textSmall}>{order.phone}</div>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles['status_' + (statusMap[order.status] || order.status || '').replace(/ /g, '')]}`}>
                    {statusMap[order.status] || order.status}
                  </span>
                </td>
                <td>
                  <button className={styles.btnAction} onClick={() => handleOpenDetails(order.id)}>
                    <i className="fa-solid fa-eye"></i> Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan="6" className={styles.textCenter}>Không tìm thấy đơn hàng nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={`${styles.modalOverlay} no-print-bg`}>
          <div className={`${styles.modalContent} ${styles.large} print-section`}>
            <div className={`${styles.modalHeader} no-print`}>
              <h2>Chi tiết Đơn hàng {selectedOrder?.order_code}</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            {modalLoading ? (
              <div style={{padding: 20}}>Đang tải chi tiết...</div>
            ) : selectedOrder && (
              <div className={styles.modalBody}>
                {/* Print Header - Only visible when printing */}
                <div className="print-only" style={{textAlign: 'center', marginBottom: 20, display: 'none'}}>
                  <h2>HÓA ĐƠN GIAO HÀNG</h2>
                  <p>BookSelf - Hệ thống Nhà sách Thông minh</p>
                  <p>Mã đơn: <strong>{selectedOrder.order_code}</strong> - Ngày đặt: {new Date(selectedOrder.created_at).toLocaleDateString('vi-VN')}</p>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.infoCard}>
                    <h3>Thông tin người nhận</h3>
                    <p><strong>Họ tên:</strong> {selectedOrder.full_name}</p>
                    <p><strong>Điện thoại:</strong> {selectedOrder.phone}</p>
                    <p><strong>Email:</strong> {selectedOrder.email || 'Không có'}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.address}, {selectedOrder.ward}, {selectedOrder.district}, {selectedOrder.city}</p>
                    <p><strong>Ghi chú:</strong> {selectedOrder.notes || 'Không có'}</p>
                  </div>
                  
                  <div className={styles.infoCard}>
                    <h3>Thông tin giao dịch</h3>
                    <p><strong>Phương thức:</strong> {selectedOrder.delivery_method === 'express' ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn'}</p>
                    <p><strong>Thanh toán:</strong> {selectedOrder.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</p>
                    <div className="no-print" style={{marginTop: 15, padding: 15, background: '#f8fafc', borderRadius: 8}}>
                      <strong style={{display: 'block', marginBottom: 10}}>Cập nhật trạng thái:</strong>
                      {(statusMap[selectedOrder.status] || selectedOrder.status) === 'Đã hủy' ? (
                        <span className={styles.badgeDanger} style={{padding: '8px 12px', fontSize: 14, display: 'inline-block'}}>
                          <i className="fa-solid fa-ban"></i> Đơn hàng đã hủy (Không thể sửa)
                        </span>
                      ) : (statusMap[selectedOrder.status] || selectedOrder.status) === 'Hoàn thành' ? (
                        <span className={styles.badgeSuccess} style={{padding: '8px 12px', fontSize: 14, display: 'inline-block', background: '#dcfce7', color: '#15803d', borderRadius: 20}}>
                          <i className="fa-solid fa-check-circle"></i> Đơn hàng đã hoàn thành (Không thể sửa)
                        </span>
                      ) : (
                        <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                          <select 
                            className={styles.statusSelectLarge}
                            style={{marginTop: 0, flex: 1}}
                            value={draftStatus}
                            onChange={(e) => setDraftStatus(e.target.value)}
                          >
                            <option value="Chờ xác nhận">Chờ xác nhận</option>
                            <option value="Đang xử lý">Đang xử lý</option>
                            <option value="Đang giao">Đang giao</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                            <option value="Đã hủy">Đã hủy</option>
                          </select>
                          <button 
                            className="btn btn-primary" 
                            style={{whiteSpace: 'nowrap'}}
                            onClick={() => handleStatusChange(selectedOrder.id, selectedOrder.status, draftStatus)}
                          >
                            Xác nhận
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <h3 style={{marginTop: 20}}>Danh sách sản phẩm</h3>
                
                {/* List replacing the old table */}
                <div style={{display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 20}}>
                  {orderItems.map(item => (
                    <div key={item.id} style={{display: 'flex', gap: 20, padding: 15, border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', alignItems: 'center'}}>
                      <img src={item.image || 'https://via.placeholder.com/50'} alt={item.title} style={{width: 80, height: 80, objectFit: 'contain', borderRadius: 6, background: 'white', border: '1px solid #e2e8f0'}} className="no-print" />
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 600, color: '#1e293b', fontSize: '1.05rem', marginBottom: 4}}>{item.title}</div>
                        <div style={{color: '#64748b', fontSize: '0.9rem'}}>{item.author}</div>
                        <div style={{color: '#64748b', fontSize: '0.9rem', marginTop: 4}}>Số lượng: x{item.quantity}</div>
                      </div>
                      <div style={{fontWeight: 600, color: '#e11d48', fontSize: '1.1rem'}}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{borderTop: '2px dashed #e2e8f0', paddingTop: 15, display: 'flex', justifyContent: 'flex-end'}}>
                  <table style={{width: '300px', textAlign: 'right'}}>
                    <tbody>
                      <tr>
                        <td style={{padding: '5px 0', color: '#64748b'}}>Tạm tính:</td>
                        <td style={{padding: '5px 0', fontWeight: 500}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.subtotal)}</td>
                      </tr>
                      <tr>
                        <td style={{padding: '5px 0', color: '#64748b'}}>Phí vận chuyển:</td>
                        <td style={{padding: '5px 0', fontWeight: 500}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.shipping_cost)}</td>
                      </tr>
                      {selectedOrder.discount_amount > 0 && (
                        <tr>
                          <td style={{padding: '5px 0', color: '#16a34a'}}>Giảm giá ({selectedOrder.coupon_code}):</td>
                          <td style={{padding: '5px 0', fontWeight: 500, color: '#16a34a'}}>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.discount_amount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={{padding: '10px 0', color: '#1e293b', fontWeight: 600, fontSize: '1.1rem'}}>Tổng cộng:</td>
                        <td style={{padding: '10px 0', color: '#e11d48', fontWeight: 'bold', fontSize: '1.25rem'}}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className={`${styles.modalFooter} no-print`} style={{marginTop: 30, display: 'flex', justifyContent: 'flex-end', gap: 10}}>
                  <button className="btn btn-outline" onClick={() => setShowModal(false)}>Đóng</button>
                  <button className="btn btn-primary" onClick={handlePrint}>
                    <i className="fa-solid fa-print"></i> In Hóa đơn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <ConfirmModal 
        isOpen={showConfirm}
        title="Xác nhận cập nhật trạng thái"
        message={`Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng thành "${pendingStatusChange.status}"?`}
        onConfirm={executeStatusChange}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default AdminOrders;
