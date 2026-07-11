import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { booksAPI } from '../services/api';
import CartDropdown from './CartDropdown';
import ConfirmModal from './ConfirmModal';
import { toast } from 'react-hot-toast';
import styles from './Header.module.css';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const accountRef = useRef(null);
  const cartRef = useRef(null);

  const cartItemCount = cartItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
    setIsAccountOpen(false);
  };

  const executeLogout = () => {
    dispatch(logout());
    setIsLogoutModalOpen(false);
    navigate('/');
    toast.success('Đăng xuất thành công!');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const searchRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setShowSearchDropdown(true);
        try {
          const res = await booksAPI.getBooks({ search: searchQuery.trim(), limit: 5 });
          setSearchResults(res.books || []);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerMain}>
          <div className={styles.leftSection}>
            <div className={styles.brandSection}>
              <Link to="/" className={styles.logo}>
                <img src="/src/assets/images/logo.png" alt="BookSelf Logo" />
                <span className={styles.brandName}>BookSelf</span>
              </Link>
            </div>

            <nav className={styles.navLinks}>
              <Link to="/">Trang Chủ</Link>
              <Link to="/category">Sản phẩm</Link>
            </nav>
          </div>

          <div className={styles.searchContainer} ref={searchRef}>
            <form className={styles.searchBar} onSubmit={handleSearch}>
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Tìm kiếm sách, tác giả..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery.trim().length > 1) setShowSearchDropdown(true); }}
              />
              <button type="submit" className={styles.searchBtn}><i className="fa-solid fa-magnifying-glass"></i></button>
            </form>
            
            {showSearchDropdown && (
              <div className={styles.searchDropdown}>
                {isSearching ? (
                  <div className={styles.searchDropdownMessage}>Đang tìm kiếm...</div>
                ) : searchResults.length > 0 ? (
                  <div className={styles.searchResultsList}>
                    {searchResults.map(book => (
                      <Link 
                        key={book.id} 
                        to={`/product/${book.id}`} 
                        className={styles.searchResultItem}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                      >
                        <img src={book.images?.[0] || '/src/assets/images/placeholder.jpg'} alt={book.title} className={styles.searchResultImage} />
                        <div className={styles.searchResultInfo}>
                          <h4>{book.title}</h4>
                          <span className={styles.searchResultPrice}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                    <Link 
                      to={`/category?search=${encodeURIComponent(searchQuery.trim())}`}
                      className={styles.searchViewAll}
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      Xem tất cả kết quả &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className={styles.searchDropdownMessage}>Không tìm thấy kết quả nào cho "{searchQuery}"</div>
                )}
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            <div className={styles.openingHours}>
              <i className="fa-regular fa-clock"></i>
              <span>
                <strong>THỜI GIAN MỞ CỬA</strong><br />
                8H - 22H T2 - CN
              </span>
            </div>
            <div className={styles.userActions}>
              {/* Account Menu */}
              <div className={styles.accountMenu} ref={accountRef}>
                <button 
                  className={styles.actionIcon} 
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                >
                  {user && user.avatar ? (
                    <img src={user.avatar} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fa-regular fa-user"></i> 
                  )}
                  <span>{user ? user.name.split(' ')[0] : 'Tài khoản'}</span> 
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.8em' }}></i>
                </button>
                <div className={`${styles.accountDropdown} ${isAccountOpen ? styles.show : ''}`}>
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={() => setIsAccountOpen(false)}><i className="fa-solid fa-user"></i> Hồ sơ cá nhân</Link>
                      <Link to="/wishlist" onClick={() => setIsAccountOpen(false)}><i className="fa-solid fa-heart"></i> Đã yêu thích</Link>
                      <Link to="/orders" onClick={() => setIsAccountOpen(false)}><i className="fa-solid fa-rectangle-list"></i> Quản lý đơn hàng</Link>
                      <button onClick={handleLogout}><i className="fa-solid fa-sign-out-alt"></i> Đăng xuất</button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setIsAccountOpen(false)}><i className="fa-solid fa-sign-in-alt"></i> Đăng nhập / Đăng ký</Link>
                    </>
                  )}
                </div>
              </div>
              
              {/* Cart Menu */}
              <div className={styles.cartIconWrapper} ref={cartRef}>
                <button 
                  className={styles.actionIcon} 
                  onClick={() => setIsCartOpen(!isCartOpen)}
                >
                  <i className="fa-solid fa-cart-shopping"></i> <span>Giỏ hàng</span>
                  {cartItemCount > 0 && <span className={styles.cartCount}>{cartItemCount}</span>}
                </button>
                {isCartOpen && <CartDropdown closeCart={() => setIsCartOpen(false)} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
        confirmText="Đăng xuất"
        cancelText="Không"
        onConfirm={executeLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </header>
  );
};

export default Header;
