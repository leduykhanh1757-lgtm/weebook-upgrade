import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import styles from './Home.module.css';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
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
        const featuredRes = await booksAPI.getBooks({ limit: 12, type: 'featured' });
        setFeaturedBooks(featuredRes.books || []);

        const newRes = await booksAPI.getBooks({ limit: 12, type: 'new' });
        setNewReleases(newRes.books || []);

        const topRes = await booksAPI.getBooks({ limit: 12, sort: 'rating' });
        setTopRatedBooks(topRes.books || []);
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
          <button className={styles.sliderBtn} onClick={prevSlide} style={{ left: '10px' }}><i className="fa-solid fa-chevron-left"></i></button>
          <button className={styles.sliderBtn} onClick={nextSlide} style={{ right: '10px' }}><i className="fa-solid fa-chevron-right"></i></button>
          <div className={styles.sliderIndicators}>
            {banners.map((_, idx) => (
              <div key={idx} className={`${styles.indicator} ${currentSlide === idx ? styles.active : ''}`} onClick={() => setCurrentSlide(idx)}></div>
            ))}
          </div>
        </div>
        <div className={styles.heroSidebar}>
          <div className={styles.sidebarBanner}>
            <img src="/src/assets/images/small-bannerv2.jpg" alt="Deal" />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="loading-placeholder"><p>Đang tải dữ liệu...</p></div>
      ) : (
        <>
          <section className={styles.bookSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><i className="fa-solid fa-fire" style={{ color: '#ef4444' }}></i> Sách Nổi Bật</h2>
              <Link to="/category?type=featured" className={styles.viewAll}>Xem tất cả <i className="fa-solid fa-chevron-right"></i></Link>
            </div>
            <div className={styles.bookGrid}>
              {featuredBooks.map(book => <ProductCard key={book.id} book={book} />)}
            </div>
          </section>

          <section className={styles.promoBannerFull}>
            <div className={styles.promoBannerInner}>
              <h3>Tuần Lễ Sách Ngoại Văn</h3>
              <p>Ưu đãi lên đến 50% cho tất cả đầu sách ngoại văn. Tặng kèm Bookmark độc quyền.</p>
              <Link to="/category?category=foreign" className={styles.ctaBtn}>Mua ngay</Link>
            </div>

            <div className={styles.promoMiddleFeatures}>
              <div className={styles.promoFeatureItem}>
                <div className={styles.promoFeatureIcon}><i className="fa-solid fa-truck-fast"></i></div>
                <div className={styles.promoFeatureText}>
                  <strong>Freeship</strong>
                  <span>Cho đơn từ 300K</span>
                </div>
              </div>
              <div className={styles.promoFeatureItem}>
                <div className={styles.promoFeatureIcon}><i className="fa-solid fa-language"></i></div>
                <div className={styles.promoFeatureText}>
                  <strong>Đa Ngôn Ngữ</strong>
                  <span>Anh, Nhật, Hàn Quốc, ...</span>
                </div>
              </div>
              <div className={styles.promoFeatureItem}>
                <div className={styles.promoFeatureIcon}><i className="fa-solid fa-gift"></i></div>
                <div className={styles.promoFeatureText}>
                  <strong>Quà Tặng</strong>
                  <span>Bookmark thiết kế</span>
                </div>
              </div>
            </div>

            <div className={styles.promoGraphic}>
              <img src="/src/assets/images/glass-globe.png" alt="Sách ngoại văn" />
            </div>
          </section>

          <section className={styles.bookSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><i className="fa-solid fa-bolt" style={{ color: '#f59e0b' }}></i> Sách Mới Phát Hành</h2>
              <Link to="/category?type=new" className={styles.viewAll}>Xem tất cả <i className="fa-solid fa-chevron-right"></i></Link>
            </div>
            <div className={styles.bookGrid}>
              {newReleases.map(book => <ProductCard key={book.id} book={book} />)}
            </div>
          </section>

          <section className={styles.bookSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><i className="fa-solid fa-star" style={{ color: '#eab308' }}></i> Được Đánh Giá Cao Nhất</h2>
              <Link to="/category?sort=rating" className={styles.viewAll}>Xem tất cả <i className="fa-solid fa-chevron-right"></i></Link>
            </div>
            <div className={styles.bookGrid}>
              {topRatedBooks.map(book => <ProductCard key={book.id} book={book} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
