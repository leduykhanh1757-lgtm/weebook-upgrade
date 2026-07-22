// ========== ADMIN — ORDERS MANAGEMENT (MYSQL) ========== //
const express = require('express');
const { pool } = require('../../database');
const { ORDER_STATUS, VALID_STATUSES } = require('../../constants/statusEnum');

const router = express.Router();

// GET /admin/orders
router.get('/', async (req, res) => {
    try {
        const [orders] = await pool.query(
            'SELECT id, order_code, user_id, full_name, phone, city, total, status, created_at, payment_method FROM orders ORDER BY created_at DESC'
        );
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// GET /admin/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        const order = orderRows[0];
        if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
        res.json({ order, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// PUT /admin/orders/:id/status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const id = req.params.id;

        const [orderRows] = await pool.query('SELECT status, user_id FROM orders WHERE id = ?', [id]);
        const currentOrder = orderRows[0];
        if (!currentOrder) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        if (currentOrder.status === ORDER_STATUS.CANCELLED) {
            return res.status(400).json({ error: 'Không thể cập nhật trạng thái của đơn hàng đã hủy' });
        }

        if (currentOrder.status === ORDER_STATUS.COMPLETED) {
            return res.status(400).json({ error: 'Không thể cập nhật trạng thái của đơn hàng đã hoàn thành' });
        }

        await pool.query("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [status, id]);

        if (status === ORDER_STATUS.COMPLETED) {
            try {
                await issueLoyaltyCoupons(currentOrder.user_id);
            } catch (loyaltyErr) {
                console.error('[Loyalty] Error issuing coupons:', loyaltyErr);
            }
        }

        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

async function issueLoyaltyCoupons(userId) {
    if (!userId) return;

    const [userRows] = await pool.query('SELECT email FROM users WHERE id = ?', [userId]);
    const user = userRows[0];
    if (!user || !user.email) return;

    const [spentRows] = await pool.query(
        "SELECT SUM(total) as spent FROM orders WHERE user_id = ? AND status = ?",
        [userId, ORDER_STATUS.COMPLETED]
    );
    const totalSpent = spentRows[0]?.spent || 0;

    const issueMilestone = async (milestoneName, prefix, percentDiscount) => {
        const [existing] = await pool.query("SELECT id FROM coupons WHERE user_email = ? AND code LIKE ?", [user.email, prefix + '%']);
        if (existing.length === 0) {
            const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
            const couponCode = prefix + randomStr;
            await pool.query(
                "INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, user_email) VALUES (?, 'percent', ?, 0, 1, ?)",
                [couponCode, percentDiscount, user.email]
            );
            console.log(`[Loyalty] Issued ${couponCode} to ${user.email} for milestone ${milestoneName}`);
        }
    };

    if (totalSpent >= 5000000) {
        await issueMilestone('5M', 'VIP5M-', 20);
        await issueMilestone('1M', 'VIP1M-', 15);
    } else if (totalSpent >= 1000000) {
        await issueMilestone('1M', 'VIP1M-', 15);
    }
}

module.exports = router;
