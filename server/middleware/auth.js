// ========== JWT AUTHENTICATION MIDDLEWARE ========== //
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'bookself-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// Required authentication middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Vui lòng đăng nhập!' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = getDb();
        const user = db.prepare('SELECT id, name, email, phone, role, birthday, address FROM users WHERE id = ?').get(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'Người dùng không tồn tại!' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
}

// Optional authentication - sets req.user if token present, but doesn't block
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = getDb();
        const user = db.prepare('SELECT id, name, email, phone, role, birthday, address FROM users WHERE id = ?').get(decoded.id);
        req.user = user || null;
    } catch (err) {
        req.user = null;
    }

    next();
}

// Admin-only middleware
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập!' });
    }
    next();
}

module.exports = { generateToken, requireAuth, optionalAuth, requireAdmin, JWT_SECRET };
