import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { booksAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const Category = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await booksAPI.getBooks({ category, subcategory });
        setBooks(res.books || []);
      } catch (err) {
        console.error('Failed to fetch category', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [category, subcategory]);

  return (
    <div className="container category-page">
      <div className="content-layout">
        <aside className="sidebar">
          <div className="category-menu">
            <h3 className="category-title">DANH MỤC SẢN PHẨM</h3>
            <ul className="category-list">
              <li><a href="/category?category=vietnamese">Sách Tiếng Việt</a></li>
              <li><a href="/category?category=foreign">Sách Ngoại Văn</a></li>
              <li><a href="/category?category=office-supplies">Văn Phòng Phẩm</a></li>
              <li><a href="/category?category=comics">Truyện Tranh</a></li>
            </ul>
          </div>
        </aside>
        <div className="main-content-area">
          <div className="category-header">
            <h1>Tất cả sản phẩm</h1>
          </div>
          <div className="product-grid">
            {loading ? (
              <p>Đang tải...</p>
            ) : books.length > 0 ? (
              books.map(book => <ProductCard key={book.id} book={book} />)
            ) : (
              <p>Không có sản phẩm nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
