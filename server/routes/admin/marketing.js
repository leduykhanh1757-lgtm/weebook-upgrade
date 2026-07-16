// ========== ADMIN — MARKETING (COUPONS & BANNERS) ========== //
const express = require('express');
const { getDb } = require('../../database');

const router = express.Router();

// --- Coupons ---
// Check if the request came through /coupons or /banners based on baseUrl
// We mount this router for both /coupons and /banners in index.js, but since their base paths differ,
// we can use req.baseUrl.

// We will handle them based on the path. The main router handles mounting.
// Instead of one router handling both based on baseUrl, let's just make routes for both,
// but since the mount point strips the prefix, we will define them relative to '/'
// Wait, the index.js mounts:
// router.use('/coupons', adminOnly, marketingRouter);
// router.use('/banners', adminOnly, marketingRouter);
// This means BOTH /coupons and /banners will hit this router's '/' path. This is a bit problematic.
// Let's modify index.js to just mount:
// router.use('/marketing', adminOnly, marketingRouter);
// But frontend expects `/admin/coupons` and `/admin/banners`.
// So let's just define the routes clearly without base paths.

// Actually, I'll export a router that handles both by redefining them explicitly.
// Or I can just check req.baseUrl like I did for authors/publishers.

router.get('/', (req, res) => {
    try {
        const db = getDb();
        if (req.baseUrl.endsWith('/banners')) {
            const banners = db.prepare('SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC').all();
            return res.json({ banners });
        }
        
        // Defaults to coupons
        const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
        res.json({ coupons });
    } catch (err) {
        console.error('Admin Marketing GET Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/', (req, res) => {
    try {
        const db = getDb();
        if (req.baseUrl.endsWith('/banners')) {
            const { image_url, title, description, link_url, is_active, sort_order } = req.body;
            if (!image_url) return res.status(400).json({ error: 'Thiếu hình ảnh banner' });

            const stmt = db.prepare(`
                INSERT INTO banners (image_url, title, description, link_url, is_active, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(image_url, title || '', description || '', link_url || '', is_active !== undefined ? is_active : 1, sort_order || 0);
            return res.status(201).json({ message: 'Thêm banner thành công', id: result.lastInsertRowid });
        }

        // Defaults to coupons
        const { code, discount_type, discount_value, min_order_value, max_uses, start_date, end_date, status, user_email } = req.body;

        if (!code || !discount_type || !discount_value) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const stmt = db.prepare(`
            INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, start_date, end_date, status, user_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            code.toUpperCase(),
            discount_type,
            discount_value,
            min_order_value || 0,
            max_uses || null,
            start_date || null,
            end_date || null,
            status || 'active',
            user_email || null
        );
        res.status(201).json({ message: 'Tạo mã giảm giá thành công', id: result.lastInsertRowid });
    } catch (err) {
        console.error('Admin Marketing POST Error:', err);
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Mã giảm giá đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const db = getDb();
        if (req.baseUrl.endsWith('/banners')) {
            // Note: the original code didn't have a full update for banners, only status update.
            return res.status(404).json({ error: 'Not found' });
        }

        // Defaults to coupons
        const { code, discount_type, discount_value, min_order_value, max_uses, start_date, end_date } = req.body;

        if (!code || !discount_type || !discount_value) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const stmt = db.prepare(`
            UPDATE coupons 
            SET code = ?, discount_type = ?, discount_value = ?, min_order_value = ?, max_uses = ?, start_date = ?, end_date = ?
            WHERE id = ?
        `);
        stmt.run(
            code.toUpperCase(),
            discount_type,
            discount_value,
            min_order_value || 0,
            max_uses || null,
            start_date || null,
            end_date || null,
            req.params.id
        );
        res.json({ message: 'Cập nhật mã giảm giá thành công' });
    } catch (err) {
        console.error('Admin Marketing PUT Error:', err);
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Mã giảm giá đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id/status', (req, res) => {
    try {
        const db = getDb();
        if (req.baseUrl.endsWith('/banners')) {
            const { is_active } = req.body;
            db.prepare('UPDATE banners SET is_active = ? WHERE id = ?').run(is_active, req.params.id);
            return res.json({ message: 'Cập nhật trạng thái thành công' });
        }

        // Defaults to coupons
        const { status } = req.body;
        db.prepare('UPDATE coupons SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const db = getDb();
        if (req.baseUrl.endsWith('/banners')) {
            db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
            return res.json({ message: 'Xóa banner thành công' });
        }

        // Defaults to coupons
        db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
        res.json({ message: 'Xóa mã giảm giá thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
