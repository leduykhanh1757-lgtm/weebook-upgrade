// ========== CART ROUTES ========== //
const express = require('express');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const items = db.prepare(`
            SELECT c.id, c.book_id, c.quantity, 
                   b.title, b.author, b.price, b.original_price, b.images, b.stock
            FROM cart c 
            JOIN books b ON c.book_id = b.id 
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `).all(req.user.id);

        const cartItems = items.map(item => ({
            id: item.book_id,
            quantity: item.quantity,
            title: item.title,
            author: item.author,
            price: item.price,
            originalPrice: item.original_price,
            images: JSON.parse(item.images || '[]'),
            stock: item.stock
        }));

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        res.json({ items: cartItems, total, totalItems });
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/cart
router.post('/', requireAuth, (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body;

        if (!bookId) {
            return res.status(400).json({ error: 'Thiếu thông tin sản phẩm!' });
        }

        const db = getDb();

        // Check book exists
        const book = db.prepare('SELECT id, title, stock FROM books WHERE id = ?').get(parseInt(bookId));
        if (!book) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm!' });
        }

        if (book.stock < quantity) {
            return res.status(400).json({ error: 'Số lượng vượt quá tồn kho!' });
        }

        // Upsert cart item
        const existing = db.prepare('SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ?').get(req.user.id, parseInt(bookId));

        if (existing) {
            db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
        } else {
            db.prepare('INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)').run(req.user.id, parseInt(bookId), quantity);
        }

        res.json({ message: `Đã thêm "${book.title}" vào giỏ hàng!` });
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// PUT /api/cart/:bookId
router.put('/:bookId', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const { quantity } = req.body;
        const bookId = parseInt(req.params.bookId);

        if (quantity <= 0) {
            // Remove item
            db.prepare('DELETE FROM cart WHERE user_id = ? AND book_id = ?').run(req.user.id, bookId);
            return res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng!' });
        }

        db.prepare('UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?').run(quantity, req.user.id, bookId);

        res.json({ message: 'Cập nhật giỏ hàng thành công!' });
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// DELETE /api/cart/:bookId
router.delete('/:bookId', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const bookId = parseInt(req.params.bookId);

        const book = db.prepare('SELECT title FROM books WHERE id = ?').get(bookId);
        db.prepare('DELETE FROM cart WHERE user_id = ? AND book_id = ?').run(req.user.id, bookId);

        res.json({ message: book ? `Đã xóa "${book.title}" khỏi giỏ hàng!` : 'Đã xóa sản phẩm!' });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
