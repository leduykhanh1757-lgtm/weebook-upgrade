import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateCartQuantity, removeFromCart } from '../store/cartSlice';

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

  if (cartItems.length === 0) {
    return (
      <div className="cart-dropdown active">
        <div className="cart-empty">
          <i className="fas fa-shopping-cart"></i>
          <p>Giỏ hàng trống</p>
        </div>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  return (
    <div className="cart-dropdown active">
      <div className="cart-header">
        <h3>Giỏ hàng ({cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)})</h3>
      </div>
      <div className="cart-items">
        {cartItems.map((item) => (
          <div className="cart-item" key={item.book_id || item.id}>
            <img src={item.images?.[0] || '/src/assets/images/placeholder.jpg'} alt={item.title} />
            <div className="cart-item-info">
              <h4>{item.title}</h4>
              <p className="cart-item-price">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
              </p>
              <div className="cart-item-quantity">
                <button className="quantity-btn minus" onClick={() => handleQuantityChange(item.book_id || item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button className="quantity-btn plus" onClick={() => handleQuantityChange(item.book_id || item.id, item.quantity + 1)}>+</button>
              </div>
            </div>
            <button className="remove-item-btn" onClick={() => dispatch(removeFromCart(item.book_id || item.id))}>&times;</button>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="cart-total">
          <strong>Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</strong>
        </div>
        <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>Thanh toán</button>
      </div>
    </div>
  );
};

export default CartDropdown;
