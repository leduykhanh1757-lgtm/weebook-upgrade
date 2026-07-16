import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Detail
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Status Change
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState({ id: null, status: '', name: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Lỗi lấy danh sách khách hàng:', error);
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (id) => {
    try {
      setShowModal(true);
      setModalLoading(true);
      const data = await adminAPI.getUserDetails(id);
      setSelectedUser(data);
    } catch (error) {
      console.error('Lỗi lấy chi tiết khách hàng:', error);
      toast.error('Không thể tải chi tiết khách hàng');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const requestStatusChange = (user, newStatus) => {
    setPendingStatusChange({ id: user.id, status: newStatus, name: user.name });
    setShowConfirm(true);
  };

  const confirmStatusChange = async () => {
    try {
      await adminAPI.updateUserStatus(pendingStatusChange.id, pendingStatusChange.status);
      toast.success(`Đã ${pendingStatusChange.status === 'banned' ? 'khóa' : 'mở khóa'} tài khoản thành công!`);
      fetchUsers();
      if (selectedUser && selectedUser.user.id === pendingStatusChange.id) {
          setSelectedUser(prev => ({...prev, user: {...prev.user, status: pendingStatusChange.status}}));
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      toast.error('Không thể cập nhật trạng thái tài khoản');
    } finally {
      setShowConfirm(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    return (u.name || '').toLowerCase().includes(search) || 
           (u.email || '').toLowerCase().includes(search) ||
           (u.phone || '').includes(search);
  });

  if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Quản lý Khách hàng</h1>
      
      <div className={styles.toolbar}>
        <input 
          type="text" 
          placeholder="Tìm theo Tên, Email hoặc Số điện thoại..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Liên hệ</th>
              <th>Ngày tham gia</th>
              <th>Đơn hàng</th>
              <th>Tổng chi tiêu (LTV)</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <strong>{user.name}</strong>
                  {user.role === 'admin' && (
                    <span className={styles.badgeSuccess} style={{ marginLeft: '8px', fontSize: '0.7rem' }}>
                      <i className="fa-solid fa-crown"></i> Admin
                    </span>
                  )}
                </td>
                <td>
                  <div>{user.email}</div>
                  <div className={styles.textSmall}>{user.phone || 'Chưa cập nhật'}</div>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                <td><span className={styles.badgeNeutral}>{user.total_orders} đơn</span></td>
                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.ltv)}</td>
                <td>
                  <span className={user.status === 'banned' ? styles.badgeDanger : styles.badgeSuccess}>
                    {user.status === 'banned' ? 'Đã khóa' : 'Hoạt động'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={styles.btnAction} onClick={() => handleOpenDetails(user.id)} style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <i className="fa-solid fa-eye" style={{ color: '#0ea5e9' }}></i> Xem
                    </button>
                    {user.role !== 'admin' && (
                      user.status === 'banned' ? (
                         <button className={styles.btnAction} onClick={() => requestStatusChange(user, 'active')} style={{ padding: '6px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '6px' }}>
                           <i className="fa-solid fa-unlock"></i> Mở khóa
                         </button>
                      ) : (
                         <button className={styles.btnAction} onClick={() => requestStatusChange(user, 'banned')} style={{ padding: '6px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px' }}>
                           <i className="fa-solid fa-lock"></i> Khóa (Ban)
                         </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan="7" className={styles.textCenter}>Không tìm thấy khách hàng nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '900px' }}>
            <div className={styles.modalHeader}>
              <h2>Chi tiết Khách hàng</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>&times;</button>
            </div>
            
            {modalLoading ? (
               <div className={styles.modalBody}><div className={styles.loading}>Đang tải...</div></div>
            ) : selectedUser ? (
              <div className={styles.modalBody}>
                <div className={styles.grid2}>
                  {/* Left Column: User Info & Addresses */}
                  <div>
                    <div className={styles.infoCard}>
                      <h3 style={{marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10}}>Thông tin cơ bản</h3>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <span style={{color: '#64748b'}}>Họ và tên:</span>
                        <strong>{selectedUser.user.name}</strong>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <span style={{color: '#64748b'}}>Email:</span>
                        <span>{selectedUser.user.email}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <span style={{color: '#64748b'}}>Số điện thoại:</span>
                        <span>{selectedUser.user.phone || 'Chưa cập nhật'}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <span style={{color: '#64748b'}}>Ngày đăng ký:</span>
                        <span>{new Date(selectedUser.user.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <span style={{color: '#64748b'}}>Tổng chi tiêu:</span>
                        <strong style={{color: '#0ea5e9'}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedUser.user.ltv)}</strong>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#64748b'}}>Trạng thái:</span>
                        <span className={selectedUser.user.status === 'banned' ? styles.badgeDanger : styles.badgeSuccess}>
                          {selectedUser.user.status === 'banned' ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.infoCard} style={{marginTop: 20}}>
                      <h3 style={{marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10}}>Sổ địa chỉ ({selectedUser.addresses.length})</h3>
                      {selectedUser.addresses.length > 0 ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                          {selectedUser.addresses.map(addr => (
                            <div key={addr.id} style={{padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0'}}>
                              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 5}}>
                                <strong>{addr.receiver_name}</strong>
                                {addr.is_default === 1 && <span className={styles.badgeSuccess} style={{fontSize: '0.7rem'}}>Mặc định</span>}
                              </div>
                              <div className={styles.textSmall} style={{marginBottom: 3}}><i className="fa-solid fa-phone"></i> {addr.phone}</div>
                              <div className={styles.textSmall}><i className="fa-solid fa-location-dot"></i> {addr.full_address}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.textCenter} style={{color: '#94a3b8'}}>Khách hàng chưa lưu địa chỉ nào.</div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Order History */}
                  <div>
                    <div className={styles.infoCard} style={{height: '100%'}}>
                      <h3 style={{marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10}}>Lịch sử mua hàng ({selectedUser.orders.length})</h3>
                      {selectedUser.orders.length > 0 ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '500px', overflowY: 'auto', paddingRight: 5}}>
                          {selectedUser.orders.map(order => (
                            <div key={order.id} style={{padding: 12, background: 'white', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
                              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                                <strong>{order.order_code}</strong>
                                <span className={styles.textSmall}>{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                              </div>
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{fontWeight: 600, color: '#0f172a'}}>
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                                </span>
                                <span className={`${styles.statusBadge} ${styles['status_' + order.status.replace(/ /g, '')]}`}>
                                  {order.status === 'completed' ? 'Hoàn thành' : 
                                   order.status === 'pending' ? 'Chờ xác nhận' : 
                                   order.status === 'processing' ? 'Đang xử lý' : 
                                   order.status === 'cancelled' ? 'Đã hủy' : 
                                   order.status === 'shipped' ? 'Đang giao' : order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                         <div className={styles.textCenter} style={{color: '#94a3b8', padding: '20px 0'}}>Chưa có đơn hàng nào.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className={styles.modalFooter}>
              {selectedUser && (
                 selectedUser.user.status === 'banned' ? (
                   <button className={styles.btnPrimary} style={{background: '#16a34a'}} onClick={() => requestStatusChange(selectedUser.user, 'active')}>
                     <i className="fa-solid fa-unlock"></i> Mở khóa tài khoản
                   </button>
                 ) : (
                   <button className={styles.btnPrimary} style={{background: '#dc2626'}} onClick={() => requestStatusChange(selectedUser.user, 'banned')}>
                     <i className="fa-solid fa-lock"></i> Khóa tài khoản
                   </button>
                 )
              )}
              <button className={styles.btnSecondary} onClick={handleCloseModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showConfirm}
        title={pendingStatusChange.status === 'banned' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          message={pendingStatusChange.status === 'banned' 
            ? `Bạn có chắc chắn muốn KHÓA tài khoản của khách hàng "${pendingStatusChange.name}"? Người này sẽ không thể đăng nhập vào hệ thống nữa.`
            : `Bạn có chắc chắn muốn MỞ KHÓA tài khoản của khách hàng "${pendingStatusChange.name}"?`
          }
          onConfirm={confirmStatusChange}
          onCancel={() => setShowConfirm(false)}
        />
    </div>
  );
};

export default AdminCustomers;
