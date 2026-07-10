// ========== AUTH ROUTES ========== //
const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự!' });
        }

        const db = getDb();

        // Check existing email
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email đã được sử dụng!' });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert user
        const result = db.prepare(
            'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)'
        ).run(name, email, phone || null, hashedPassword);

        const user = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(result.lastInsertRowid);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'Tạo tài khoản thành công!',
            token,
            user
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            return res.status(401).json({ error: 'Sai email hoặc mật khẩu!' });
        }

        // Compare password
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Sai email hoặc mật khẩu!' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            message: `Chào mừng ${user.name}!`,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                birthday: user.birthday,
                address: user.address
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req, res) => {
    try {
        const { name, phone, birthday, address } = req.body;
        const db = getDb();

        db.prepare(
            `UPDATE users SET name = ?, phone = ?, birthday = ?, address = ?, updated_at = datetime('now') WHERE id = ?`
        ).run(name || req.user.name, phone || null, birthday || null, address || null, req.user.id);

        const updatedUser = db.prepare('SELECT id, name, email, phone, role, birthday, address FROM users WHERE id = ?').get(req.user.id);

        res.json({ message: 'Cập nhật thông tin thành công!', user: updatedUser });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// PUT /api/auth/password
router.put('/password', requireAuth, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
        }

        const db = getDb();
        const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng!' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE users SET password = ?, updated_at = datetime("now") WHERE id = ?').run(hashedPassword, req.user.id);

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
