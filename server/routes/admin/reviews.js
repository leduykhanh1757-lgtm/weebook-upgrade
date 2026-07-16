// ========== ADMIN — REVIEWS MANAGEMENT ========== //
const express = require('express');
const { getDb } = require('../../database');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const db = getDb();
        const reviews = db.prepare(`
            SELECT r.id, r.rating, r.comment, r.created_at, r.status, u.name as user_name, b.title as book_title
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            JOIN books b ON r.book_id = b.id
            ORDER BY r.created_at DESC
        `).all();
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'approved', 'hidden'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const db = getDb();
        db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
