// ========== ADMIN — CATEGORIES MANAGEMENT (MYSQL) ========== //
const express = require('express');
const { pool } = require('../../database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, slug, parent_id } = req.body;
        const [result] = await pool.query('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)', [name, slug, parent_id || null]);
        res.status(201).json({ message: 'Thêm danh mục thành công', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, slug, parent_id } = req.body;
        await pool.query('UPDATE categories SET name = ?, slug = ?, parent_id = ? WHERE id = ?', [name, slug, parent_id || null, req.params.id]);
        res.json({ message: 'Cập nhật danh mục thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
