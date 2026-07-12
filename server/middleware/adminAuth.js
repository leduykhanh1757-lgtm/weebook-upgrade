const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { requireAuth } = require('./auth');

const requireAdmin = (req, res, next) => {
    // First, run requireAuth to verify token and attach req.user
    requireAuth(req, res, () => {
        const db = getDb();
        const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
        
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Quyền truy cập bị từ chối! Yêu cầu tài khoản Admin.' });
        }
    });
};

module.exports = { requireAdmin };
