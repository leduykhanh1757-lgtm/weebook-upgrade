import React, { useEffect, useState } from 'react';
import { booksAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const featuredRes = await booksAPI.getBooks({ limit: 8, featured: true });
        setFeaturedBooks(featuredRes.books || []);
        
        const newRes = await booksAPI.getBooks({ limit: 8, sort: 'newest' });
        setNewReleases(newRes.books || []);
      } catch (err) {
        console.error('Error fetching books for home page', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <>
      <section className="main-content">
        <div className="container">
          <div className="content-layout">
            <aside className="sidebar">
              <div className="category-menu">
                <h3 className="category-title">DANH MỤC SẢN PHẨM</h3>
                <ul className="category-list">
                  <li className="has-submenu category-item">
                    <a href="/category?category=vietnamese"><i className="fa-solid fa-book"></i> Sách Tiếng Việt <i className="fa-solid fa-angle-right"></i></a>
                  </li>
                  <li className="has-submenu category-item">
                    <a href="/category?category=foreign"><i className="fa-solid fa-book-open"></i> Sách Ngoại Văn <i className="fa-solid fa-angle-right"></i></a>
                  </li>
                  <li className="has-submenu category-item">
                    <a href="/category?category=office-supplies"><i className="fa-solid fa-pen"></i> Văn Phòng Phẩm <i className="fa-solid fa-angle-right"></i></a>
                  </li>
                  <li className="has-submenu category-item">
                    <a href="/category?category=comics"><i className="fa-solid fa-images"></i> Truyện Tranh <i className="fa-solid fa-angle-right"></i></a>
                  </li>
                </ul>
              </div>
            </aside>
            <div className="hero-section">
              <div className="hero-banner">
                <div className="slides">
                  <img src="/src/assets/images/banner1.jpg" alt="Banner 1" />
                </div>
              </div>
              <div className="hero-side">
                <div className="voucher-container">
                  <img src="/src/assets/images/small-bannerv2.jpg" alt="Voucher" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product-showcase container featured-products">
        <h2>SẢN PHẨM NỔI BẬT</h2>
        <div className="product-grid">
          {loading ? (
            <div className="loading-placeholder"><p>Đang tải sản phẩm...</p></div>
          ) : (
            featuredBooks.map(book => <ProductCard key={book.id} book={book} />)
          )}
        </div>
      </section>

      <section className="product-showcase container new-releases">
        <h2>SÁCH MỚI PHÁT HÀNH</h2>
        <div className="product-grid">
          {loading ? (
            <div className="loading-placeholder"><p>Đang tải sản phẩm...</p></div>
          ) : (
            newReleases.map(book => <ProductCard key={book.id} book={book} />)
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
