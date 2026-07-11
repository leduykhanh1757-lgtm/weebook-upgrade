import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { wishlistAPI } from '../services/api';
import { addToCart } from '../store/cartSlice';
import AccountSidebar from '../components/AccountSidebar';
import { toast } from 'react-hot-toast';
import styles from './Wishlist.module.css';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      setWishlist(res.items || []);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    try {
      await wishlistAPI.removeFromWishlist(bookId);
      setWishlist(wishlist.filter(item => item.id !== bookId));
      toast.success('Đã xóa khỏi yêu thích');
    } catch (err) {
      toast.error('Không thể xóa khỏi yêu thích');
    }
  };

  const handleAddToCart = (book) => {
    dispatch(addToCart({ bookId: book.id, quantity: 1, book }));
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className={`container ${styles.accountLayout}`}>
      <aside className={styles.sidebarCol}>
        <AccountSidebar />
      </aside>
      
      <main className={styles.mainCol}>
        <div className={styles.wishlistContainer}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Danh sách yêu thích</h1>
            <p className={styles.cardSubtitle}>Những cuốn sách bạn đã lưu lại để mua sau</p>
          </div>

          <div className={styles.cardBody}>
            {loading ? (
              <div className="loading-placeholder"><p>Đang tải danh sách...</p></div>
            ) : wishlist.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fa-solid fa-heart-crack" style={{fontSize: '3rem', color: 'var(--border-color)', marginBottom: '15px'}}></i>
                <p>Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
                <Link to="/category" className="btn btn-primary" style={{marginTop: '15px', display: 'inline-block'}}>Tiếp tục mua sắm</Link>
              </div>
            ) : (
              <div className={styles.wishlistGrid}>
                {wishlist.map(book => (
                  <div key={book.id} className={styles.wishlistItem}>
                    <button className={styles.removeBtn} onClick={() => handleRemove(book.id)} title="Xóa">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                    <Link to={`/product/${book.id}`} className={styles.itemImage}>
                      <img src={book.images?.[0] || '/src/assets/images/placeholder.jpg'} alt={book.title} />
                    </Link>
                    <div className={styles.itemInfo}>
                      <Link to={`/product/${book.id}`} className={styles.itemTitle}>{book.title}</Link>
                      <p className={styles.itemAuthor}>{book.author}</p>
                      <div className={styles.itemPrice}>
                        <span className={styles.currentPrice}>{formatPrice(book.price)}</span>
                        {book.originalPrice > book.price && (
                          <span className={styles.originalPrice}>{formatPrice(book.originalPrice)}</span>
                        )}
                      </div>
                      <div className={styles.itemActions}>
                        <button className="btn btn-primary" style={{width: '100%', padding: '8px'}} onClick={() => handleAddToCart(book)}>
                          <i className="fa-solid fa-cart-plus"></i> Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wishlist;
