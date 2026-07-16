// ========== ADMIN — STAFF MANAGEMENT ========== //
const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../../database');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const db = getDb();
        const staff = db.prepare("SELECT id, name, email, phone, role, created_at, status FROM users WHERE role != 'user'").all();
        res.json(staff);
    } catch (err) {
        console.error('GET /staff Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/', (req, res) => {
    try {
        const { name, email, phone, role, password } = req.body;
        const db = getDb();

        const rawPassword = password || '123456';
        const hashedPassword = bcrypt.hashSync(rawPassword, 10);

        const stmt = db.prepare('INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(name, email, phone, role, hashedPassword);

        res.status(201).json({ message: 'Tạo tài khoản nhân viên thành công', id: result.lastInsertRowid });
    } catch (err) {
        console.error('POST /staff Error:', err);
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Email đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi server: ' + err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { name, phone, role, status, password } = req.body;
        const db = getDb();

        if (password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            db.prepare('UPDATE users SET name = ?, phone = ?, role = ?, status = ?, password = ? WHERE id = ?')
                .run(name, phone, role, status, hashedPassword, req.params.id);
        } else {
            db.prepare('UPDATE users SET name = ?, phone = ?, role = ?, status = ? WHERE id = ?')
                .run(name, phone, role, status, req.params.id);
        }

        res.json({ message: 'Cập nhật nhân viên thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const db = getDb();
        // Prevent deleting oneself
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'Không thể xóa chính mình' });
        }
        db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        res.json({ message: 'Xóa nhân viên thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
