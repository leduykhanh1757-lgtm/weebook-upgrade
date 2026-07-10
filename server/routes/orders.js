// ========== ORDERS ROUTES ========== //
const express = require('express');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders - Create order
router.post('/', requireAuth, (req, res) => {
    try {
        const { fullName, phone, email, city, district, address, delivery, payment, notes } = req.body;

        if (!fullName || !phone || !address) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        const db = getDb();

        // Get cart items
        const cartItems = db.prepare(`
            SELECT c.book_id, c.quantity, b.title, b.author, b.price, b.images, b.stock
            FROM cart c JOIN books b ON c.book_id = b.id
            WHERE c.user_id = ?
        `).all(req.user.id);

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Giỏ hàng trống!' });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = cartItems.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return {
                bookId: item.book_id,
                title: item.title,
                author: item.author,
                price: item.price,
                quantity: item.quantity,
                total: itemTotal,
                image: JSON.parse(item.images || '[]')[0] || ''
            };
        });

        const shippingCost = delivery === 'express' ? 30000 : 0;
        const total = subtotal + shippingCost;

        // Create order in transaction
        const createOrder = db.transaction(() => {
            const orderResult = db.prepare(`
                INSERT INTO orders (user_id, full_name, phone, email, city, district, address, delivery_method, payment_method, notes, subtotal, shipping_cost, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(req.user.id, fullName, phone, email || null, city || null, district || null, address, delivery || 'standard', payment || 'cod', notes || null, subtotal, shippingCost, total);

            const orderId = orderResult.lastInsertRowid;

            // Insert order items
            const insertItem = db.prepare(
                'INSERT INTO order_items (order_id, book_id, title, author, price, quantity, total, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );

            const updateStock = db.prepare(
                'UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?'
            );

            for (const item of orderItems) {
                insertItem.run(orderId, item.bookId, item.title, item.author, item.price, item.quantity, item.total, item.image);
                updateStock.run(item.quantity, item.bookId, item.quantity);
            }

            // Clear cart
            db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);

            return orderId;
        });

        const orderId = createOrder();

        res.status(201).json({
            message: 'Đặt hàng thành công!',
            orderId,
            total
        });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/orders - Get user's orders
router.get('/', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const orders = db.prepare(`
            SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
        `).all(req.user.id);

        // Get items for each order
        const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

        const ordersWithItems = orders.map(order => ({
            ...order,
            items: getItems.all(order.id)
        }));

        res.json({ orders: ordersWithItems });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/orders/:id - Get order details
router.get('/:id', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(parseInt(req.params.id), req.user.id);

        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng!' });
        }

        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

        res.json({ order: { ...order, items } });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
