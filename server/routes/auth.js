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
                address: user.address,
                gender: user.gender,
                avatar: user.avatar,
                email_verified: user.email_verified,
                phone_verified: user.phone_verified,
                newsletter_subscribed: user.newsletter_subscribed
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
        const { name, phone, birthday, address, gender, avatar, newsletter_subscribed } = req.body;
        const db = getDb();

        db.prepare(
            `UPDATE users SET name = ?, phone = ?, birthday = ?, address = ?, gender = ?, avatar = ?, newsletter_subscribed = ?, updated_at = datetime('now') WHERE id = ?`
        ).run(
            name || req.user.name, 
            phone || null, 
            birthday || null, 
            address || null, 
            gender || req.user.gender || 'Khác',
            avatar !== undefined ? avatar : req.user.avatar,
            newsletter_subscribed !== undefined ? newsletter_subscribed : req.user.newsletter_subscribed,
            req.user.id
        );

        const updatedUser = db.prepare('SELECT id, name, email, phone, role, birthday, address, gender, avatar, email_verified, phone_verified, newsletter_subscribed FROM users WHERE id = ?').get(req.user.id);

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

// GET /api/auth/addresses
router.get('/addresses', requireAuth, (req, res) => {
    try {
        const db = getDb();
        const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
        res.json({ addresses });
    } catch (err) {
        console.error('Get addresses error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/auth/addresses
router.post('/addresses', requireAuth, (req, res) => {
    try {
        const { receiver_name, phone, full_address, is_default } = req.body;
        if (!receiver_name || !phone || !full_address) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin!' });
        }
        
        const db = getDb();
        
        // If this is the first address or is_default is true, set others to not default
        const existing = db.prepare('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?').get(req.user.id);
        const shouldBeDefault = (is_default === 1 || existing.count === 0) ? 1 : 0;
        
        if (shouldBeDefault === 1) {
            db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
        }

        const stmt = db.prepare('INSERT INTO addresses (user_id, receiver_name, phone, full_address, is_default) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(req.user.id, receiver_name, phone, full_address, shouldBeDefault);
        
        const newAddress = db.prepare('SELECT * FROM addresses WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ message: 'Thêm địa chỉ thành công', address: newAddress });
    } catch (err) {
        console.error('Add address error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// PUT /api/auth/addresses/:id
router.put('/addresses/:id', requireAuth, (req, res) => {
    try {
        const { receiver_name, phone, full_address, is_default } = req.body;
        const addressId = req.params.id;
        
        const db = getDb();
        
        // Ensure address belongs to user
        const address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(addressId, req.user.id);
        if (!address) return res.status(404).json({ error: 'Không tìm thấy địa chỉ' });

        if (is_default === 1) {
            db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
        }

        const stmt = db.prepare('UPDATE addresses SET receiver_name = ?, phone = ?, full_address = ?, is_default = ? WHERE id = ?');
        stmt.run(receiver_name || address.receiver_name, phone || address.phone, full_address || address.full_address, is_default !== undefined ? is_default : address.is_default, addressId);
        
        res.json({ message: 'Cập nhật địa chỉ thành công' });
    } catch (err) {
        console.error('Update address error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// DELETE /api/auth/addresses/:id
router.delete('/addresses/:id', requireAuth, (req, res) => {
    try {
        const addressId = req.params.id;
        const db = getDb();
        
        const address = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(addressId, req.user.id);
        if (!address) return res.status(404).json({ error: 'Không tìm thấy địa chỉ' });

        db.prepare('DELETE FROM addresses WHERE id = ?').run(addressId);
        
        // If deleted was default, make the most recent one default
        if (address.is_default === 1) {
            const nextAddress = db.prepare('SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
            if (nextAddress) {
                db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ?').run(nextAddress.id);
            }
        }
        
        res.json({ message: 'Xóa địa chỉ thành công' });
    } catch (err) {
        console.error('Delete address error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
