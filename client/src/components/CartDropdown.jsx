import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateCartQuantity, removeFromCart } from '../store/cartSlice';
import styles from './CartDropdown.module.css';

const CartDropdown = ({ closeCart }) => {
  const { items: cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(bookId));
    } else {
      dispatch(updateCartQuantity({ bookId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán!');
      navigate('/auth');
      return;
    }
    navigate('/checkout');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.cartDropdown}>
        <div className={styles.cartEmpty}>
          <i className="fas fa-shopping-cart"></i>
          <p>Giỏ hàng trống</p>
        </div>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const totalCount = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  return (
    <div className={styles.cartDropdown}>
      <div className={styles.cartHeader}>
        <h3>Giỏ hàng ({totalCount})</h3>
      </div>
      <div className={styles.cartItems}>
        {cartItems.map((item) => (
          <div className={styles.cartItem} key={item.book_id || item.id}>
            <img src={item.images?.[0] || '/src/assets/images/placeholder.jpg'} alt={item.title} />
            <div className={styles.itemInfo}>
              <h4>{item.title}</h4>
              <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
              <div className={styles.quantityControl}>
                <button className={styles.qtyBtn} onClick={() => handleQuantityChange(item.book_id || item.id, item.quantity - 1)}>-</button>
                <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button className={styles.qtyBtn} onClick={() => handleQuantityChange(item.book_id || item.id, item.quantity + 1)}>+</button>
              </div>
            </div>
            <button className={styles.removeItem} onClick={() => dispatch(removeFromCart(item.book_id || item.id))}>&times;</button>
          </div>
        ))}
      </div>
      <div className={styles.cartFooter}>
        <div className={styles.cartTotal}>
          <span>Tổng tiền:</span>
          <strong>{formatPrice(totalPrice)}</strong>
        </div>
        <button className={`btn btn-primary ${styles.checkoutBtn}`} onClick={handleCheckout}>
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default CartDropdown;
