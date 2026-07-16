require('dotenv').config();
const nodemailer = require('nodemailer');

const createTransporter = async () => {
    // If SMTP credentials are provided, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 465,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Otherwise, create an Ethereal test account automatically
    console.log('No SMTP credentials found in .env, falling back to Ethereal Email for testing...');
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user, 
            pass: testAccount.pass 
        }
    });
};

const sendVerificationEmail = async (toEmail, code) => {
    try {
        const transporter = await createTransporter();
        
        const mailOptions = {
            from: '"BookSelf Hỗ Trợ" <noreply@bookself.com>',
            to: toEmail,
            subject: 'Mã xác nhận khôi phục mật khẩu - BookSelf',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #0284c7; text-align: center;">Khôi phục mật khẩu</h2>
                    <p>Xin chào,</p>
                    <p>Bạn (hoặc ai đó) vừa yêu cầu khôi phục mật khẩu cho tài khoản liên kết với email này tại <strong>BookSelf</strong>.</p>
                    <p>Dưới đây là mã xác nhận (Code) của bạn. Vui lòng nhập mã này trên trang web để đặt lại mật khẩu:</p>
                    <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${code}</span>
                    </div>
                    <p style="color: #ef4444; font-size: 0.9em;">Lưu ý: Mã xác nhận này sẽ hết hạn trong vòng 15 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 0.8em; color: #64748b; text-align: center;">Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        // If using Ethereal, log the URL to view the message
        if (info.messageId && info.messageId.includes('ethereal')) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendNewsletterWelcomeEmail = async (toEmail, couponCode) => {
    try {
        const transporter = await createTransporter();
        
        const mailOptions = {
            from: '"BookSelf Khuyến Mãi" <marketing@bookself.com>',
            to: toEmail,
            subject: 'Chào mừng bạn đến với BookSelf - Tặng mã giảm giá 10%',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #0284c7; margin: 0;">BookSelf</h1>
                        <p style="color: #64748b; margin-top: 5px;">Thế giới tri thức trong tầm tay</p>
                    </div>
                    
                    <h2 style="color: #0f172a;">Chào mừng bạn! 🎉</h2>
                    <p>Cảm ơn bạn đã đăng ký nhận bản tin khuyến mãi từ BookSelf. Từ nay, bạn sẽ là một trong những người đầu tiên nhận được thông báo về các đợt sale xả kho và sách mới nhất!</p>
                    <p>Như một món quà làm quen, BookSelf xin tặng bạn mã giảm giá độc quyền <strong>10%</strong> áp dụng cho đơn hàng bất kỳ:</p>
                    
                    <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                        <span style="font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #166534;">${couponCode}</span>
                    </div>
                    
                    <p style="color: #ef4444; font-size: 0.9em; font-weight: bold;">⚠️ Lưu ý quan trọng:</p>
                    <ul style="color: #ef4444; font-size: 0.9em;">
                        <li>Mã giảm giá này là ĐỘC QUYỀN dành riêng cho bạn.</li>
                        <li>Mã chỉ có giá trị sử dụng <strong>01 lần duy nhất</strong>. Khi mã đã được áp dụng mua hàng, nó sẽ hết hạn ngay lập tức.</li>
                        <li>Đừng chia sẻ mã này cho người khác nhé!</li>
                    </ul>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 0.8em; color: #64748b; text-align: center;">Nếu bạn không đăng ký, vui lòng bỏ qua email này.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        if (info.messageId && info.messageId.includes('ethereal')) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return true;
    } catch (error) {
        console.error('Error sending newsletter email:', error);
        return false;
    }
};

module.exports = {
    sendVerificationEmail,
    sendNewsletterWelcomeEmail
};
