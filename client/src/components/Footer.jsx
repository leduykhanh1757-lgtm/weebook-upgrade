import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="footer-main container">
        <div className="footer-col about-us">
          <img src="/src/assets/images/logo.png" alt="BookSelf Logo" className="footer-logo" />
          <p>Công ty cổ phần sách BookSelf</p>
          <p><strong>Bạn cần hỗ trợ? Gọi chúng tôi 24/7</strong></p>
          <p className="phone-number">0912 913 914</p>
          <p className="address-title">Thông tin địa chỉ</p>
          <p className="address-detail">Số 125 Đường Trần Hưng Đạo, Phường Cầu Kho, Quận 1, TP. Hồ Chí Minh</p>
        </div>
        <div className="footer-col">
          <h3>Hỗ trợ</h3>
          <ul>
            <li><Link to="/info/huong-dan-mua-hang">Hướng dẫn mua hàng</Link></li>
            <li><Link to="/info/huong-dan-thanh-toan">Hướng dẫn thanh toán</Link></li>
            <li><Link to="/info/huong-dan-giao-nhan">Hướng dẫn giao nhận</Link></li>
            <li><Link to="/info/dieu-khoan-dich-vu">Điều khoản dịch vụ</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Chính sách</h3>
          <ul>
            <li><Link to="/info/chinh-sach-bao-mat">Chính sách bảo mật</Link></li>
            <li><Link to="/info/chinh-sach-van-chuyen">Chính sách vận chuyển</Link></li>
            <li><Link to="/info/chinh-sach-doi-tra">Chính sách đổi trả</Link></li>
            <li><Link to="/info/quy-dinh-su-dung">Quy định sử dụng</Link></li>
          </ul>
        </div>
        <div className="footer-col newsletter">
          <h3>Nhận tin khuyến mãi</h3>
          <p>Hỗ trợ khách hàng 24/7</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Nhập email của bạn" />
            <button type="submit">Đăng ký</button>
          </form>
          <p className="social-title">Theo dõi chúng tôi</p>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
