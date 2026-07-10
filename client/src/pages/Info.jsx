import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './Info.module.css';

const infoContent = {
  'huong-dan-mua-hang': {
    title: 'Hướng dẫn mua hàng',
    content: (
      <>
        <p>Để mua hàng tại BookSelf, quý khách vui lòng làm theo các bước sau:</p>
        <ol>
          <li>Tìm kiếm và lựa chọn sách vào Giỏ hàng.</li>
          <li>Kiểm tra lại số lượng và bấm "Thanh toán".</li>
          <li>Đăng nhập hoặc đăng ký tài khoản mới.</li>
          <li>Điền đầy đủ thông tin nhận hàng và chọn phương thức vận chuyển.</li>
          <li>Bấm "Hoàn tất đặt hàng". BookSelf sẽ gọi điện xác nhận trong 24h.</li>
        </ol>
      </>
    )
  },
  'huong-dan-thanh-toan': {
    title: 'Hướng dẫn thanh toán',
    content: (
      <>
        <p>BookSelf hiện đang hỗ trợ 3 phương thức thanh toán chính:</p>
        <ul>
          <li><strong>Thanh toán khi nhận hàng (COD):</strong> Trả tiền mặt trực tiếp cho người giao hàng.</li>
          <li><strong>Chuyển khoản ngân hàng:</strong> Vui lòng chuyển khoản tới STK: 1900123456 - Ngân hàng Techcombank, nội dung: Tên_SĐT_MãĐơnHàng.</li>
          <li><strong>Ví điện tử Momo:</strong> Quét mã QR hiện trên ứng dụng khi chọn phương thức thanh toán Momo.</li>
        </ul>
      </>
    )
  },
  'huong-dan-giao-nhan': {
    title: 'Hướng dẫn giao nhận',
    content: (
      <>
        <p>Thời gian giao hàng dự kiến:</p>
        <ul>
          <li><strong>Hà Nội và TP.HCM:</strong> Giao hàng trong vòng 1-2 ngày làm việc.</li>
          <li><strong>Các tỉnh thành khác:</strong> Giao hàng trong vòng 3-5 ngày làm việc.</li>
        </ul>
        <p>Lưu ý: Thời gian giao hàng có thể lâu hơn trong các dịp lễ, Tết.</p>
      </>
    )
  },
  'dieu-khoan-dich-vu': {
    title: 'Điều khoản dịch vụ',
    content: (
      <>
        <p>Khi sử dụng dịch vụ của BookSelf, quý khách đồng ý với các điều khoản sau:</p>
        <ul>
          <li>Thông tin tài khoản phải được bảo mật, quý khách chịu trách nhiệm với mọi hoạt động trên tài khoản của mình.</li>
          <li>BookSelf có quyền từ chối cung cấp dịch vụ hoặc hủy đơn hàng nếu phát hiện gian lận.</li>
          <li>Giá bán sản phẩm có thể thay đổi tùy từng thời điểm.</li>
        </ul>
      </>
    )
  },
  'chinh-sach-bao-mat': {
    title: 'Chính sách bảo mật',
    content: (
      <>
        <p>BookSelf cam kết bảo vệ thông tin cá nhân của quý khách:</p>
        <ul>
          <li>Thông tin được sử dụng cho mục đích xử lý đơn hàng, hỗ trợ khách hàng và gửi thông báo.</li>
          <li>Tuyệt đối không bán hoặc chia sẻ thông tin cho bên thứ ba vì mục đích thương mại.</li>
          <li>Quý khách có quyền yêu cầu xóa thông tin cá nhân khỏi hệ thống của chúng tôi.</li>
        </ul>
      </>
    )
  },
  'chinh-sach-van-chuyen': {
    title: 'Chính sách vận chuyển',
    content: (
      <>
        <p>Chi phí vận chuyển được tính như sau:</p>
        <ul>
          <li><strong>Miễn phí vận chuyển:</strong> Cho đơn hàng từ 300,000 VND trở lên trên toàn quốc.</li>
          <li><strong>Phí tiêu chuẩn (30,000 VND):</strong> Cho các đơn hàng dưới 300,000 VND.</li>
          <li><strong>Giao hàng hỏa tốc:</strong> Chỉ áp dụng tại Hà Nội và TP.HCM, phụ phí 50,000 VND.</li>
        </ul>
      </>
    )
  },
  'chinh-sach-doi-tra': {
    title: 'Chính sách đổi trả',
    content: (
      <>
        <p>Quý khách có thể yêu cầu đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng với các điều kiện:</p>
        <ul>
          <li>Sách bị lỗi do nhà sản xuất (rách, thiếu trang, in mờ).</li>
          <li>Sách hư hỏng do quá trình vận chuyển.</li>
          <li>Giao sai sách so với đơn đặt hàng.</li>
        </ul>
        <p>Sách đổi trả phải còn nguyên vẹn, chưa qua sử dụng (trừ trường hợp lỗi từ nhà in).</p>
      </>
    )
  },
  'quy-dinh-su-dung': {
    title: 'Quy định sử dụng',
    content: (
      <>
        <p>BookSelf hoạt động nhằm mục đích cung cấp tri thức cho cộng đồng. Mọi hành vi sau đây đều bị nghiêm cấm:</p>
        <ul>
          <li>Phát tán nội dung vi phạm pháp luật, thuần phong mỹ tục lên website.</li>
          <li>Sử dụng các công cụ tự động để thu thập dữ liệu sản phẩm của BookSelf mà chưa được phép.</li>
          <li>Phá hoại, tấn công hệ thống bảo mật của website.</li>
        </ul>
      </>
    )
  }
};

const Info = () => {
  const { slug } = useParams();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const pageData = infoContent[slug];

  if (!pageData) {
    return (
      <div className={`container ${styles.infoPage}`}>
        <div className={styles.infoCard}>
          <h1>Không tìm thấy trang</h1>
          <p>Xin lỗi, nội dung bạn đang tìm kiếm không tồn tại.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Về trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.infoPage}`}>
      <div className={styles.infoLayout}>
        <aside className={styles.infoSidebar}>
          <h3>Danh mục thông tin</h3>
          <ul>
            {Object.keys(infoContent).map(key => (
              <li key={key}>
                <Link to={`/info/${key}`} className={slug === key ? styles.active : ''}>
                  {infoContent[key].title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        
        <div className={styles.infoCard}>
          <h1>{pageData.title}</h1>
          <div className={styles.infoContent}>
            {pageData.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
