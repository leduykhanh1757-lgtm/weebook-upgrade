import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('settings');

  // General Settings State
  const [settings, setSettings] = useState({
    store_email: '', store_phone: '', store_address: '', shipping_fee: ''
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Staff State
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '', email: '', phone: '', role: 'customer_service', status: 'active', password: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });

  useEffect(() => {
    if (activeTab === 'settings') fetchSettings();
    else fetchStaff();
  }, [activeTab]);

  // --- Logic General Settings ---
  const fetchSettings = async () => {
    if (!settings.store_email) setLoadingSettings(true);
    try {
      const data = await adminAPI.getSettings();
      if (data) {
        setSettings({
          store_email: data.store_email || '',
          store_phone: data.store_phone || '',
          store_address: data.store_address || '',
          shipping_fee: data.shipping_fee || ''
        });
      }
    } catch (err) {
      toast.error('Lỗi tải cấu hình');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Lưu cấu hình thành công');
    } catch (err) {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Logic Staff ---
  const fetchStaff = async () => {
    if (staff.length === 0) setLoadingStaff(true);
    try {
      const data = await adminAPI.getStaff();
      setStaff(data);
    } catch (err) {
      toast.error('Lỗi tải danh sách nhân viên');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    try {
      if (editStaffId) {
        await adminAPI.updateStaff(editStaffId, staffForm);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await adminAPI.addStaff(staffForm);
        toast.success('Thêm nhân viên thành công');
      }
      setShowStaffModal(false);
      setEditStaffId(null);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi xử lý nhân viên');
    }
  };

  const handleEditStaff = (member) => {
    setEditStaffId(member.id);
    setStaffForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      status: member.status,
      password: '' // Don't fill password on edit
    });
    setShowStaffModal(true);
  };

  const handleDeleteStaff = async () => {
    try {
      await adminAPI.deleteStaff(deleteConfirm.id);
      toast.success('Xóa nhân viên thành công');
      setDeleteConfirm({ show: false, id: null, name: '' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi xóa nhân viên');
    }
  };

  const roleNameMap = {
    admin: 'Super Admin',
    inventory_manager: 'Quản lý Kho',
    customer_service: 'CSKH / Sales'
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h1>Hệ thống & Cài đặt</h1>
      </div>

      <div className={styles.tabsContainer}>
        <button className={activeTab === 'settings' ? styles.tabBtnActive : styles.tabBtn} onClick={() => setActiveTab('settings')}>
          Cấu hình chung
        </button>
        <button className={activeTab === 'staff' ? styles.tabBtnActive : styles.tabBtn} onClick={() => setActiveTab('staff')}>
          Quản lý Nhân viên
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'settings' && (
          <div className={styles.settingsContainer} style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border-color)', maxWidth: '800px' }}>
            {loadingSettings ? <div className={styles.loading}>Đang tải...</div> : (
              <form onSubmit={handleSaveSettings}>
                <div className={styles.formGroup}>
                  <label>Email Hỗ trợ</label>
                  <input type="email" value={settings.store_email} onChange={(e) => setSettings({...settings, store_email: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Số điện thoại Hotline</label>
                  <input type="text" value={settings.store_phone} onChange={(e) => setSettings({...settings, store_phone: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Địa chỉ Cửa hàng</label>
                  <input type="text" value={settings.store_address} onChange={(e) => setSettings({...settings, store_address: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Phí vận chuyển mặc định (VNĐ)</label>
                  <input type="number" value={settings.shipping_fee} onChange={(e) => setSettings({...settings, shipping_fee: e.target.value})} />
                </div>
                <div style={{ marginTop: '30px' }}>
                  <button type="submit" className={styles.btnPrimary} disabled={savingSettings}>
                    {savingSettings ? 'Đang lưu...' : 'Lưu cấu hình'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'staff' && (
          <div>
            <div className={styles.toolbar} style={{ justifyContent: 'flex-end' }}>
              <button className={styles.btnPrimary} onClick={() => {
                setEditStaffId(null);
                setStaffForm({ name: '', email: '', phone: '', role: 'customer_service', status: 'active', password: '' });
                setShowStaffModal(true);
              }}>
                <i className="fa-solid fa-plus"></i> Thêm Nhân viên
              </button>
            </div>

            {loadingStaff ? <div className={styles.loading}>Đang tải...</div> : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Họ Tên</th>
                    <th>Email</th>
                    <th>Số ĐT</th>
                    <th>Chức vụ</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(member => (
                    <tr key={member.id}>
                      <td><strong>{member.name}</strong></td>
                      <td>{member.email}</td>
                      <td>{member.phone || 'N/A'}</td>
                      <td>
                        <span className={styles.badgeCategory}>{roleNameMap[member.role] || member.role}</span>
                      </td>
                      <td>
                        <span className={member.status === 'active' ? styles.badgeSuccess : styles.badgeDanger}>
                          {member.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className={styles.textSmall}>
                        {new Date(member.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={`${styles.btnAction} ${styles.editBtn}`} title="Cập nhật" onClick={() => handleEditStaff(member)}>
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button className={`${styles.btnAction} ${styles.btnDanger}`} title="Xóa" onClick={() => setDeleteConfirm({ show: true, id: member.id, name: member.name })}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && <tr><td colSpan="7" className={styles.textCenter}>Chưa có nhân viên nào</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Staff Modal */}
      {showStaffModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editStaffId ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên mới'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowStaffModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveStaff}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Họ Tên *</label>
                  <input type="text" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} required disabled={!!editStaffId} />
                  {editStaffId && <small style={{color: '#64748b'}}>Không thể sửa Email sau khi tạo</small>}
                </div>
                {!editStaffId && (
                  <div className={styles.formGroup}>
                    <label>Mật khẩu (Mặc định: 123456)</label>
                    <input type="text" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} placeholder="123456" />
                  </div>
                )}
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Số điện thoại</label>
                    <input type="text" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Chức vụ / Quyền hạn *</label>
                    <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} required>
                      <option value="customer_service">CSKH / Sales</option>
                      <option value="inventory_manager">Quản lý Kho</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>
                </div>
                {editStaffId && (
                  <div className={styles.formGroup}>
                    <label>Trạng thái</label>
                    <select value={staffForm.status} onChange={e => setStaffForm({...staffForm, status: e.target.value})}>
                      <option value="active">Hoạt động</option>
                      <option value="locked">Đã khóa</option>
                    </select>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button type="submit" className={styles.btnPrimary}>{editStaffId ? 'Cập nhật' : 'Thêm mới'}</button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowStaffModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal 
        isOpen={deleteConfirm.show}
        title="Xác nhận xóa nhân viên"
        message={`Bạn có chắc chắn muốn xóa nhân viên "${deleteConfirm.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteStaff}
        onCancel={() => setDeleteConfirm({ show: false, id: null, name: '' })}
      />
    </div>
  );
};

export default AdminSettings;
