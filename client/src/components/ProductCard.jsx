import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { wishlistAPI } from '../services/api';

const ProductCard = ({ book }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    // Basic local check or rely on passed prop if wishlist is fetched in parent
    const localWishlist = JSON.parse(localStorage.getItem('bookself-wishlist') || '[]');
    setInWishlist(localWishlist.includes(book.id));
  }, [book.id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ bookId: book.id, quantity: 1, book }));
    // Optional: show a toast notification here
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
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
    <Link to={`/product/${book.id}`} className="product-card">
      <div className="product-image">
        <img src={book.images?.[0] || '/src/assets/images/placeholder.jpg'} alt={book.title} loading="lazy" />
        {book.discount > 0 && <span className="discount-badge">-{book.discount}%</span>}
        {book.newRelease && <span className="new-badge">Mới</span>}
        
        <div className="product-actions">
          <button className={`action-btn wishlist-btn ${inWishlist ? 'active' : ''}`} onClick={handleToggleWishlist}>
            <i className={inWishlist ? "fas fa-heart" : "far fa-heart"}></i>
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{book.title}</h3>
        <p className="product-author">{book.author}</p>
        <div className="product-rating">
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <i key={star} className={`fas fa-star ${star <= Math.round(book.rating || 0) ? '' : 'empty'}`}></i>
            ))}
          </div>
          <span className="rating-text">({book.reviewCount || 0})</span>
        </div>
        <div className="product-price">
          <span className="current-price">{formatPrice(book.price)}</span>
          {book.originalPrice > book.price && (
            <span className="original-price">{formatPrice(book.originalPrice)}</span>
          )}
        </div>
        <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
          <i className="fas fa-shopping-cart"></i>
          Thêm vào giỏ
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
