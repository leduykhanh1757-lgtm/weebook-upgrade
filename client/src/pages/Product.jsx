import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { booksAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import styles from './Product.module.css';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await booksAPI.getBookById(id);
        if (res.book) {
          setBook(res.book);
          const relRes = await booksAPI.getBooks({ subcategory: res.book.subcategory, limit: 4 });
          setRelatedBooks(relRes.books?.filter(b => String(b.id) !== String(id)) || []);
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (book) {
      dispatch(addToCart({ bookId: book.id, quantity, book }));
      alert('Đã thêm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    if (book) {
      dispatch(addToCart({ bookId: book.id, quantity, book }));
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
            <span>Tác giả: <strong>{book.author}</strong></span>
            <span>|</span>
            <span>Thể loại: <strong>{book.category}</strong></span>
          </div>
          
          <div className={styles.productPrice}>
            <span className={styles.currentPrice}>{formatPrice(book.price)}</span>
            {book.originalPrice > book.price && (
              <>
                <span className={styles.originalPrice}>{formatPrice(book.originalPrice)}</span>
                <span className={styles.discountBadge}>-{book.discount}%</span>
              </>
            )}
          </div>
          
          <div className={styles.productDescription}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>Mô tả sản phẩm</h3>
            <p>{book.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
          </div>
          
          <div className={styles.addToCartSection}>
            <div className={styles.quantitySelector}>
              <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" className={styles.qtyInput} value={quantity} readOnly />
              <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className={`btn ${styles.addToCartBtn}`} onClick={handleAddToCart}>
              <i className="fas fa-shopping-cart"></i> Thêm vào giỏ
            </button>
            <button className={`btn ${styles.buyNowBtn}`} onClick={handleBuyNow}>
              Mua ngay
            </button>
          </div>
        </div>
      </div>
      
      {relatedBooks.length > 0 && (
        <section>
          <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', borderBottom: '2px solid var(--primary-color)', display: 'inline-block', paddingBottom: '5px' }}>Sản phẩm liên quan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', marginTop: '20px' }}>
            {relatedBooks.map(b => <ProductCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Product;
