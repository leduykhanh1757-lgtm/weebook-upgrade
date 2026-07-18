import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { wishlistAPI } from '../services/api';
import styles from './ProductCard.module.css';

const ProductCard = ({ book }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    try {
      const localWishlist = JSON.parse(localStorage.getItem('bookself-wishlist') || '[]');
      setInWishlist(Array.isArray(localWishlist) && localWishlist.includes(book.id));
    } catch (e) {
      console.error('Failed to parse wishlist', e);
      setInWishlist(false);
    }
  }, [book.id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ bookId: book.id, quantity: 1, book }));
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isAuthenticated) {
        if (inWishlist) {
          await wishlistAPI.removeFromWishlist(book.id);
        } else {
          await wishlistAPI.addToWishlist(book.id);
        }
      }
      
      let localWishlist = [];
      try {
        localWishlist = JSON.parse(localStorage.getItem('bookself-wishlist') || '[]');
        if (!Array.isArray(localWishlist)) localWishlist = [];
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
      
      if (inWishlist) {
        const updated = localWishlist.filter(id => id !== book.id);
        localStorage.setItem('bookself-wishlist', JSON.stringify(updated));
      } else {
        localWishlist.push(book.id);
        localStorage.setItem('bookself-wishlist', JSON.stringify(localWishlist));
      }
      setInWishlist(!inWishlist);
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Link to={`/product/${book.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={book.images?.[0] || '/src/assets/images/placeholder.jpg'} 
          alt={book.title} 
          loading="lazy" 
          className={styles.image}
        />
        {book.discount > 0 && <span className={styles.discountBadge}>-{book.discount}%</span>}
        {book.newRelease && <span className={styles.newBadge}>Mới</span>}
        
        <div className={styles.actions}>
          <button 
            className={`${styles.wishlistBtn} ${inWishlist ? styles.active : ''}`} 
            onClick={handleToggleWishlist}
            title={inWishlist ? "Bỏ yêu thích" : "Thêm yêu thích"}
          >
            <i className={inWishlist ? "fas fa-heart" : "far fa-heart"}></i>
          </button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>{book.author}</p>
        <div className={styles.rating}>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <i key={star} className={`fas fa-star ${star <= Math.round(book.rating || 0) ? '' : 'empty'}`} style={{ color: star <= Math.round(book.rating || 0) ? '#F59E0B' : '#E2E8F0' }}></i>
            ))}
          </div>
          <span className={styles.ratingText}>({book.review_count || 0})</span>
        </div>
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>{formatPrice(book.price)}</span>
          {book.originalPrice > book.price && (
            <span className={styles.originalPrice}>{formatPrice(book.originalPrice)}</span>
          )}
        </div>
        <button className={`btn btn-primary ${styles.addToCartBtn}`} onClick={handleAddToCart}>
          <i className="fas fa-shopping-cart"></i> Thêm vào giỏ
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
