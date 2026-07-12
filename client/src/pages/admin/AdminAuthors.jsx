import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';

const AdminAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showPublisherModal, setShowPublisherModal] = useState(false);
  const [authorForm, setAuthorForm] = useState({ name: '', bio: '', image: '' });
  const [publisherForm, setPublisherForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [authorsData, publishersData] = await Promise.all([
        adminAPI.getAuthors(),
        adminAPI.getPublishers()
      ]);
      setAuthors(authorsData);
      setPublishers(publishersData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addAuthor(authorForm);
      setShowAuthorModal(false);
      fetchData();
    } catch (error) {
      alert('Lỗi lưu tác giả');
    }
  };

  const handleSavePublisher = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addPublisher(publisherForm);
      setShowPublisherModal(false);
      fetchData();
    } catch (error) {
      alert('Lỗi lưu NXB');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tác giả & Nhà xuất bản</h1>
      </div>

      <div className={styles.dashboardLayout}>
        {/* Authors Panel */}
        <div className={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className={styles.panelTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Quản lý Tác giả</h3>
            <button className="btn btn-primary" onClick={() => { setAuthorForm({name:'', bio:'', image:''}); setShowAuthorModal(true); }}>
              <i className="fa-solid fa-plus"></i> Thêm mới
            </button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên tác giả</th>
                <th>Tiểu sử</th>
              </tr>
            </thead>
            <tbody>
              {authors.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong></td>
                  <td><span className={styles.textSmall}>{a.bio?.substring(0, 50) || '-'}</span></td>
                </tr>
              ))}
              {authors.length === 0 && (
                <tr><td colSpan="2" className={styles.textCenter}>Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Publishers Panel */}
        <div className={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className={styles.panelTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Nhà xuất bản</h3>
            <button className="btn btn-primary" onClick={() => { setPublisherForm({name:'', description:''}); setShowPublisherModal(true); }}>
              <i className="fa-solid fa-plus"></i> Thêm mới
            </button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên NXB</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {publishers.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><span className={styles.textSmall}>{p.description?.substring(0, 50) || '-'}</span></td>
                </tr>
              ))}
              {publishers.length === 0 && (
                <tr><td colSpan="2" className={styles.textCenter}>Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Author Modal */}
      {showAuthorModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Thêm Tác giả</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowAuthorModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveAuthor} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Tên tác giả</label>
                <input type="text" value={authorForm.name} onChange={e => setAuthorForm({...authorForm, name: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Link ảnh chân dung (Tùy chọn)</label>
                <input type="text" value={authorForm.image} onChange={e => setAuthorForm({...authorForm, image: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Tiểu sử sơ lược (Tùy chọn)</label>
                <textarea value={authorForm.bio} onChange={e => setAuthorForm({...authorForm, bio: e.target.value})}></textarea>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAuthorModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publisher Modal */}
      {showPublisherModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Thêm Nhà Xuất Bản</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowPublisherModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSavePublisher} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Tên Nhà Xuất Bản</label>
                <input type="text" value={publisherForm.name} onChange={e => setPublisherForm({...publisherForm, name: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả (Tùy chọn)</label>
                <textarea value={publisherForm.description} onChange={e => setPublisherForm({...publisherForm, description: e.target.value})}></textarea>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPublisherModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthors;
