import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminPages.module.css';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());

  function getInitialForm() {
    return {
      title: '', author: '', publisher: '', publish_date: '',
      category: '', subcategory: '',
      price: '', original_price: '', import_price: '', discount: 0,
      isbn: '', pages: '', format: '', weight: '',
      stock: '', is_visible: 1,
      description: '', images: [] // Simple images input as comma separated string for MVP
    };
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [b, c, a, p] = await Promise.all([
        adminAPI.getBooks(),
        adminAPI.getCategories(),
        adminAPI.getAuthors(),
        adminAPI.getPublishers()
      ]);
      setBooks(b);
      setCategories(c);
      setAuthors(a);
      setPublishers(p);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setEditId(book.id);
      let imgs = '';
      try {
        imgs = JSON.parse(book.images || '[]').join(', ');
      } catch (e) {}
      setFormData({
        ...book,
        images: imgs
      });
    } else {
      setEditId(null);
      setFormData(getInitialForm());
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Process images string back to array
      let imagesArray = [];
      if (typeof formData.images === 'string') {
        imagesArray = formData.images.split(',').map(s => s.trim()).filter(s => s);
      } else {
        imagesArray = formData.images;
      }

      const payload = { ...formData, images: imagesArray };
      if (editId) {
        await adminAPI.updateBook(editId, payload);
      } else {
        await adminAPI.addBook(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Lỗi lưu sách');
    }
  };

  const handleToggleVisibility = async (book) => {
    try {
      await adminAPI.updateBook(book.id, { is_visible: book.is_visible ? 0 : 1 });
      fetchData();
    } catch (error) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quản lý Kho sách</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><i className="fa-solid fa-plus"></i> Thêm sách mới</button>
      </div>
      
      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => {
              let images = [];
              try { images = JSON.parse(book.images || '[]'); } catch(e){}
              return (
                <tr key={book.id} style={{ opacity: book.is_visible ? 1 : 0.5 }}>
                  <td>#{book.id}</td>
                  <td>
                    <div className={styles.productCell}>
                      <img src={images[0] || 'https://via.placeholder.com/50'} alt={book.title} />
                      <div>
                        <div className={styles.bookTitle}>{book.title}</div>
                        <div className={styles.textSmall}>{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.badgeCategory}>{book.category}</span></td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}</td>
                  <td>
                    {book.stock > 0 
                      ? <span className={styles.badgeSuccess}>{book.stock}</span> 
                      : <span className={styles.badgeDanger}>Hết hàng</span>}
                  </td>
                  <td>
                    {book.is_visible ? <span style={{color: '#16a34a'}}><i className="fa-solid fa-eye"></i> Hiển thị</span> : <span style={{color: '#dc2626'}}><i className="fa-solid fa-eye-slash"></i> Đã ẩn</span>}
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} onClick={() => handleOpenModal(book)}><i className="fa-solid fa-pen"></i></button>
                      <button 
                        className={book.is_visible ? styles.disableBtn : styles.enableBtn}
                        onClick={() => handleToggleVisibility(book)}
                        title={book.is_visible ? "Ẩn sách" : "Hiện sách"}
                      >
                        <i className={`fa-solid ${book.is_visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.large}`}>
            <div className={styles.modalHeader}>
              <h2>{editId ? 'Sửa thông tin Sách' : 'Thêm Sách mới'}</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.grid2}>
                {/* Column 1 */}
                <div>
                  <h4 style={{borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginTop: 0}}>Thông tin cơ bản</h4>
                  <div className={styles.formGroup}>
                    <label>Tên sách *</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label>Danh mục *</label>
                      <input type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} list="category_list" required placeholder="Nhập danh mục (vd: vietnamese)..." />
                      <datalist id="category_list">
                        <option value="vietnamese">Sách Tiếng Việt</option>
                        <option value="foreign">Sách Ngoại Văn</option>
                        <option value="comics">Manga - Comic</option>
                        <option value="stationery">Văn phòng phẩm</option>
                        <option value="toys">Đồ chơi</option>
                        {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                      </datalist>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tác giả *</label>
                      <input type="text" value={formData.author || ''} onChange={e => setFormData({...formData, author: e.target.value})} list="author_list" required placeholder="Nhập tên tác giả..." />
                      <datalist id="author_list">
                        {[...new Set(books.map(b => b.author))].filter(Boolean).map((a, idx) => (
                          <option key={idx} value={a} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label>Nhà xuất bản</label>
                      <input type="text" value={formData.publisher || ''} onChange={e => setFormData({...formData, publisher: e.target.value})} list="publisher_list" placeholder="Nhập NXB..." />
                      <datalist id="publisher_list">
                        {[...new Set(books.map(b => b.publisher))].filter(Boolean).map((p, idx) => (
                          <option key={idx} value={p} />
                        ))}
                      </datalist>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Ngày xuất bản (Năm)</label>
                      <input type="text" value={formData.publish_date} onChange={e => setFormData({...formData, publish_date: e.target.value})} />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Link ảnh (Cách nhau bằng dấu phẩy)</label>
                    <textarea value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} rows="2"></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mô tả chi tiết</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="4"></textarea>
                  </div>
                </div>

                {/* Column 2 */}
                <div>
                  <h4 style={{borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginTop: 0}}>Đặc thù & Tài chính</h4>
                  <div className={styles.grid3}>
                    <div className={styles.formGroup}>
                      <label>Giá nhập (VNĐ)</label>
                      <input type="number" value={formData.import_price} onChange={e => setFormData({...formData, import_price: e.target.value})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Giá bán *</label>
                      <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Giá bìa (Gốc)</label>
                      <input type="number" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label>Tồn kho</label>
                      <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Trạng thái hiển thị</label>
                      <select value={formData.is_visible} onChange={e => setFormData({...formData, is_visible: Number(e.target.value)})}>
                        <option value={1}>Hiển thị</option>
                        <option value={0}>Ẩn</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label>Mã ISBN</label>
                      <input type="text" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Số trang</label>
                      <input type="number" value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label>Hình thức bìa</label>
                      <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                        <option value="">-- Chọn --</option>
                        <option value="Bìa mềm">Bìa mềm</option>
                        <option value="Bìa cứng">Bìa cứng</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Trọng lượng (gram)</label>
                      <input type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                    </div>
                  </div>

                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Sách</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
