const express = require('express');
const { getDb } = require('../database');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Apply requireAdmin to all routes in this file
router.use(requireAdmin);

// ==========================================
// DASHBOARD
// ==========================================
router.get('/dashboard', (req, res) => {
    try {
        const db = getDb();
        
        // 1. Total Revenue
        const revenueObj = db.prepare("SELECT SUM(total) as revenue FROM orders WHERE status = 'Hoàn thành'").get();
        const totalRevenue = revenueObj.revenue || 0;

        // 2. Order Stats
        const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Chờ xác nhận'").get().count;
        const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Hoàn thành'").get().count;
        const canceledOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Đã hủy'").get().count;

        // 3. User Stats
        const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role != 'admin'").get().count;

        // 4. Low Stock Books
        const lowStockBooks = db.prepare('SELECT id, title, stock, images FROM books WHERE stock < 5 ORDER BY stock ASC LIMIT 10').all();

        // 5. Bestsellers (top 5 by quantity sold in completed orders)
        const bestsellers = db.prepare(`
            SELECT b.id, b.title, SUM(oi.quantity) as sold_count, b.images
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN books b ON oi.book_id = b.id
            WHERE o.status = 'Hoàn thành'
            GROUP BY b.id
            ORDER BY sold_count DESC
            LIMIT 5
        `).all();

        res.json({
            revenue: totalRevenue,
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                canceled: canceledOrders
            },
            users: totalUsers,
            lowStockBooks,
            bestsellers
        });
    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ==========================================
// BOOKS MANAGEMENT
// ==========================================
router.get('/books', (req, res) => {
    try {
        const db = getDb();
        const books = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
        res.json({ books });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/books', (req, res) => {
    try {
        const { 
            title, author, publisher, publish_date, 
            category, subcategory, 
            price, original_price, import_price, discount, 
            isbn, pages, format, weight, 
            stock, is_visible, 
            description, images 
        } = req.body;
        
        const db = getDb();
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();
        const imagesStr = images && images.length > 0 ? JSON.stringify(images) : '[]';

        const stmt = db.prepare(`
            INSERT INTO books (
                title, author, publisher, publish_date,
                category, subcategory,
                price, original_price, import_price, discount,
                isbn, pages, format, weight,
                stock, is_visible,
                description, images, slug
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            title, author, publisher || '', publish_date || '',
            category || 'other', subcategory || '',
            price || 0, original_price || price, import_price || 0, discount || 0,
            isbn || '', pages || 0, format || '', weight || '',
            stock || 0, is_visible !== undefined ? is_visible : 1,
            description || '', imagesStr, slug
        );
        
        res.status(201).json({ message: 'Thêm sách thành công', id: result.lastInsertRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/books/:id', (req, res) => {
    try {
        const { 
            title, author, publisher, publish_date, 
            category, subcategory, 
            price, original_price, import_price, discount, 
            isbn, pages, format, weight, 
            stock, is_visible, 
            description, images 
        } = req.body;
        
        const db = getDb();
        const id = req.params.id;

        const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
        if (!book) return res.status(404).json({ error: 'Không tìm thấy sách' });

        // If images array is provided, use it. Otherwise, keep old images.
        let imagesStr = book.images;
        if (images !== undefined) {
            imagesStr = images && images.length > 0 ? JSON.stringify(images) : '[]';
        }

        const stmt = db.prepare(`
            UPDATE books SET 
                title = COALESCE(?, title),
                author = COALESCE(?, author),
                publisher = COALESCE(?, publisher),
                publish_date = COALESCE(?, publish_date),
                category = COALESCE(?, category),
                subcategory = COALESCE(?, subcategory),
                price = COALESCE(?, price),
                original_price = COALESCE(?, original_price),
                import_price = COALESCE(?, import_price),
                discount = COALESCE(?, discount),
                isbn = COALESCE(?, isbn),
                pages = COALESCE(?, pages),
                format = COALESCE(?, format),
                weight = COALESCE(?, weight),
                stock = COALESCE(?, stock),
                is_visible = COALESCE(?, is_visible),
                description = COALESCE(?, description),
                images = ?
            WHERE id = ?
        `);
        
        stmt.run(
            title, author, publisher, publish_date,
            category, subcategory,
            price, original_price, import_price, discount,
            isbn, pages, format, weight,
            stock, is_visible,
            description, imagesStr,
            id
        );
        
        res.json({ message: 'Cập nhật sách thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ==========================================
// ORDERS MANAGEMENT
// ==========================================
router.get('/orders', (req, res) => {
    try {
        const db = getDb();
        const orders = db.prepare('SELECT id, order_code, user_id, full_name, phone, city, total, status, created_at, payment_method FROM orders ORDER BY created_at DESC').all();
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/orders/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const db = getDb();
        const id = req.params.id;
        
        db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ==========================================
// CATEGORIES MANAGEMENT
// ==========================================
router.get('/categories', (req, res) => {
    try {
        const db = getDb();
        const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/categories', (req, res) => {
    try {
        const { name, slug, parent_id } = req.body;
        const db = getDb();
        const stmt = db.prepare('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)');
        const result = stmt.run(name, slug, parent_id || null);
        res.status(201).json({ message: 'Thêm danh mục thành công', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/categories/:id', (req, res) => {
    try {
        const { name, slug, parent_id } = req.body;
        const db = getDb();
        const stmt = db.prepare('UPDATE categories SET name = ?, slug = ?, parent_id = ? WHERE id = ?');
        stmt.run(name, slug, parent_id || null, req.params.id);
        res.json({ message: 'Cập nhật danh mục thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.delete('/categories/:id', (req, res) => {
    try {
        const db = getDb();
        db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ==========================================
// AUTHORS & PUBLISHERS MANAGEMENT
// ==========================================
router.get('/authors', (req, res) => {
    try {
        const db = getDb();
        const authors = db.prepare('SELECT * FROM authors ORDER BY name ASC').all();
        res.json({ authors });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/authors', (req, res) => {
    try {
        const { name, bio, image } = req.body;
        const db = getDb();
        const stmt = db.prepare('INSERT INTO authors (name, bio, image) VALUES (?, ?, ?)');
        const result = stmt.run(name, bio || '', image || '');
        res.status(201).json({ message: 'Thêm tác giả thành công', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.get('/publishers', (req, res) => {
    try {
        const db = getDb();
        const publishers = db.prepare('SELECT * FROM publishers ORDER BY name ASC').all();
        res.json({ publishers });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.post('/publishers', (req, res) => {
    try {
        const { name, description } = req.body;
        const db = getDb();
        const stmt = db.prepare('INSERT INTO publishers (name, description) VALUES (?, ?)');
        const result = stmt.run(name, description || '');
        res.status(201).json({ message: 'Thêm NXB thành công', id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ==========================================
// REVIEWS MANAGEMENT
// ==========================================
router.get('/reviews', (req, res) => {
    try {
        const db = getDb();
        const reviews = db.prepare(`
            SELECT r.id, r.rating, r.comment, r.created_at, r.status, u.name as user_name, b.title as book_title
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            JOIN books b ON r.book_id = b.id
            ORDER BY r.created_at DESC
        `).all();
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/reviews/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'approved', 'hidden'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const db = getDb();
        db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
