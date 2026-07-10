import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import styles from './Home.module.css';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Banner Slider Logic
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    '/src/assets/images/banner1.jpg',
    '/src/assets/images/banner2.jpg',
    '/src/assets/images/banner3.jpg'
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const featuredRes = await booksAPI.getBooks({ limit: 12, featured: true });
        setFeaturedBooks(featuredRes.books || []);
        
        const newRes = await booksAPI.getBooks({ limit: 12, sort: 'newest' });
        setNewReleases(newRes.books || []);
      } catch (err) {
        console.error('Error fetching books for home page', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className={`container ${styles.homeContainer}`}>
      <section className={styles.heroSection}>
        <div className={styles.heroBanner}>
          <div 
            className={styles.slides}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((src, idx) => (
              <div key={idx} className={styles.slide}>
                <img src={src} alt={`Banner ${idx + 1}`} />
              </div>
            ))}
          </div>
          <button className={`${styles.sliderBtn} ${styles.prev}`} onClick={prevSlide}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className={`${styles.sliderBtn} ${styles.next}`} onClick={nextSlide}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          <div className={styles.sliderNav}>
            {banners.map((_, idx) => (
              <button 
                key={idx} 
                className={`${styles.sliderDot} ${currentSlide === idx ? styles.active : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>

        <div className={styles.heroSide}>
          <div className={styles.voucherContainer}>
            <img src="/src/assets/images/small-bannerv2.jpg" alt="Voucher" />
          </div>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>SẢN PHẨM NỔI BẬT</h2>
          <Link to="/category" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Xem tất cả &rarr;</Link>
        </div>
        <div className={styles.productGrid}>
          {loading ? (
            <div className="loading-placeholder"><p>Đang tải sản phẩm...</p></div>
          ) : (
            featuredBooks.map(book => <ProductCard key={book.id} book={book} />)
          )}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>SÁCH MỚI PHÁT HÀNH</h2>
          <Link to="/category" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Xem tất cả &rarr;</Link>
        </div>
        <div className={styles.productGrid}>
          {loading ? (
            <div className="loading-placeholder"><p>Đang tải sản phẩm...</p></div>
          ) : (
            newReleases.map(book => <ProductCard key={book.id} book={book} />)
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
