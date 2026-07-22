// ========== CART ROUTES (MYSQL) ========== //
const express = require('express');
const { pool } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', requireAuth, async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT c.id, c.book_id, c.quantity, 
                   b.title, b.author, b.price, b.original_price, b.images, b.stock
            FROM cart c 
            JOIN books b ON c.book_id = b.id 
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `, [req.user.id]);

        const cartItems = items.map(item => {
            let images = [];
            try {
                images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
            } catch (e) {
                images = [];
            }
            return {
                id: item.book_id,
                quantity: item.quantity,
                title: item.title,
                author: item.author,
                price: item.price,
                originalPrice: item.original_price,
                images,
                stock: item.stock
            };
        });

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        res.json({ items: cartItems, total, totalItems });
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/cart
router.post('/', requireAuth, async (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body;

        if (!bookId) {
            return res.status(400).json({ error: 'Thiếu thông tin sản phẩm!' });
        }

        const [bookRows] = await pool.query('SELECT id, title, stock FROM books WHERE id = ?', [parseInt(bookId)]);
        const book = bookRows[0];
        if (!book) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm!' });
        }

        if (book.stock < quantity) {
            return res.status(400).json({ error: 'Số lượng vượt quá tồn kho!' });
        }

        const [existingRows] = await pool.query('SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ?', [req.user.id, parseInt(bookId)]);
        const existing = existingRows[0];

        if (existing) {
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
        } else {
            await pool.query('INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)', [req.user.id, parseInt(bookId), quantity]);
        }

        res.json({ message: `Đã thêm "${book.title}" vào giỏ hàng!` });
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// PUT /api/cart/:bookId
router.put('/:bookId', requireAuth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const bookId = parseInt(req.params.bookId);

        if (quantity <= 0) {
            await pool.query('DELETE FROM cart WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);
            return res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng!' });
        }

        await pool.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?', [quantity, req.user.id, bookId]);

        res.json({ message: 'Cập nhật giỏ hàng thành công!' });
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// DELETE /api/cart/:bookId
router.delete('/:bookId', requireAuth, async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId);

        const [bookRows] = await pool.query('SELECT title FROM books WHERE id = ?', [bookId]);
        const book = bookRows[0];
        await pool.query('DELETE FROM cart WHERE user_id = ? AND book_id = ?', [req.user.id, bookId]);

        res.json({ message: book ? `Đã xóa "${book.title}" khỏi giỏ hàng!` : 'Đã xóa sản phẩm!' });
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
