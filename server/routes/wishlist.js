// ========== WISHLIST ROUTES ========== //
const express = require('express');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/wishlist
router.get('/', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const items = db.prepare(`
            SELECT w.book_id, b.title, b.author, b.price, b.original_price, b.images, b.rating, b.review_count
            FROM wishlist w 
            JOIN books b ON w.book_id = b.id 
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `).all(req.user.id);

        const wishlistItems = items.map(item => ({
            id: item.book_id,
            title: item.title,
            author: item.author,
            price: item.price,
            originalPrice: item.original_price,
            images: JSON.parse(item.images || '[]'),
            rating: item.rating,
            reviewCount: item.review_count
        }));

        res.json({ items: wishlistItems });
    } catch (err) {
        console.error('Get wishlist error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/wishlist/:bookId
router.post('/:bookId', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const bookId = parseInt(req.params.bookId);

        const book = db.prepare('SELECT id, title FROM books WHERE id = ?').get(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm!' });
        }

        // Check if already in wishlist
        const existing = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND book_id = ?').get(req.user.id, bookId);
        if (existing) {
            return res.status(400).json({ error: `"${book.title}" đã có trong danh sách yêu thích!` });
        }

        db.prepare('INSERT INTO wishlist (user_id, book_id) VALUES (?, ?)').run(req.user.id, bookId);

        res.json({ message: `Đã thêm "${book.title}" vào danh sách yêu thích!` });
    } catch (err) {
        console.error('Add to wishlist error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// DELETE /api/wishlist/:bookId
router.delete('/:bookId', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const bookId = parseInt(req.params.bookId);

        db.prepare('DELETE FROM wishlist WHERE user_id = ? AND book_id = ?').run(req.user.id, bookId);

        res.json({ message: 'Đã xóa khỏi danh sách yêu thích!' });
    } catch (err) {
        console.error('Remove from wishlist error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
