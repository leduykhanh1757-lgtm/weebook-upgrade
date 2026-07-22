// ========== WISHLIST ROUTES (MYSQL) ========== //
const express = require('express');
const { pool } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/wishlist
router.get('/', requireAuth, async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT w.book_id, b.title, b.author, b.price, b.original_price, b.images, b.rating, b.review_count
            FROM wishlist w 
            JOIN books b ON w.book_id = b.id 
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [req.user.id]);

        const wishlistItems = items.map(item => {
            let images = [];
            try {
                images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
            } catch (e) {
                images = [];
            }
            return {
                id: item.book_id,
                title: item.title,
                author: item.author,
                price: item.price,
                originalPrice: item.original_price,
                images,
                rating: item.rating,
                reviewCount: item.review_count
            };
        });

        res.json({ items: wishlistItems });
    } catch (err) {
        console.error('Get wishlist error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/wishlist/:bookId
router.post('/:bookId', requireAuth, async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId);

        const [bookRows] = await pool.query('SELECT id, title FROM books WHERE id = ?', [bookId]);
        const book = bookRows[0];
        if (!book) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm!' });
        }

        const [existingRows] = await pool.query('SELECT id FROM wishlist WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
        if (existingRows.length > 0) {
            return res.status(400).json({ error: `"${book.title}" đã có trong danh sách yêu thích!` });
        }

        await pool.query('INSERT INTO wishlist (user_id, book_id) VALUES (?, ?)', [req.user.id, bookId]);

        res.json({ message: `Đã thêm "${book.title}" vào danh sách yêu thích!` });
    } catch (err) {
        console.error('Add to wishlist error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// DELETE /api/wishlist/:bookId
router.delete('/:bookId', requireAuth, async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId);

        await pool.query('DELETE FROM wishlist WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);

        res.json({ message: 'Đã xóa khỏi danh sách yêu thích!' });
    } catch (err) {
        console.error('Remove from wishlist error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
