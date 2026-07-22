// ========== ADMIN — STAFF MANAGEMENT (MYSQL) ========== //
const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../../database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [staff] = await pool.query("SELECT id, name, email, phone, role, created_at, status FROM users WHERE role != 'user'");
        res.json(staff);
    } catch (err) {
        console.error('GET /staff Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, role, password } = req.body;

        const rawPassword = password || '123456';
        const hashedPassword = bcrypt.hashSync(rawPassword, 10);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, role, hashedPassword]
        );

        res.status(201).json({ message: 'Tạo tài khoản nhân viên thành công', id: result.insertId });
    } catch (err) {
        console.error('POST /staff Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi server: ' + err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, phone, role, status, password } = req.body;

        if (password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            await pool.query(
                'UPDATE users SET name = ?, phone = ?, role = ?, status = ?, password = ? WHERE id = ?',
                [name, phone, role, status, hashedPassword, req.params.id]
            );
        } else {
            await pool.query(
                'UPDATE users SET name = ?, phone = ?, role = ?, status = ? WHERE id = ?',
                [name, phone, role, status, req.params.id]
            );
        }

        res.json({ message: 'Cập nhật nhân viên thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'Không thể xóa chính mình' });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Xóa nhân viên thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
