// ========== ADMIN — AUTHORS & PUBLISHERS (MYSQL) ========== //
const express = require('express');
const { pool } = require('../../database');

const router = express.Router();

// --- Authors / Publishers ---
router.get('/', async (req, res) => {
    try {
        if (req.baseUrl.endsWith('/publishers')) {
            const [publishers] = await pool.query('SELECT * FROM publishers ORDER BY name ASC');
            return res.json({ publishers });
        }
        const [authors] = await pool.query('SELECT * FROM authors ORDER BY name ASC');
        res.json({ authors });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.baseUrl.endsWith('/publishers')) {
            const { name, description } = req.body;
            const [result] = await pool.query('INSERT INTO publishers (name, description) VALUES (?, ?)', [name, description || '']);
            return res.status(201).json({ message: 'Thêm NXB thành công', id: result.insertId });
        }
        const { name, bio, image } = req.body;
        const [result] = await pool.query('INSERT INTO authors (name, bio, image) VALUES (?, ?, ?)', [name, bio || '', image || '']);
        res.status(201).json({ message: 'Thêm tác giả thành công', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
