import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerMain}`}>
        <div className={styles.aboutUs}>
          <img src="/src/assets/images/logo.png" alt="BookSelf Logo" className={styles.footerLogo} />
          <p>Công ty cổ phần sách BookSelf</p>
          <p><strong>Bạn cần hỗ trợ? Gọi chúng tôi 24/7</strong></p>
          <p className={styles.phoneNumber}>0912 913 914</p>
          <p><strong>Thông tin địa chỉ</strong></p>
          <p>Số 125 Đường Trần Hưng Đạo, Phường Cầu Kho, Quận 1, TP. Hồ Chí Minh</p>
        </div>
        
        <div className={styles.footerCol}>
          <h3>Hỗ trợ</h3>
          <ul>
            <li><Link to="/info/huong-dan-mua-hang">Hướng dẫn mua hàng</Link></li>
            <li><Link to="/info/huong-dan-thanh-toan">Hướng dẫn thanh toán</Link></li>
            <li><Link to="/info/huong-dan-giao-nhan">Hướng dẫn giao nhận</Link></li>
            <li><Link to="/info/dieu-khoan-dich-vu">Điều khoản dịch vụ</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerCol}>
          <h3>Chính sách</h3>
          <ul>
            <li><Link to="/info/chinh-sach-bao-mat">Chính sách bảo mật</Link></li>
            <li><Link to="/info/chinh-sach-van-chuyen">Chính sách vận chuyển</Link></li>
            <li><Link to="/info/chinh-sach-doi-tra">Chính sách đổi trả</Link></li>
            <li><Link to="/info/quy-dinh-su-dung">Quy định sử dụng</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerCol}>
          <h3>Nhận tin khuyến mãi</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Hỗ trợ khách hàng 24/7</p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Nhập email của bạn" required />
            <button type="submit">Đăng ký</button>
          </form>
          <p className={styles.socialTitle}>Theo dõi chúng tôi</p>
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
