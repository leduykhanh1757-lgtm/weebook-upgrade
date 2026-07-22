// ========== ADMIN — BOOKS MANAGEMENT (MYSQL) ========== //
const express = require('express');
const { pool } = require('../../database');

const router = express.Router();

// GET /admin/books
router.get('/', async (req, res) => {
    try {
        const [books] = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
        res.json({ books });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// POST /admin/books
router.post('/', async (req, res) => {
    try {
        const {
            title, author, publisher, publish_date,
            category, subcategory,
            price, original_price, import_price, discount,
            isbn, pages, format, weight,
            stock, is_visible,
            description, images
        } = req.body;

        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();
        const imagesStr = images && images.length > 0 ? JSON.stringify(images) : '[]';

        const [result] = await pool.query(`
            INSERT INTO books (
                title, author, publisher, publish_date,
                category, subcategory,
                price, original_price, import_price, discount,
                isbn, pages, format, weight,
                stock, is_visible,
                description, images, slug
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, author, publisher || '', publish_date || '',
            category || 'other', subcategory || '',
            price || 0, original_price || price, import_price || 0, discount || 0,
            isbn || '', pages || 0, format || '', weight || '',
            stock || 0, is_visible !== undefined ? is_visible : 1,
            description || '', imagesStr, slug
        ]);

        res.status(201).json({ message: 'Thêm sách thành công', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// PUT /admin/books/:id
router.put('/:id', async (req, res) => {
    try {
        const {
            title, author, publisher, publish_date,
            category, subcategory,
            price, original_price, import_price, discount,
            isbn, pages, format, weight,
            stock, is_visible,
            description, images
        } = req.body;

        const id = req.params.id;

        const [bookRows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
        const book = bookRows[0];
        if (!book) return res.status(404).json({ error: 'Không tìm thấy sách' });

        let imagesStr = book.images;
        if (images !== undefined) {
            imagesStr = images && images.length > 0 ? JSON.stringify(images) : '[]';
        }

        await pool.query(`
            UPDATE books SET
                title = COALESCE(?, title), author = COALESCE(?, author),
                publisher = COALESCE(?, publisher), publish_date = COALESCE(?, publish_date),
                category = COALESCE(?, category), subcategory = COALESCE(?, subcategory),
                price = COALESCE(?, price), original_price = COALESCE(?, original_price),
                import_price = COALESCE(?, import_price), discount = COALESCE(?, discount),
                isbn = COALESCE(?, isbn), pages = COALESCE(?, pages),
                format = COALESCE(?, format), weight = COALESCE(?, weight),
                stock = COALESCE(?, stock), is_visible = COALESCE(?, is_visible),
                description = COALESCE(?, description), images = ?
            WHERE id = ?
        `, [
            title, author, publisher, publish_date,
            category, subcategory,
            price, original_price, import_price, discount,
            isbn, pages, format, weight,
            stock, is_visible,
            description, imagesStr, id
        ]);

        res.json({ message: 'Cập nhật sách thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
