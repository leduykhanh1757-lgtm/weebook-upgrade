// ========== MARKETING ROUTES (MYSQL) ========== //
const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { sendNewsletterWelcomeEmail } = require('../utils/email');

// GET /api/marketing/banners
router.get('/banners', async (req, res) => {
    try {
        const [banners] = await pool.query('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC');
        res.json({ banners });
    } catch (err) {
        console.error('Marketing Banners Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// GET /api/marketing/coupons
router.get('/coupons', async (req, res) => {
    try {
        const { email } = req.query;
        const today = new Date().toISOString().slice(0, 10);
        
        const query = `
            SELECT code, discount_type, discount_value, min_order_value, end_date
            FROM coupons 
            WHERE status = 'active'
            AND (max_uses IS NULL OR used_count < max_uses)
            AND (start_date IS NULL OR start_date <= ?)
            AND (end_date IS NULL OR end_date >= ?)
            AND (user_email IS NULL ${email ? 'OR user_email = ?' : ''})
            ORDER BY created_at DESC
        `;
        
        const params = email ? [today, today, email] : [today, today];
        const [coupons] = await pool.query(query, params);
        
        res.json({ coupons });
    } catch (err) {
        console.error('Marketing Coupons Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// POST /api/marketing/coupon/validate
router.post('/coupon/validate', async (req, res) => {
    try {
        const { code, subtotal, email } = req.body;
        if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' });
        if (subtotal === undefined) return res.status(400).json({ error: 'Thiếu tổng tiền đơn hàng' });

        const [rows] = await pool.query('SELECT * FROM coupons WHERE LOWER(code) = LOWER(?)', [code]);
        const coupon = rows[0];

        if (!coupon) {
            return res.status(404).json({ error: 'Mã giảm giá không hợp lệ' });
        }
        if (coupon.status !== 'active') {
            return res.status(400).json({ error: 'Mã giảm giá đã bị vô hiệu hóa' });
        }
        if (coupon.user_email && coupon.user_email !== email) {
            return res.status(400).json({ error: 'Mã giảm giá này không dành cho email của bạn!' });
        }
        
        const now = new Date();
        if (coupon.start_date && new Date(coupon.start_date) > now) {
            return res.status(400).json({ error: 'Mã giảm giá chưa đến ngày áp dụng' });
        }
        if (coupon.end_date && new Date(coupon.end_date) < now) {
            return res.status(400).json({ error: 'Mã giảm giá đã hết hạn' });
        }

        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ error: 'Mã giảm giá đã hết số lượng' });
        }

        if (subtotal < coupon.min_order_value) {
            return res.status(400).json({ error: `Đơn hàng tối thiểu để áp dụng mã là ${new Intl.NumberFormat('vi-VN').format(coupon.min_order_value)}đ` });
        }

        let discount = 0;
        if (coupon.discount_type === 'percent') {
            discount = subtotal * (coupon.discount_value / 100);
        } else {
            discount = coupon.discount_value;
        }

        if (discount > subtotal) {
            discount = subtotal;
        }

        res.json({
            message: 'Áp dụng mã giảm giá thành công',
            coupon: {
                code: coupon.code,
                discount_amount: discount
            }
        });

    } catch (err) {
        console.error('Marketing Coupon Validate Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// POST /api/marketing/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Vui lòng cung cấp email' });

        const [existing] = await pool.query('SELECT id FROM subscribers WHERE LOWER(email) = LOWER(?)', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email này đã được đăng ký nhận khuyến mãi từ trước!' });
        }

        await pool.query('INSERT INTO subscribers (email) VALUES (?)', [email]);

        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const couponCode = 'WLCM-' + randomString;

        await pool.query(`
            INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, user_email)
            VALUES (?, 'percent', 10, 0, 1, ?)
        `, [couponCode, email]);

        const emailSent = await sendNewsletterWelcomeEmail(email, couponCode);
        if (!emailSent) {
            console.error('Failed to send newsletter email to:', email);
        }

        res.json({ message: 'Cảm ơn bạn đã đăng ký! Hãy kiểm tra email để nhận quà nhé.' });
    } catch (err) {
        console.error('Marketing Subscribe Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
