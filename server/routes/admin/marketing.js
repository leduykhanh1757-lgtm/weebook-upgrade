// ========== ADMIN — MARKETING (COUPONS & BANNERS MYSQL) ========== //
const express = require('express');
const { pool } = require('../../database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        if (req.baseUrl.endsWith('/banners')) {
            const [banners] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC');
            return res.json({ banners });
        }
        
        const [coupons] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json({ coupons });
    } catch (err) {
        console.error('Admin Marketing GET Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.baseUrl.endsWith('/banners')) {
            const { image_url, title, description, link_url, is_active, sort_order } = req.body;
            if (!image_url) return res.status(400).json({ error: 'Thiếu hình ảnh banner' });

            const [result] = await pool.query(`
                INSERT INTO banners (image_url, title, description, link_url, is_active, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [image_url, title || '', description || '', link_url || '', is_active !== undefined ? is_active : 1, sort_order || 0]);
            return res.status(201).json({ message: 'Thêm banner thành công', id: result.insertId });
        }

        const { code, discount_type, discount_value, min_order_value, max_uses, start_date, end_date, status, user_email } = req.body;

        if (!code || !discount_type || !discount_value) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const [result] = await pool.query(`
            INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, start_date, end_date, status, user_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            code.toUpperCase(),
            discount_type,
            discount_value,
            min_order_value || 0,
            max_uses || null,
            start_date || null,
            end_date || null,
            status || 'active',
            user_email || null
        ]);
        res.status(201).json({ message: 'Tạo mã giảm giá thành công', id: result.insertId });
    } catch (err) {
        console.error('Admin Marketing POST Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Mã giảm giá đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (req.baseUrl.endsWith('/banners')) {
            return res.status(404).json({ error: 'Not found' });
        }

        const { code, discount_type, discount_value, min_order_value, max_uses, start_date, end_date } = req.body;

        if (!code || !discount_type || !discount_value) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        await pool.query(`
            UPDATE coupons 
            SET code = ?, discount_type = ?, discount_value = ?, min_order_value = ?, max_uses = ?, start_date = ?, end_date = ?
            WHERE id = ?
        `, [
            code.toUpperCase(),
            discount_type,
            discount_value,
            min_order_value || 0,
            max_uses || null,
            start_date || null,
            end_date || null,
            req.params.id
        ]);
        res.json({ message: 'Cập nhật mã giảm giá thành công' });
    } catch (err) {
        console.error('Admin Marketing PUT Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Mã giảm giá đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        if (req.baseUrl.endsWith('/banners')) {
            const { is_active } = req.body;
            await pool.query('UPDATE banners SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
            return res.json({ message: 'Cập nhật trạng thái thành công' });
        }

        const { status } = req.body;
        await pool.query('UPDATE coupons SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (req.baseUrl.endsWith('/banners')) {
            await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
            return res.json({ message: 'Xóa banner thành công' });
        }

        await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
        res.json({ message: 'Xóa mã giảm giá thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
