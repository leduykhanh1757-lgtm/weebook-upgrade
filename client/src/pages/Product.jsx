import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { booksAPI, wishlistAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-hot-toast';
import styles from './Product.module.css';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(parseInt(searchParams.get('qty')) || 1);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [inWishlist, setInWishlist] = useState(false);

  // Reviews logic
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    try {
      await booksAPI.addReview(id, { rating: newRating, comment: newReview });
      toast.success('Đã gửi đánh giá thành công!');
      setNewReview('');
      setNewRating(5);
      
      // Reload product and reviews
      fetchProductData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi gửi đánh giá');
    }
  };

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const [bookRes, reviewsRes] = await Promise.all([
        booksAPI.getBookById(id),
        booksAPI.getReviews(id)
      ]);
      
      if (bookRes.book) {
        setBook(bookRes.book);
        const relRes = await booksAPI.getBooks({ subcategory: bookRes.book.subcategory, limit: 4 });
        setRelatedBooks(relRes.books?.filter(b => String(b.id) !== String(id)) || []);
      }
      if (reviewsRes.reviews) {
        setReviews(reviewsRes.reviews);
      }
    } catch (err) {
      console.error('Failed to load product or reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    setQuantity(parseInt(searchParams.get('qty')) || 1);
    window.scrollTo(0, 0);

    const localWishlist = JSON.parse(localStorage.getItem('bookself-wishlist') || '[]');
    setInWishlist(localWishlist.includes(parseInt(id)));
  }, [id]);

  const handleAddToCart = () => {
    if (book) {
      dispatch(addToCart({ bookId: book.id, quantity, book }));
      toast.success('Đã thêm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    if (book) {
      navigate('/checkout', { state: { buyNowItem: { bookId: book.id, quantity, book } } });
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (isAuthenticated) {
        if (inWishlist) {
          await wishlistAPI.removeFromWishlist(book.id);
        } else {
          await wishlistAPI.addToWishlist(book.id);
        }
      }
      
      const localWishlist = JSON.parse(localStorage.getItem('bookself-wishlist') || '[]');
      if (inWishlist) {
        const updated = localWishlist.filter(item => item !== book.id);
        localStorage.setItem('bookself-wishlist', JSON.stringify(updated));
      } else {
        if (!localWishlist.includes(book.id)) {
          localWishlist.push(book.id);
          localStorage.setItem('bookself-wishlist', JSON.stringify(localWishlist));
        }
      }
      setInWishlist(!inWishlist);
    } catch (err) {
      console.error('Lỗi khi thao tác với danh sách yêu thích:', err);
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để lưu danh sách yêu thích đồng bộ!');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const translateCategory = (cat) => {
    if (!cat) return cat;
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

  const renderStars = (rating) => {
    if (!book || book.review_count === 0) {
      return Array(5).fill(0).map((_, i) => <i key={i} className="fa-solid fa-star" style={{color: '#d1d5db'}}></i>);
    }
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<i key={i} className="fa-solid fa-star" style={{color: '#facc15'}}></i>);
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<i key={i} className="fa-solid fa-star-half-stroke" style={{color: '#facc15'}}></i>);
      } else {
        stars.push(<i key={i} className="fa-regular fa-star" style={{color: '#d1d5db'}}></i>);
      }
    }
    return stars;
  };

  if (loading) return <div className="container loading-placeholder"><p>Đang tải thông tin sách...</p></div>;
  if (!book) return <div className="container loading-placeholder"><p>Không tìm thấy sản phẩm!</p></div>;

  return (
    <div className={`container ${styles.productPage}`}>
      <div className={styles.productDetailContainer}>
        <div className={styles.productImages}>
          <div className={styles.mainImage}>
            <img src={book.images?.[0] || '/src/assets/images/placeholder.jpg'} alt={book.title} />
          </div>
        </div>
        
          <div className={styles.productInfo}>
          <h1 className={styles.productTitle}>{book.title}</h1>
          <div className={styles.productMeta}>
            <div className={styles.ratingSection}>
              {renderStars(book.rating || 0)}
              <span className={styles.reviewCount}>({book.review_count || 0} đánh giá)</span>
            </div>
            <span>Tác giả: <strong>{book.author}</strong></span>
            <span>|</span>
            <span>Thể loại: <strong>{translateCategory(book.category)}</strong></span>
            {book.stock <= 0 && (
              <>
                <span>|</span>
                <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>Hết hàng</span>
              </>
            )}
          </div>
          
          <div className={styles.productPrice}>
            <span className={styles.currentPrice}>{formatPrice(book.price)}</span>
            {book.original_price > book.price && (
              <>
                <span className={styles.originalPrice}>{formatPrice(book.original_price)}</span>
                <span className={styles.discountBadge}>-{book.discount}%</span>
              </>
            )}
          </div>
          
          <div className={styles.addToCartSection}>
            <div className={styles.actionRowPrimary}>
              <div className={styles.quantitySelector}>
                <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" className={styles.qtyInput} value={quantity} readOnly />
                <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className={`btn ${styles.addToCartBtn}`} onClick={handleAddToCart} disabled={book.stock <= 0}>
                <i className="fas fa-shopping-cart"></i> Thêm vào giỏ
              </button>
              <button 
                className={`${styles.wishlistBtn} ${inWishlist ? styles.active : ''}`} 
                onClick={handleToggleWishlist}
                title={inWishlist ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <i className={inWishlist ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
              </button>
            </div>
            <button className={`btn ${styles.buyNowBtn}`} onClick={handleBuyNow} disabled={book.stock <= 0} style={{ width: '100%', marginTop: '12px' }}>
              Mua ngay
            </button>
          </div>

          <div className={styles.productDescription}>
            <h3>Mô tả sản phẩm</h3>
            <p>{book.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
          </div>

          <div className={styles.productSpecs}>
            <h3>Thông tin chi tiết</h3>
            <table className={styles.specsTable}>
              <tbody>
                <tr><td>Nhà xuất bản</td><td>{book.publisher || 'Đang cập nhật'}</td></tr>
                <tr><td>Ngày xuất bản</td><td>{book.publish_date || 'Đang cập nhật'}</td></tr>
                <tr><td>Kích thước</td><td>{book.dimensions || 'Đang cập nhật'}</td></tr>
                <tr><td>Trọng lượng</td><td>{book.weight || 'Đang cập nhật'}</td></tr>
                <tr><td>Số trang</td><td>{book.pages || 'Đang cập nhật'}</td></tr>
                <tr><td>Định dạng</td><td>{book.format || 'Bìa mềm'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className={styles.reviewsSection}>
        <h2 className={styles.sectionTitle}>Đánh giá sản phẩm</h2>
        
        <div className={styles.addReviewBox}>
          <h3>Viết đánh giá của bạn</h3>
          <form onSubmit={handleAddReview}>
            <div style={{ marginBottom: '15px', color: 'var(--text-light)', fontStyle: 'italic' }}>
              Đăng đánh giá với tên: <strong>{isAuthenticated && user ? user.name : 'Khách'}</strong>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Đánh giá của bạn:</label>
              <select 
                value={newRating} 
                onChange={(e) => setNewRating(Number(e.target.value))}
              >
                <option value={5}>5 Sao - Tuyệt vời</option>
                <option value={4}>4 Sao - Rất tốt</option>
                <option value={3}>3 Sao - Bình thường</option>
                <option value={2}>2 Sao - Tạm được</option>
                <option value={1}>1 Sao - Rất tệ</option>
              </select>
            </div>
            <textarea 
              value={newReview} 
              onChange={(e) => setNewReview(e.target.value)} 
              placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
            />
            <button type="submit" className="btn btn-primary">Gửi đánh giá</button>
          </form>
        </div>

        <div className={styles.reviewList}>
          {reviews.length === 0 ? (
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    {review.userId ? (
                      <Link to={`/user/${review.userId}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                        <div className={styles.avatar}>
                          {review.avatar ? (
                            <img src={review.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                          ) : (
                            review.user.charAt(0).toUpperCase()
                          )}
                        </div>
                        <strong>{review.user}</strong>
                      </Link>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={styles.avatar}>{review.user.charAt(0).toUpperCase()}</div>
                        <strong>{review.user}</strong>
                      </div>
                    )}
                  </div>
                  <span className={styles.reviewDate}>{review.date}</span>
                </div>
                <div className={styles.reviewStars}>
                  {renderStars(review.rating)}
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {relatedBooks.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Sản phẩm liên quan</h2>
          <div className={styles.relatedGrid}>
            {relatedBooks.map(b => <ProductCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Product;
