// ========== ORDERS ROUTES ========== //
const express = require('express');
const { getDb } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders - Create order
router.post('/', requireAuth, (req, res) => {
    try {
        const { fullName, phone, email, city, district, ward, address, payment, notes, shippingCost, buyNowItem } = req.body;

        if (!fullName || !phone || !address) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        const db = getDb();

        // Get cart items or buyNow item
        let cartItems = [];
        if (buyNowItem) {
            const book = db.prepare('SELECT id as book_id, title, author, price, images, stock FROM books WHERE id = ?').get(buyNowItem.bookId);
            if (!book) {
                return res.status(400).json({ error: 'Sản phẩm không tồn tại!' });
            }
            cartItems = [{ ...book, quantity: buyNowItem.quantity }];
        } else {
            cartItems = db.prepare(`
                SELECT c.book_id, c.quantity, b.title, b.author, b.price, b.images, b.stock
                FROM cart c JOIN books b ON c.book_id = b.id
                WHERE c.user_id = ?
            `).all(req.user.id);

            if (cartItems.length === 0) {
                return res.status(400).json({ error: 'Giỏ hàng trống!' });
            }
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

        const calculatedShipping = Number(shippingCost) || 0;
        const total = subtotal + calculatedShipping;

        // Generate Order Code
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderCode = `WB${dateStr}${randomStr}`;

        // Create order in transaction
        const createOrder = db.transaction(() => {
            const orderResult = db.prepare(`
                INSERT INTO orders (order_code, user_id, full_name, phone, email, city, district, ward, address, payment_method, notes, subtotal, shipping_cost, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(orderCode, req.user.id, fullName, phone, email || null, city || null, district || null, ward || null, address, payment || 'cod', notes || null, subtotal, calculatedShipping, total);

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

            // Clear cart only if not a direct buy
            if (!buyNowItem) {
                db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
            }

            return { orderId, orderCode };
        });

        const { orderId, orderCode: finalOrderCode } = createOrder();

        res.status(201).json({
            message: 'Đặt hàng thành công!',
            orderId,
            orderCode: finalOrderCode,
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

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const orderId = parseInt(req.params.id);
        
        const order = db.prepare('SELECT status FROM orders WHERE id = ? AND user_id = ?').get(orderId, req.user.id);
        
        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng!' });
        }
        
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận!' });
        }

        db.transaction(() => {
            // Update order status
            db.prepare("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(orderId);
            
            // Return stock
            const items = db.prepare('SELECT book_id, quantity FROM order_items WHERE order_id = ?').all(orderId);
            const updateStock = db.prepare('UPDATE books SET stock = stock + ? WHERE id = ?');
            for (const item of items) {
                updateStock.run(item.quantity, item.book_id);
            }
        })();

        res.json({ message: 'Hủy đơn hàng thành công!' });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
