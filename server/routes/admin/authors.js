// ========== ADMIN — AUTHORS & PUBLISHERS ========== //
const express = require('express');
const { getDb } = require('../../database');

const router = express.Router();

// --- Authors ---
router.get('/', (req, res) => {
    try {
        const db = getDb();
        // Check if the request path came through /publishers mount
        if (req.baseUrl.endsWith('/publishers')) {
            const publishers = db.prepare('SELECT * FROM publishers ORDER BY name ASC').all();
            return res.json({ publishers });
        }
        const authors = db.prepare('SELECT * FROM authors ORDER BY name ASC').all();
        res.json({ authors });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/', (req, res) => {
    try {
        const db = getDb();
        if (req.baseUrl.endsWith('/publishers')) {
            const { name, description } = req.body;
            const result = db.prepare('INSERT INTO publishers (name, description) VALUES (?, ?)').run(name, description || '');
            return res.status(201).json({ message: 'Thêm NXB thành công', id: result.lastInsertRowid });
        }
        const { name, bio, image } = req.body;
        const result = db.prepare('INSERT INTO authors (name, bio, image) VALUES (?, ?, ?)').run(name, bio || '', image || '');
        res.status(201).json({ message: 'Thêm tác giả thành công', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
