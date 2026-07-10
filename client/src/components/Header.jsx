import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import CartDropdown from './CartDropdown';

const Header = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef(null);

  const cartItemCount = cartItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header>
      <div className="header-main">
        <div className="container">
          <div className="brand-section">
            <Link to="/" className="logo">
              <img src="/src/assets/images/logo.png" alt="BookSelf Logo" />
              <span className="brand-name">BookSelf</span>
            </Link>
          </div>

          <nav className="main-nav">
            <ul className="nav-links">
              <li><Link to="/"><span>Trang Chủ</span></Link></li>
              <li><Link to="/category"><span>Sản phẩm</span></Link></li>
              <li><Link to="/about"><span>Về Chúng Tôi</span></Link></li>
            </ul>
          </nav>

          <div className="search-container">
            <div className="search-bar">
              <input type="text" className="search-input" placeholder="Tìm kiếm sản phẩm..." />
              <button className="search-btn"><i className="fa-solid fa-magnifying-glass"></i></button>
            </div>
          </div>

          <div className="header-right">
            <div className="opening-hours">
              <i className="fa-regular fa-clock"></i>
              <span>
                <strong>THỜI GIAN MỞ CỬA</strong><br />
                8H - 22H T2 - CN
              </span>
            </div>
            <div className="user-actions">
              <div className="account-menu">
                <a href="#" className="account-link"><i className="fa-regular fa-user"></i> <span>Tài khoản</span> <i className="fa-solid fa-chevron-down"></i></a>
                <div className="account-dropdown">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile"><i className="fa-solid fa-user"></i> <span>Tài khoản của tôi</span></Link>
                      <Link to="/profile#wishlist"><i className="fa-solid fa-heart"></i> <span>Sản phẩm yêu thích</span></Link>
                      <Link to="/orders"><i className="fa-solid fa-rectangle-list"></i> <span>Đơn hàng của tôi</span></Link>
                      <a href="#" onClick={handleLogout}><i className="fa-solid fa-sign-out-alt"></i> <span>Đăng xuất</span></a>
                    </>
                  ) : (
                    <Link to="/auth" className="login-link"><i className="fa-solid fa-sign-in-alt"></i> <span>Đăng nhập</span></Link>
                  )}
                </div>
              </div>
              
              <div style={{ position: 'relative' }} ref={cartRef}>
                <a href="#" className="cart-icon" onClick={(e) => { e.preventDefault(); setIsCartOpen(!isCartOpen); }}>
                  <i className="fa-solid fa-cart-shopping"></i> <span>Giỏ hàng</span>
                  <span className="cart-count" style={{ display: cartItemCount > 0 ? 'flex' : 'none' }}>{cartItemCount}</span>
                </a>
                {isCartOpen && <CartDropdown closeCart={() => setIsCartOpen(false)} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
