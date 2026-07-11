import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import styles from './Category.module.css';

const Category = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const sort = searchParams.get('sort') || 'default';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await booksAPI.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await booksAPI.getBooks({ category, subcategory, search, type, sort, page, limit: 16 });
        setBooks(res.books || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch category', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
    window.scrollTo(0, 0);
  }, [category, subcategory, search, type, sort, page]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    navigate(`/category?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value === 'default') {
      params.delete('sort');
    } else {
      params.set('sort', e.target.value);
    }
    params.set('page', '1');
    navigate(`/category?${params.toString()}`);
  };

  const translateCategory = (cat) => {
    const dict = {
      'comics': 'Truyện tranh',
      'foreign': 'Sách ngoại văn',
      'office-supplies': 'Văn phòng phẩm',
      'toys': 'Đồ chơi',
      'vietnamese': 'Sách tiếng Việt',
      'Fiction': 'Tiểu thuyết',
      'Non-Fiction': 'Phi hư cấu',
      'Science': 'Khoa học',
      'Technology': 'Công nghệ',
      'Business': 'Kinh doanh',
      'Self-Help': 'Kỹ năng sống',
      'Romance': 'Ngôn tình',
      'Children': 'Sách thiếu nhi',
      'History': 'Lịch sử',
      'Art': 'Nghệ thuật',
      'Education': 'Giáo dục'
    };
    return dict[cat] || cat;
  };

  let currentCategoryName = 'Tất cả sản phẩm';
  if (search) currentCategoryName = `Kết quả tìm kiếm cho: "${search}"`;
  else if (type === 'featured') currentCategoryName = 'Sách Nổi Bật';
  else if (type === 'new') currentCategoryName = 'Sách Mới Phát Hành';
  else if (category) currentCategoryName = translateCategory(category);

  return (
    <div className={`container ${styles.categoryPage}`}>
      <div className={styles.contentLayout}>
        <aside className={styles.sidebar}>
          <div className="category-menu">
            <h3 className={styles.categoryTitle}>DANH MỤC SẢN PHẨM</h3>
            <ul className={styles.categoryList}>
              <li>
                <Link to="/category" className={!category ? styles.active : ''}>Tất cả sản phẩm</Link>
              </li>
              {loadingCategories ? (
                <li>Đang tải...</li>
              ) : (
                categories.map(cat => (
                  <li key={cat}>
                    <Link 
                      to={`/category?category=${encodeURIComponent(cat)}`}
                      className={category === cat ? styles.active : ''}
                    >
                      {translateCategory(cat)}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
        
        <div className={styles.mainContentArea}>
          <div className={styles.categoryHeader}>
            <h1 style={{textTransform: 'capitalize'}}>{currentCategoryName}</h1>
            <div className={styles.sortFilter}>
              <label>Sắp xếp theo:</label>
              <select className={styles.sortSelect} value={sort} onChange={handleSortChange}>
                <option value="default">Phổ biến</option>
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá: Thấp đến cao</option>
                <option value="price-high">Giá: Cao đến thấp</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>
          </div>
          <div className={styles.productGrid}>
            {loading ? (
              <div className="loading-placeholder"><p>Đang tải sản phẩm...</p></div>
            ) : books.length > 0 ? (
              books.map(book => <ProductCard key={book.id} book={book} />)
            ) : (
              <p style={{ padding: '20px' }}>Không có sản phẩm nào trong danh mục này.</p>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
              <button 
                className="btn" 
                style={{ border: '1px solid var(--border-color)' }}
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Trước
              </button>
              <span style={{ padding: '10px' }}>
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button 
                className="btn" 
                style={{ border: '1px solid var(--border-color)' }}
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
