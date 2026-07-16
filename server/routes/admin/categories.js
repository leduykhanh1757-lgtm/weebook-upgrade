// ========== ADMIN — CATEGORIES MANAGEMENT ========== //
const express = require('express');
const { getDb } = require('../../database');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const db = getDb();
        const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/', (req, res) => {
    try {
        const { name, slug, parent_id } = req.body;
        const db = getDb();
        const result = db.prepare('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)').run(name, slug, parent_id || null);
        res.status(201).json({ message: 'Thêm danh mục thành công', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { name, slug, parent_id } = req.body;
        const db = getDb();
        db.prepare('UPDATE categories SET name = ?, slug = ?, parent_id = ? WHERE id = ?').run(name, slug, parent_id || null, req.params.id);
        res.json({ message: 'Cập nhật danh mục thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const db = getDb();
        db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
