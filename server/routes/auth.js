// ========== AUTH ROUTES (MYSQL) ========== //
const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../database');
const { generateToken, requireAuth } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/email');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự!' });
        }

        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email đã được sử dụng!' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const [insertResult] = await pool.query(
            'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
            [name, email, phone || null, hashedPassword]
        );

        const [userRows] = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [insertResult.insertId]);
        const user = userRows[0];

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
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Sai email hoặc mật khẩu!' });
        }

        if (user.status === 'banned') {
            return res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách.' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Sai email hoặc mật khẩu!' });
        }

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
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { name, phone, birthday, address, gender, avatar, newsletter_subscribed } = req.body;

        await pool.query(
            `UPDATE users SET name = ?, phone = ?, birthday = ?, address = ?, gender = ?, avatar = ?, newsletter_subscribed = ?, updated_at = NOW() WHERE id = ?`,
            [
                name || req.user.name, 
                phone || null, 
                birthday || null, 
                address || null, 
                gender || req.user.gender || 'Khác',
                avatar !== undefined ? avatar : req.user.avatar,
                newsletter_subscribed !== undefined ? newsletter_subscribed : req.user.newsletter_subscribed,
                req.user.id
            ]
        );

        const [updatedRows] = await pool.query(
            'SELECT id, name, email, phone, role, birthday, address, gender, avatar, email_verified, phone_verified, newsletter_subscribed FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ message: 'Cập nhật thông tin thành công!', user: updatedRows[0] });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// PUT /api/auth/password
router.put('/password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
        }

        const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const user = rows[0];

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng!' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Vui lòng nhập email!' });
        }
        
        const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        const user = rows[0];
        
        if (!user) {
            return res.status(200).json({ message: 'Đã gửi hướng dẫn khôi phục qua email' });
        }
        
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        await pool.query(
            "UPDATE users SET reset_code = ?, reset_code_expires = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?",
            [code, email]
        );
        
        const emailSent = await sendVerificationEmail(email, code);
        if (!emailSent) {
            return res.status(500).json({ error: 'Không thể gửi email, vui lòng thử lại sau.' });
        }
        
        res.status(200).json({ message: 'Đã gửi mã xác nhận qua email' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Vui lòng cung cấp đủ thông tin!' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự!' });
        }
        
        const [rows] = await pool.query(
            "SELECT id FROM users WHERE email = ? AND reset_code = ? AND reset_code_expires >= NOW()",
            [email, code]
        );
        const user = rows[0];
        
        if (!user) {
            return res.status(400).json({ error: 'Mã xác nhận không hợp lệ hoặc đã hết hạn!' });
        }
        
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = ?, reset_code = NULL, reset_code_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );
          
        res.status(200).json({ message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/auth/addresses
router.get('/addresses', requireAuth, async (req, res) => {
    try {
        const [addresses] = await pool.query(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [req.user.id]
        );
        res.json({ addresses });
    } catch (err) {
        console.error('Get addresses error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/auth/addresses
router.post('/addresses', requireAuth, async (req, res) => {
    try {
        const { receiver_name, phone, full_address, is_default } = req.body;
        if (!receiver_name || !phone || !full_address) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin!' });
        }
        
        const [countRows] = await pool.query('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?', [req.user.id]);
        const shouldBeDefault = (is_default === 1 || countRows[0].count === 0) ? 1 : 0;
        
        if (shouldBeDefault === 1) {
            await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
        }

        const [insertResult] = await pool.query(
            'INSERT INTO addresses (user_id, receiver_name, phone, full_address, is_default) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, receiver_name, phone, full_address, shouldBeDefault]
        );
        
        const [newAddrRows] = await pool.query('SELECT * FROM addresses WHERE id = ?', [insertResult.insertId]);
        res.status(201).json({ message: 'Thêm địa chỉ thành công', address: newAddrRows[0] });
    } catch (err) {
        console.error('Add address error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// PUT /api/auth/addresses/:id
router.put('/addresses/:id', requireAuth, async (req, res) => {
    try {
        const { receiver_name, phone, full_address, is_default } = req.body;
        const addressId = req.params.id;
        
        const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, req.user.id]);
        const address = rows[0];
        if (!address) return res.status(404).json({ error: 'Không tìm thấy địa chỉ' });

        if (is_default === 1) {
            await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
        }

        await pool.query(
            'UPDATE addresses SET receiver_name = ?, phone = ?, full_address = ?, is_default = ? WHERE id = ?',
            [receiver_name || address.receiver_name, phone || address.phone, full_address || address.full_address, is_default !== undefined ? is_default : address.is_default, addressId]
        );
        
        res.json({ message: 'Cập nhật địa chỉ thành công' });
    } catch (err) {
        console.error('Update address error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// DELETE /api/auth/addresses/:id
router.delete('/addresses/:id', requireAuth, async (req, res) => {
    try {
        const addressId = req.params.id;
        
        const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, req.user.id]);
        const address = rows[0];
        if (!address) return res.status(404).json({ error: 'Không tìm thấy địa chỉ' });

        await pool.query('DELETE FROM addresses WHERE id = ?', [addressId]);
        
        if (address.is_default === 1) {
            const [nextRows] = await pool.query('SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.user.id]);
            if (nextRows.length > 0) {
                await pool.query('UPDATE addresses SET is_default = 1 WHERE id = ?', [nextRows[0].id]);
            }
        }
        
        res.json({ message: 'Xóa địa chỉ thành công' });
    } catch (err) {
        console.error('Delete address error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
