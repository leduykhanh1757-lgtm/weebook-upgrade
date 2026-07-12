import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', parent_id: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditId(category.id);
      setFormData({ name: category.name, slug: category.slug, parent_id: category.parent_id || '' });
    } else {
      setEditId(null);
      setFormData({ name: '', slug: '', parent_id: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, parent_id: formData.parent_id || null };
      if (editId) {
        await adminAPI.updateCategory(editId, payload);
      } else {
        await adminAPI.addCategory(payload);
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      alert('Lỗi khi lưu danh mục');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await adminAPI.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      alert('Lỗi khi xóa danh mục');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quản lý Danh mục</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><i className="fa-solid fa-plus"></i> Thêm danh mục</button>
      </div>
      
      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Đường dẫn (Slug)</th>
              <th>Danh mục cha</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td>#{cat.id}</td>
                <td><strong>{cat.name}</strong></td>
                <td><span className={styles.textSmall}>{cat.slug}</span></td>
                <td>{cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name || cat.parent_id : '-'}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} onClick={() => handleOpenModal(cat)}><i className="fa-solid fa-pen"></i></button>
                    <button className={styles.disableBtn} onClick={() => handleDelete(cat.id)}><i className="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan="5" className={styles.textCenter}>Chưa có danh mục nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Tên danh mục</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => {
                    const val = e.target.value;
                    const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
                    setFormData({...formData, name: val, slug: slug});
                  }} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Đường dẫn (Slug)</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Danh mục cha (Tùy chọn)</label>
                <select 
                  value={formData.parent_id} 
                  onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                >
                  <option value="">-- Không có --</option>
                  {categories.filter(c => c.id !== editId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
