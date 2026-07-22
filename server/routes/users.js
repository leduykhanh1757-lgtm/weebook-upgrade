// ========== USERS ROUTES (MYSQL) ========== //
const express = require('express');
const { pool } = require('../database');

const router = express.Router();

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        const [userRows] = await pool.query('SELECT id, name, avatar, created_at, helpful_votes FROM users WHERE id = ?', [userId]);
        const user = userRows[0];

        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng!' });
        }

        const [reviewCountRows] = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE user_id = ?', [userId]);
        const reviewCount = reviewCountRows[0].count;

        const [recentReviews] = await pool.query(`
            SELECT r.id, r.rating, r.comment, r.created_at, b.id as book_id, b.title as book_title, b.images as book_images 
            FROM reviews r 
            JOIN books b ON r.book_id = b.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC 
            LIMIT 5
        `, [userId]);

        const [favRows] = await pool.query(`
            SELECT b.category, COUNT(*) as count 
            FROM reviews r 
            JOIN books b ON r.book_id = b.id 
            WHERE r.user_id = ? 
            GROUP BY b.category 
            ORDER BY count DESC 
            LIMIT 1
        `, [userId]);
        const favCategories = favRows.map(c => c.category);

        let memberRank = 'Thành viên mới';
        if (reviewCount >= 15) {
            memberRank = 'Top Reviewer';
        } else if (reviewCount >= 5) {
            memberRank = 'Độc giả tích cực';
        } else if (reviewCount > 0) {
            memberRank = 'Thành viên Đồng';
        }

        res.json({ 
            user: { 
                ...user, 
                review_count: reviewCount,
                member_rank: memberRank,
                favorite_categories: favCategories,
                recent_reviews: recentReviews
            } 
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
