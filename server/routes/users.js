const express = require('express');
const { getDb } = require('../database');

const router = express.Router();

// GET /api/users/:id
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const userId = parseInt(req.params.id);
        
        // Only select safe, public fields
        const user = db.prepare('SELECT id, name, avatar, gender, created_at FROM users WHERE id = ?').get(userId);

        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng!' });
        }

        const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews WHERE user_id = ?').get(userId).count;

        res.json({ user: { ...user, review_count: reviewCount } });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
