import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AccountSidebar from '../components/AccountSidebar';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import styles from './AddressBook.module.css';

const AddressBook = () => {
  const { user } = useSelector(state => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [debouncedAddress, setDebouncedAddress] = useState('');
  const [formData, setFormData] = useState({
    receiver_name: '',
    phone: '',
    full_address: '',
    is_default: 0
  });

  const fetchAddresses = async () => {
    try {
      const data = await authAPI.getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Lỗi tải danh sách địa chỉ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedAddress(formData.full_address);
    }, 800);
    return () => clearTimeout(timerId);
  }, [formData.full_address]);

  if (!user) {
    return <div className="container loading-placeholder"><p>Vui lòng đăng nhập để xem sổ địa chỉ.</p></div>;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const openAddModal = () => {
    setFormData({
      receiver_name: '',
      phone: '',
      full_address: '',
      is_default: addresses.length === 0 ? 1 : 0
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (address) => {
    setFormData({
      receiver_name: address.receiver_name,
      phone: address.phone,
      full_address: address.full_address,
      is_default: address.is_default
    });
    setEditingId(address.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await authAPI.updateAddress(editingId, formData);
      } else {
        await authAPI.addAddress(formData);
      }
      setShowModal(false);
      fetchAddresses();
      toast.success(editingId ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ thành công!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (id) => {
    setAddressToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!addressToDelete) return;
    try {
      await authAPI.deleteAddress(addressToDelete);
      fetchAddresses();
      toast.success('Đã xóa địa chỉ!');
    } catch (error) {
      toast.error('Lỗi xóa địa chỉ');
    } finally {
      setIsDeleteModalOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (address) => {
    try {
      await authAPI.updateAddress(address.id, { ...address, is_default: 1 });
      fetchAddresses();
      toast.success('Đã thiết lập địa chỉ mặc định!');
    } catch (error) {
      toast.error('Lỗi thiết lập địa chỉ mặc định');
    }
  };

  return (
    <div className={`container ${styles.accountLayout}`}>
      <aside className={styles.sidebarCol}>
        <AccountSidebar />
      </aside>
      
      <main className={styles.mainCol}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <div>
              <h1 className={styles.cardTitle}>Sổ địa chỉ</h1>
              <p className={styles.cardSubtitle}>Quản lý địa chỉ giao hàng của bạn</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal}>
              <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
            </button>
          </div>
          
          <div className={styles.cardBody}>
            {loading ? (
              <p>Đang tải...</p>
            ) : addresses.length === 0 ? (
              <p>Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới để đặt hàng dễ dàng hơn!</p>
            ) : (
              <div className={styles.addressList}>
                {addresses.map(address => (
                  <div key={address.id} className={`${styles.addressItem} ${address.is_default ? styles.default : ''}`}>
                    <div className={styles.addressInfo}>
                      <div className={styles.addressHeader}>
                        <span className={styles.receiverName}>{address.receiver_name}</span>
                        {address.is_default === 1 && <span className={styles.defaultBadge}>Mặc định</span>}
                      </div>
                      <p className={styles.receiverPhone}>SĐT: {address.phone}</p>
                      <p className={styles.addressText}>{address.full_address}</p>
                    </div>
                    <div className={styles.addressActions}>
                      <button className={styles.actionBtn} onClick={() => openEditModal(address)}>Sửa</button>
                      {!address.is_default && (
                        <button className={styles.actionBtn} onClick={() => handleSetDefault(address)}>Thiết lập mặc định</button>
                      )}
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(address.id)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Address Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Họ và tên người nhận</label>
                <input 
                  type="text" 
                  name="receiver_name" 
                  value={formData.receiver_name} 
                  onChange={handleInputChange} 
                  className={styles.formControl} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Số điện thoại</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  className={styles.formControl} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Địa chỉ cụ thể (Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố)</label>
                <textarea 
                  name="full_address" 
                  value={formData.full_address} 
                  onChange={handleInputChange} 
                  className={styles.formControl} 
                  rows="3"
                  required 
                ></textarea>
                {debouncedAddress && (
                  <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <iframe
                      title="Google Maps"
                      width="100%"
                      height="200"
                      style={{ border: 0, display: 'block' }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${encodeURIComponent(debouncedAddress)}&output=embed`}
                    ></iframe>
                  </div>
                )}
              </div>
              <div className={styles.checkboxGroup}>
                <input 
                  type="checkbox" 
                  id="is_default" 
                  name="is_default" 
                  checked={formData.is_default === 1} 
                  onChange={handleInputChange} 
                  disabled={editingId && addresses.find(a => a.id === editingId)?.is_default === 1}
                />
                <label htmlFor="is_default" style={{margin: 0}}>Đặt làm địa chỉ mặc định</label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{border: '1px solid var(--border-color)'}}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
