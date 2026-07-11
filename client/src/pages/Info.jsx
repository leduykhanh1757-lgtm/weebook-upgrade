import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './Info.module.css';

const infoContent = {
  'huong-dan-mua-hang': {
    title: 'Hướng dẫn mua hàng',
    content: (
      <>
        <p>Chào mừng quý khách đến với BookSelf. Để mang lại trải nghiệm mua sắm tiện lợi và dễ dàng nhất, chúng tôi xây dựng quy trình đặt hàng tối ưu chỉ với vài bước cơ bản. Quý khách vui lòng tham khảo chi tiết dưới đây:</p>
        
        <h3>1. Tìm kiếm và lựa chọn sản phẩm</h3>
        <p>Quý khách có thể tìm kiếm sách thông qua thanh công cụ tìm kiếm hoặc duyệt qua các danh mục sản phẩm (Văn học, Kinh tế, Thiếu nhi, Ngoại văn...). Khi tìm thấy sản phẩm ưng ý, hãy nhấp vào xem chi tiết để đọc mô tả, đánh giá và chọn số lượng muốn mua.</p>
        
        <h3>2. Thêm vào giỏ hàng</h3>
        <p>Sau khi chọn được số lượng, quý khách bấm nút <strong>"Thêm vào giỏ hàng"</strong> hoặc <strong>"Mua ngay"</strong>. Hệ thống sẽ tự động chuyển quý khách tới trang giỏ hàng để kiểm tra lại các sản phẩm đã chọn.</p>
        
        <h3>3. Đăng nhập hoặc tạo tài khoản (Tùy chọn)</h3>
        <p>Quý khách có thể mua hàng mà không cần tài khoản. Tuy nhiên, chúng tôi khuyến khích đăng ký tài khoản tại BookSelf để dễ dàng theo dõi trạng thái đơn hàng, lưu trữ lịch sử mua sắm và nhận các ưu đãi dành riêng cho thành viên.</p>
        
        <h3>4. Nhập thông tin giao hàng & Thanh toán</h3>
        <p>Tại trang Thanh toán, quý khách điền đầy đủ và chính xác thông tin nhận hàng bao gồm: Họ tên, Số điện thoại và Địa chỉ chi tiết. Sau đó, chọn phương thức vận chuyển và phương thức thanh toán phù hợp nhất.</p>
        
        <h3>5. Xác nhận đơn hàng</h3>
        <p>Sau khi bấm <strong>"Hoàn tất đặt hàng"</strong>, hệ thống sẽ gửi một email xác nhận đến địa chỉ quý khách đã cung cấp. Bộ phận chăm sóc khách hàng của BookSelf có thể gọi điện để xác nhận lần cuối trước khi tiến hành đóng gói và giao hàng.</p>
      </>
    )
  },
  'huong-dan-thanh-toan': {
    title: 'Hướng dẫn thanh toán',
    content: (
      <>
        <p>Nhằm mang đến sự linh hoạt tối đa cho khách hàng, BookSelf hiện đang cung cấp nhiều phương thức thanh toán đa dạng và an toàn tuyệt đối:</p>
        
        <h3>1. Thanh toán tiền mặt khi nhận hàng (COD)</h3>
        <p>Đây là phương thức thanh toán dễ dàng nhất, phù hợp với những khách hàng không quen thanh toán trực tuyến. Quý khách chỉ việc thanh toán bằng tiền mặt cho nhân viên giao hàng ngay khi nhận và kiểm tra xong sản phẩm.</p>
        
        <h3>2. Thanh toán bằng thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)</h3>
        <p>Chúng tôi chấp nhận thanh toán qua các loại thẻ quốc tế thông qua cổng thanh toán bảo mật 256-bit SSL. Thông tin thẻ của quý khách được mã hóa hoàn toàn và BookSelf không lưu trữ bất kỳ dữ liệu thẻ nào.</p>
        
        <h3>3. Chuyển khoản ngân hàng</h3>
        <p>Quý khách có thể chuyển khoản trực tiếp vào tài khoản của BookSelf. Vui lòng ghi rõ nội dung chuyển khoản theo cú pháp: <strong>[Tên người mua] - [Số điện thoại] - [Mã đơn hàng]</strong>.</p>
        <ul>
          <li><strong>Ngân hàng:</strong> Techcombank - Chi nhánh TP.HCM</li>
          <li><strong>Số tài khoản:</strong> 1903.xxxx.xxxx.xxxx</li>
          <li><strong>Tên chủ tài khoản:</strong> CÔNG TY CỔ PHẦN SÁCH BOOKSELF</li>
        </ul>
        <p>Đơn hàng sẽ được xử lý ngay sau khi hệ thống ghi nhận khoản thanh toán thành công.</p>
        
        <h3>4. Thanh toán qua ví điện tử (MoMo, ZaloPay, VNPay)</h3>
        <p>Quý khách chỉ cần mở ứng dụng ví điện tử tương ứng trên điện thoại và quét mã QR hiển thị trên màn hình thanh toán. Giao dịch sẽ được hoàn tất chỉ trong vài giây.</p>
      </>
    )
  },
  'huong-dan-giao-nhan': {
    title: 'Hướng dẫn giao nhận',
    content: (
      <>
        <p>BookSelf hợp tác với những đơn vị vận chuyển uy tín hàng đầu (Giao Hàng Tiết Kiệm, Giao Hàng Nhanh, Viettel Post...) để đảm bảo sách đến tay quý khách trong thời gian nhanh nhất và tình trạng hoàn hảo nhất.</p>
        
        <h3>1. Thời gian xử lý đơn hàng</h3>
        <p>Tất cả các đơn hàng đều được đội ngũ BookSelf tiếp nhận, đóng gói và bàn giao cho đơn vị vận chuyển trong vòng 24 giờ làm việc kể từ lúc xác nhận đơn hàng thành công.</p>
        
        <h3>2. Thời gian giao hàng dự kiến</h3>
        <ul>
          <li><strong>Nội thành TP.HCM và Hà Nội:</strong> 1 - 2 ngày làm việc.</li>
          <li><strong>Khu vực miền Trung và miền Nam:</strong> 2 - 4 ngày làm việc.</li>
          <li><strong>Khu vực miền Bắc:</strong> 3 - 5 ngày làm việc.</li>
        </ul>
        <p><em>*Lưu ý: Thời gian giao hàng có thể kéo dài hơn dự kiến trong các dịp Lễ, Tết hoặc do điều kiện thời tiết bất khả kháng.</em></p>
        
        <h3>3. Kiểm tra hàng khi nhận</h3>
        <p>BookSelf khuyến khích quý khách <strong>mở kiện hàng và kiểm tra ngoại quan sản phẩm</strong> (không bóc seal nilon của sách nếu có) ngay trước mặt nhân viên giao hàng. Nếu phát hiện hộp móp méo, rách ướt hoặc số lượng sách không đúng, quý khách có quyền từ chối nhận hàng và liên hệ ngay với Hotline của chúng tôi để được giải quyết nhanh chóng.</p>
      </>
    )
  },
  'dieu-khoan-dich-vu': {
    title: 'Điều khoản dịch vụ',
    content: (
      <>
        <p>Chào mừng quý khách đến với website thương mại điện tử BookSelf. Khi quý khách truy cập vào trang web của chúng tôi, đồng nghĩa với việc quý khách đã đồng ý với các điều khoản sau đây.</p>
        
        <h3>1. Trách nhiệm của người sử dụng</h3>
        <p>Quý khách phải đảm bảo đủ 18 tuổi, hoặc truy cập dưới sự giám sát của cha mẹ hay người giám hộ hợp pháp. Nghiêm cấm sử dụng bất kỳ phần nào của trang web này với mục đích thương mại hoặc nhân danh bất kỳ đối tác thứ ba nào nếu không được chúng tôi cho phép bằng văn bản.</p>
        
        <h3>2. Quyền sở hữu trí tuệ</h3>
        <p>Mọi quyền sở hữu trí tuệ (đã đăng ký hoặc chưa đăng ký), nội dung thông tin và tất cả các thiết kế, văn bản, đồ họa, phần mềm, hình ảnh, video, âm nhạc, mã nguồn đều là tài sản của BookSelf. Toàn bộ nội dung của trang web được bảo vệ bởi luật bản quyền của Việt Nam và các công ước quốc tế.</p>
        
        <h3>3. Thông tin sản phẩm và Giá cả</h3>
        <p>Chúng tôi cam kết cung cấp thông tin giá cả chính xác nhất cho người tiêu dùng. Tuy nhiên, đôi lúc vẫn có sai sót xảy ra. Trường hợp giá sản phẩm hiển thị sai do lỗi hệ thống, chúng tôi sẽ liên hệ để hướng dẫn hoặc thông báo hủy đơn hàng đó. BookSelf có quyền từ chối hoặc hủy bỏ bất kỳ đơn hàng nào có giá trị sai lệch, dù đơn hàng đó đã hay chưa được xác nhận và đã hay chưa thanh toán.</p>
        
        <h3>4. Thay đổi điều khoản</h3>
        <p>BookSelf có quyền thay đổi, chỉnh sửa, thêm hoặc lược bỏ bất kỳ phần nào trong Quy định và Điều kiện sử dụng, vào bất cứ lúc nào. Các thay đổi có hiệu lực ngay khi được đăng trên trang web mà không cần thông báo trước. Và khi quý khách tiếp tục sử dụng trang web, đồng nghĩa với việc quý khách chấp nhận những thay đổi đó.</p>
      </>
    )
  },
  'chinh-sach-bao-mat': {
    title: 'Chính sách bảo mật',
    content: (
      <>
        <p>Sự riêng tư và bảo mật thông tin cá nhân của khách hàng là ưu tiên hàng đầu tại BookSelf. Chúng tôi tuân thủ nghiêm ngặt các nguyên tắc bảo mật thông tin theo quy định của pháp luật Việt Nam.</p>
        
        <h3>1. Mục đích thu thập thông tin</h3>
        <p>BookSelf thu thập thông tin cá nhân (Họ tên, Số điện thoại, Email, Địa chỉ) chủ yếu để:</p>
        <ul>
          <li>Xử lý đơn đặt hàng và cung cấp dịch vụ giao nhận.</li>
          <li>Gửi các thông báo liên quan đến giao dịch và các chương trình khuyến mãi (nếu quý khách đăng ký nhận tin).</li>
          <li>Giải quyết các vấn đề, tranh chấp phát sinh liên quan đến việc sử dụng website.</li>
          <li>Cải thiện chất lượng dịch vụ khách hàng và tối ưu hóa trải nghiệm người dùng trên website.</li>
        </ul>
        
        <h3>2. Phạm vi sử dụng và chia sẻ thông tin</h3>
        <p>Chúng tôi cam kết <strong>TUYỆT ĐỐI KHÔNG BÁN, CHIA SẺ hay CHO THUÊ</strong> thông tin cá nhân của quý khách cho bất kỳ bên thứ ba nào vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp thật sự cần thiết sau:</p>
        <ul>
          <li>Cho đối tác vận chuyển (Tên, Số điện thoại, Địa chỉ) để thực hiện việc giao hàng.</li>
          <li>Khi có yêu cầu hợp pháp từ các cơ quan Nhà nước có thẩm quyền.</li>
        </ul>
        
        <h3>3. Bảo mật thông tin thanh toán</h3>
        <p>Hệ thống thanh toán của chúng tôi được kết nối với các đối tác cổng thanh toán đã được cấp phép hoạt động hợp pháp tại Việt Nam. Toàn bộ thông tin thẻ thanh toán của quý khách được mã hóa theo tiêu chuẩn quốc tế và BookSelf không lưu trữ thông tin này trên hệ thống của mình.</p>
      </>
    )
  },
  'chinh-sach-van-chuyen': {
    title: 'Chính sách vận chuyển',
    content: (
      <>
        <p>BookSelf áp dụng chính sách vận chuyển minh bạch và hỗ trợ tối đa chi phí cho khách hàng trên toàn quốc.</p>
        
        <h3>1. Biểu phí vận chuyển</h3>
        <ul>
          <li><strong>Miễn phí vận chuyển (Freeship):</strong> Áp dụng cho mọi đơn hàng có tổng giá trị thanh toán (sau khi trừ các mã giảm giá) từ <strong>300,000 VND</strong> trở lên.</li>
          <li><strong>Phí vận chuyển đồng giá:</strong> Với các đơn hàng dưới 300,000 VND, mức phí vận chuyển là <strong>25,000 VND</strong> áp dụng trên phạm vi toàn quốc.</li>
        </ul>
        
        <h3>2. Dịch vụ giao hàng Hỏa tốc</h3>
        <p>Hiện tại, BookSelf cung cấp dịch vụ giao hàng hỏa tốc trong vòng 2H - 4H đối với các đơn hàng có địa chỉ nhận hàng tại nội thành TP.Hồ Chí Minh và nội thành Hà Nội. Phụ phí giao hỏa tốc dao động từ 30,000 VND đến 50,000 VND tùy theo khoảng cách thực tế (Sẽ được thông báo rõ trong bước Thanh toán).</p>
        
        <h3>3. Các lưu ý khác</h3>
        <p>Trong trường hợp nhân viên giao hàng không thể liên lạc được với quý khách sau 3 lần gọi điện thoại (trong 3 ca giao hàng khác nhau), đơn hàng sẽ được tự động hoàn chuyển về kho của BookSelf. Quý khách vui lòng đặt lại đơn mới nếu vẫn có nhu cầu mua hàng.</p>
      </>
    )
  },
  'chinh-sach-doi-tra': {
    title: 'Chính sách đổi trả',
    content: (
      <>
        <p>Để đảm bảo quyền lợi của người tiêu dùng, BookSelf áp dụng chính sách đổi trả hàng hóa linh hoạt và minh bạch với khoảng thời gian lên đến 30 ngày.</p>
        
        <h3>1. Điều kiện áp dụng đổi/trả</h3>
        <p>Quý khách có thể yêu cầu đổi sang sản phẩm khác hoặc hoàn tiền trong vòng <strong>30 ngày</strong> kể từ ngày nhận hàng thành công nếu đáp ứng các tiêu chí sau:</p>
        <ul>
          <li>Sản phẩm bị lỗi kỹ thuật hoặc lỗi in ấn từ phía Nhà xuất bản (in mờ, thiếu trang, ngược trang, bung gáy...).</li>
          <li>Sản phẩm bị hư hỏng nghiêm trọng do quá trình vận chuyển (móp méo nặng, ướt gãy...).</li>
          <li>Sản phẩm giao không đúng tựa sách, không đúng phiên bản đã đặt.</li>
        </ul>
        
        <h3>2. Yêu cầu về tình trạng hàng hóa khi đổi trả</h3>
        <p>Sản phẩm gửi trả lại phải còn giữ nguyên tình trạng lúc nhận: chưa qua sử dụng, chưa có dấu hiệu đọc, viết vẽ bậy; còn nguyên tem mác, màng co (nếu có ngoại trừ trường hợp rách màng co do kiểm tra hàng) và có đầy đủ các quà tặng kèm, bookmark đi theo sách.</p>
        
        <h3>3. Chi phí vận chuyển đổi trả</h3>
        <ul>
          <li>Nếu lỗi phát sinh do BookSelf hoặc nhà sản xuất, BookSelf sẽ chịu 100% chi phí vận chuyển 2 chiều.</li>
          <li>Nếu lý do đổi trả xuất phát từ nhu cầu chủ quan của khách hàng (mua nhầm, không còn nhu cầu), quý khách vui lòng thanh toán phí vận chuyển chuyển hoàn về kho của chúng tôi.</li>
        </ul>
        
        <h3>4. Quy trình xử lý hoàn tiền</h3>
        <p>Sau khi nhận được sách hoàn trả và kiểm tra đạt yêu cầu, BookSelf sẽ tiến hành hoàn tiền vào tài khoản ngân hàng hoặc ví điện tử của quý khách trong vòng 3 - 5 ngày làm việc.</p>
      </>
    )
  },
  'quy-dinh-su-dung': {
    title: 'Quy định sử dụng',
    content: (
      <>
        <p>Văn hóa đọc và môi trường mua sắm trực tuyến lành mạnh là mục tiêu của BookSelf. Bằng việc tạo tài khoản và tham gia vào các hoạt động trên website (viết đánh giá, bình luận), quý khách phải tuân thủ các quy tắc ứng xử sau:</p>
        
        <h3>1. Về việc đăng tải nội dung</h3>
        <p>Quý khách chịu trách nhiệm hoàn toàn về các nội dung đánh giá sản phẩm của mình. Không được phép đăng tải các nội dung:</p>
        <ul>
          <li>Vi phạm pháp luật, thuần phong mỹ tục của Việt Nam.</li>
          <li>Mang tính chất bôi nhọ, xúc phạm danh dự, phân biệt chủng tộc, tôn giáo.</li>
          <li>Chứa mã độc, link rác, phần mềm gián điệp, hoặc spam quảng cáo cho các website khác.</li>
        </ul>
        
        <h3>2. Về việc bảo mật tài khoản</h3>
        <p>Quý khách không được chia sẻ thông tin đăng nhập của mình cho người khác. Nếu phát hiện tài khoản bị truy cập trái phép, hãy ngay lập tức đổi mật khẩu hoặc liên hệ với BookSelf để khóa tài khoản tạm thời.</p>
        
        <h3>3. Quyền xử lý của Ban quản trị</h3>
        <p>BookSelf có toàn quyền (nhưng không có nghĩa vụ bắt buộc) kiểm duyệt, chỉnh sửa hoặc xóa bỏ các bình luận/đánh giá vi phạm quy định mà không cần thông báo trước. Các tài khoản vi phạm nghiêm trọng có thể bị khóa vĩnh viễn và bị từ chối phục vụ trong tương lai.</p>
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
