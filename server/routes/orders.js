// ========== ORDERS ROUTES (MYSQL) ========== //
const express = require('express');
const { pool } = require('../database');
const { requireAuth } = require('../middleware/auth');
const { ORDER_STATUS } = require('../constants/statusEnum');

const router = express.Router();

// POST /api/orders - Create order
router.post('/', requireAuth, async (req, res) => {
    try {
        const { fullName, phone, email, city, district, ward, address, payment, notes, shippingCost, buyNowItem, couponCode } = req.body;

        if (!fullName || !phone || !address) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        // Get cart items or buyNow item
        let cartItems = [];
        if (buyNowItem) {
            const [bookRows] = await pool.query('SELECT id as book_id, title, author, price, images, stock FROM books WHERE id = ?', [buyNowItem.bookId]);
            const book = bookRows[0];
            if (!book) {
                return res.status(400).json({ error: 'Sản phẩm không tồn tại!' });
            }
            cartItems = [{ ...book, quantity: buyNowItem.quantity }];
        } else {
            const [rows] = await pool.query(`
                SELECT c.book_id, c.quantity, b.title, b.author, b.price, b.images, b.stock
                FROM cart c JOIN books b ON c.book_id = b.id
                WHERE c.user_id = ?
            `, [req.user.id]);
            cartItems = rows;

            if (cartItems.length === 0) {
                return res.status(400).json({ error: 'Giỏ hàng trống!' });
            }
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = cartItems.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            let firstImage = '';
            try {
                const imgArr = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
                firstImage = imgArr[0] || '';
            } catch (e) {
                firstImage = '';
            }

            return {
                bookId: item.book_id,
                title: item.title,
                author: item.author,
                price: item.price,
                quantity: item.quantity,
                total: itemTotal,
                image: firstImage
            };
        });

        const calculatedShipping = Number(shippingCost) || 0;
        let discount = 0;
        let validCoupon = null;

        // Re-validate coupon
        if (couponCode) {
            const [userRows] = await pool.query('SELECT email FROM users WHERE id = ?', [req.user.id]);
            const userEmail = userRows[0]?.email;
            const [couponRows] = await pool.query('SELECT * FROM coupons WHERE LOWER(code) = LOWER(?)', [couponCode]);
            const coupon = couponRows[0];

            if (coupon && coupon.status === 'active') {
                const now = new Date();
                const isValidDate = (!coupon.start_date || new Date(coupon.start_date) <= now) && (!coupon.end_date || new Date(coupon.end_date) >= now);
                const isValidUses = coupon.max_uses === null || coupon.used_count < coupon.max_uses;
                const isValidMinOrder = subtotal >= coupon.min_order_value;
                const isEmailValid = !coupon.user_email || coupon.user_email === userEmail;

                if (isValidDate && isValidUses && isValidMinOrder && isEmailValid) {
                    validCoupon = coupon;
                    if (coupon.discount_type === 'percent') {
                        discount = subtotal * (coupon.discount_value / 100);
                    } else {
                        discount = coupon.discount_value;
                    }
                    if (discount > subtotal) discount = subtotal;
                }
            }
        }

        const total = subtotal + calculatedShipping - discount;

        // Generate Order Code
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderCode = `WB${dateStr}${randomStr}`;

        // Create order inside MySQL transaction
        const conn = await pool.getConnection();
        let orderId;
        try {
            await conn.beginTransaction();

            const [orderResult] = await conn.query(`
                INSERT INTO orders (order_code, user_id, full_name, phone, email, city, district, ward, address, payment_method, notes, subtotal, shipping_cost, discount_amount, total, coupon_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [orderCode, req.user.id, fullName, phone, email || null, city || null, district || null, ward || null, address, payment || 'cod', notes || null, subtotal, calculatedShipping, discount, total, validCoupon ? validCoupon.code : null]);

            orderId = orderResult.insertId;

            for (const item of orderItems) {
                await conn.query(
                    'INSERT INTO order_items (order_id, book_id, title, author, price, quantity, total, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [orderId, item.bookId, item.title, item.author, item.price, item.quantity, item.total, item.image]
                );
                await conn.query(
                    'UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?',
                    [item.quantity, item.bookId, item.quantity]
                );
            }

            if (validCoupon) {
                await conn.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [validCoupon.id]);
            }

            if (!buyNowItem) {
                await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
            }

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        res.status(201).json({
            message: 'Đặt hàng thành công!',
            orderId,
            orderCode,
            total
        });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/orders - Get user's orders
router.get('/', requireAuth, async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
        `, [req.user.id]);

        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            return {
                ...order,
                items
            };
        }));

        res.json({ orders: ordersWithItems });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/orders/:id - Get order details
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [parseInt(req.params.id), req.user.id]);
        const order = rows[0];

        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng!' });
        }

        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

        res.json({ order: { ...order, items } });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', requireAuth, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        
        const [rows] = await pool.query('SELECT status FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
        const order = rows[0];
        
        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng!' });
        }
        
        if (order.status !== ORDER_STATUS.PENDING) {
            return res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận!' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [ORDER_STATUS.CANCELLED, orderId]);
            
            const [items] = await conn.query('SELECT book_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
            for (const item of items) {
                await conn.query('UPDATE books SET stock = stock + ? WHERE id = ?', [item.quantity, item.book_id]);
            }

            await conn.commit();
        } catch (txErr) {
            await conn.rollback();
            throw txErr;
        } finally {
            conn.release();
        }

        res.json({ message: 'Hủy đơn hàng thành công!' });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
