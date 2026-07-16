const express = require('express');
const router = express.Router();

const FAQ = [
    {
        keywords: ['phí', 'ship', 'vận chuyển', 'giao hàng'],
        answer: 'Phí vận chuyển mặc định của cửa hàng là 30.000đ. Đặc biệt, đơn hàng từ 300.000đ trở lên sẽ được miễn phí vận chuyển trên toàn quốc ạ!'
    },
    {
        keywords: ['đổi', 'trả', 'hỏng', 'lỗi', 'rách', 'sai'],
        answer: 'Cửa hàng hỗ trợ đổi trả MIỄN PHÍ trong vòng 7 ngày đối với sách bị lỗi in ấn, rách hỏng do vận chuyển hoặc giao sai. Quý khách vui lòng cung cấp video mở kiện hàng nhé.'
    },
    {
        keywords: ['giờ', 'mở cửa', 'đóng cửa', 'thời gian'],
        answer: 'Cửa hàng trực tuyến BookSelf hoạt động 24/7 để bạn mua sắm. Đội ngũ CSKH sẽ hỗ trợ bạn trực tiếp từ 8:00 đến 22:00 tất cả các ngày trong tuần.'
    },
    {
        keywords: ['thanh toán', 'chuyển khoản', 'cod', 'thẻ', 'atm'],
        answer: 'Chúng tôi hỗ trợ cả 2 hình thức: Thanh toán khi nhận hàng (COD) và Chuyển khoản ngân hàng. Bạn có thể chọn phương thức phù hợp ở bước Thanh toán.'
    },
    {
        keywords: ['địa chỉ', 'ở đâu', 'cửa hàng', 'shop', 'đến mua'],
        answer: 'Hiện tại BookSelf chỉ bán online qua website để tối ưu chi phí và mang lại mức giá tốt nhất cho khách hàng. Chúng tôi giao hàng tận nơi trên toàn quốc!'
    },
    {
        keywords: ['giảm giá', 'khuyến mãi', 'voucher', 'sale', 'mã', 'coupon'],
        answer: 'BookSelf thường xuyên có mã giảm giá vào các dịp lễ! Bạn hãy kiểm tra phần "Mã giảm giá" hoặc Banner ở Trang chủ để lấy mã ưu đãi mới nhất nhé.'
    },
    {
        keywords: ['đăng ký', 'tài khoản', 'tạo mới', 'lập nick'],
        answer: 'Để đăng ký tài khoản, bạn chỉ cần bấm vào "Đăng nhập / Đăng ký" ở góc trên cùng bên phải, sau đó chọn tab Đăng ký và điền thông tin là xong ạ.'
    },
    {
        keywords: ['quên', 'mật khẩu', 'pass', 'lấy lại'],
        answer: 'Nếu quên mật khẩu, bạn vào trang Đăng nhập, bấm "Quên mật khẩu?" và điền email. Chúng mình sẽ gửi 1 mã xác nhận gồm 6 số về email để bạn đặt lại mật khẩu an toàn.'
    },
    {
        keywords: ['kiểm tra', 'theo dõi', 'đang ở đâu', 'đơn hàng', 'chưa nhận'],
        answer: 'Bạn có thể xem trạng thái đơn hàng (Đang xử lý, Đang giao...) bằng cách đăng nhập và vào phần "Đơn hàng của tôi" trong menu Tài khoản cá nhân.'
    },
    {
        keywords: ['chào', 'hello', 'hi', 'ê', 'hey'],
        answer: 'Xin chào! Mình là Bot hỗ trợ của BookSelf. Mình có thể giúp gì cho bạn hôm nay?'
    },
    {
        keywords: ['cảm ơn', 'thanks', 'thank you', 'ok', 'được rồi'],
        answer: 'Dạ, không có chi! Chúc bạn có những phút giây thư giãn tuyệt vời bên những trang sách tại BookSelf nhé!'
    },
    {
        keywords: ['tạm biệt', 'bye', 'pp', 'đi đây'],
        answer: 'Tạm biệt bạn! Hẹn gặp lại bạn lần sau. Chúc bạn một ngày tốt lành!'
    },
    {
        keywords: ['bạn là ai', 'là gì', 'tên gì', 'bot'],
        answer: 'Mình là Trợ lý ảo tự động của BookSelf. Dù chỉ là một đoạn code nhưng mình đang học hỏi mỗi ngày để phục vụ bạn tốt hơn!'
    },
    {
        keywords: ['ngu', 'dở', 'chán', 'tệ', 'kém'],
        answer: 'Xin lỗi vì đã làm bạn không hài lòng 😥. Mình vẫn đang trong quá trình học hỏi. Bạn vui lòng liên hệ Hotline ở chân trang để nhân viên thật hỗ trợ bạn nhé!'
    }
];

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword matching
    for (const item of FAQ) {
        if (item.keywords.some(kw => lowerMessage.includes(kw))) {
            return item.answer;
        }
    }
    
    return 'Xin lỗi, tôi chưa hiểu rõ ý của bạn. Bạn vui lòng liên hệ Hotline ở phần chân trang để được nhân viên hỗ trợ trực tiếp nhé!';
}

router.post('/', (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const reply = getBotResponse(message);
        
        // Add a slight artificial delay to make it feel more "human-like"
        setTimeout(() => {
            res.json({ reply });
        }, 800);

    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
