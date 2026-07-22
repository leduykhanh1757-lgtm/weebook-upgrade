// ========== ADMIN — USERS MANAGEMENT (MYSQL) ========== //
const express = require('express');
const { pool } = require('../../database');
const { ORDER_STATUS } = require('../../constants/statusEnum');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT u.id, u.name, u.email, u.phone, u.created_at, u.status, u.role,
                   COUNT(o.id) as total_orders,
                   SUM(CASE WHEN o.status = '${ORDER_STATUS.COMPLETED}' THEN o.total ELSE 0 END) as ltv
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id, u.name, u.email, u.phone, u.created_at, u.status, u.role
            ORDER BY u.role ASC, u.created_at DESC
        `);
        res.json({ users });
    } catch (err) {
        console.error('Admin Users Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const [userRows] = await pool.query(`
            SELECT u.id, u.name, u.email, u.phone, u.created_at, u.status, u.role, u.gender, u.birthday, u.address,
                   COUNT(o.id) as total_orders,
                   SUM(CASE WHEN o.status = '${ORDER_STATUS.COMPLETED}' THEN o.total ELSE 0 END) as ltv
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.id = ?
            GROUP BY u.id, u.name, u.email, u.phone, u.created_at, u.status, u.role, u.gender, u.birthday, u.address
        `, [userId]);

        const user = userRows[0];
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

        const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
        const [orders] = await pool.query('SELECT id, order_code, created_at, status, total, payment_method FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);

        res.json({ user, addresses, orders });
    } catch (err) {
        console.error('Admin User Details Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Cập nhật trạng thái thành công', status });
    } catch (err) {
        console.error('Admin Update User Status Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
