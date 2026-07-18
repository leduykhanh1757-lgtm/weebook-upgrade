// ========== ADMIN — USERS MANAGEMENT ========== //
const express = require('express');
const { getDb } = require('../../database');
const { ORDER_STATUS } = require('../../constants/statusEnum');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const db = getDb();
        const users = db.prepare(`
            SELECT u.id, u.name, u.email, u.phone, u.created_at, u.status, u.role,
                   COUNT(o.id) as total_orders,
                   SUM(CASE WHEN o.status = '${ORDER_STATUS.COMPLETED}' THEN o.total ELSE 0 END) as ltv
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id
            ORDER BY u.role ASC, u.created_at DESC
        `).all();
        res.json({ users });
    } catch (err) {
        console.error('Admin Users Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const userId = req.params.id;

        // Basic info & LTV
        const user = db.prepare(`
            SELECT u.id, u.name, u.email, u.phone, u.created_at, u.status, u.role, u.gender, u.birthday, u.address,
                   COUNT(o.id) as total_orders,
                   SUM(CASE WHEN o.status = '${ORDER_STATUS.COMPLETED}' THEN o.total ELSE 0 END) as ltv
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.id = ?
            GROUP BY u.id
        `).get(userId);

        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

        // Addresses
        const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(userId);

        // Order history
        const orders = db.prepare('SELECT id, order_code, created_at, status, total, payment_method FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId);

        res.json({ user, addresses, orders });
    } catch (err) {
        console.error('Admin User Details Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const db = getDb();
        db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ message: 'Cập nhật trạng thái thành công', status });
    } catch (err) {
        console.error('Admin Update User Status Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
