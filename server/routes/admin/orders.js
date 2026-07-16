// ========== ADMIN — ORDERS MANAGEMENT ========== //
const express = require('express');
const { getDb } = require('../../database');
const { ORDER_STATUS, VALID_STATUSES } = require('../../constants/statusEnum');

const router = express.Router();

// GET /admin/orders
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const orders = db.prepare(
            'SELECT id, order_code, user_id, full_name, phone, city, total, status, created_at, payment_method FROM orders ORDER BY created_at DESC'
        ).all();
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// GET /admin/orders/:id
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const id = req.params.id;
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

        const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
        res.json({ order, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// PUT /admin/orders/:id/status
router.put('/:id/status', (req, res) => {
    try {
        const { status } = req.body;

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const db = getDb();
        const id = req.params.id;

        const currentOrder = db.prepare('SELECT status, user_id FROM orders WHERE id = ?').get(id);
        if (!currentOrder) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        if (currentOrder.status === ORDER_STATUS.CANCELLED) {
            return res.status(400).json({ error: 'Không thể cập nhật trạng thái của đơn hàng đã hủy' });
        }

        if (currentOrder.status === ORDER_STATUS.COMPLETED) {
            return res.status(400).json({ error: 'Không thể cập nhật trạng thái của đơn hàng đã hoàn thành' });
        }

        // Update order status
        db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);

        // --- LOYALTY SYSTEM (isolated try/catch so order update still succeeds) ---
        if (status === ORDER_STATUS.COMPLETED) {
            try {
                issueLoyaltyCoupons(db, currentOrder.user_id);
            } catch (loyaltyErr) {
                console.error('[Loyalty] Error issuing coupons:', loyaltyErr);
                // Don't fail the response — order status was already updated
            }
        }

        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/**
 * Issue loyalty coupons based on total spending milestones.
 * Isolated from the main handler so a failure here doesn't break the status update.
 */
function issueLoyaltyCoupons(db, userId) {
    if (!userId) return;

    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
    if (!user || !user.email) return;

    const totalSpent = db.prepare(
        "SELECT SUM(total) as spent FROM orders WHERE user_id = ? AND status = ?"
    ).get(userId, ORDER_STATUS.COMPLETED).spent || 0;

    const issueMilestone = (milestoneName, prefix, percentDiscount) => {
        const existing = db.prepare("SELECT id FROM coupons WHERE user_email = ? AND code LIKE ?").get(user.email, prefix + '%');
        if (!existing) {
            const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
            const couponCode = prefix + randomStr;
            db.prepare(
                "INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, user_email) VALUES (?, 'percent', ?, 0, 1, ?)"
            ).run(couponCode, percentDiscount, user.email);
            console.log(`[Loyalty] Issued ${couponCode} to ${user.email} for milestone ${milestoneName}`);
        }
    };

    if (totalSpent >= 5000000) {
        issueMilestone('5M', 'VIP5M-', 20);
        issueMilestone('1M', 'VIP1M-', 15);
    } else if (totalSpent >= 1000000) {
        issueMilestone('1M', 'VIP1M-', 15);
    }
}

module.exports = router;
