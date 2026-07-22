// ========== BOOKS ROUTES (MYSQL) ========== //
const express = require('express');
const { pool } = require('../database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Helper: parse JSON fields from MySQL row
function parseBookRow(book) {
    let images = [];
    let tags = [];
    try {
        images = typeof book.images === 'string' ? JSON.parse(book.images || '[]') : (book.images || []);
    } catch (e) {
        images = [];
    }
    try {
        tags = typeof book.tags === 'string' ? JSON.parse(book.tags || '[]') : (book.tags || []);
    } catch (e) {
        tags = [];
    }

    return {
        ...book,
        images,
        tags,
        featured: !!book.featured,
        newRelease: !!book.new_release
    };
}

// GET /api/books - List books with filters, search, pagination, sort
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 30,
            category,
            subcategory,
            search,
            sort = 'default',
            price_min,
            price_max,
            type
        } = req.query;

        let where = [];
        let params = [];

        if (type === 'featured') {
            where.push('featured = 1');
        } else if (type === 'new') {
            where.push('new_release = 1');
        }

        if (category) {
            where.push('category = ?');
            params.push(category);
        }

        if (subcategory) {
            where.push('subcategory = ?');
            params.push(subcategory);
        }

        if (search) {
            where.push('(title LIKE ? OR author LIKE ? OR tags LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (price_min) {
            where.push('price >= ?');
            params.push(parseInt(price_min));
        }

        if (price_max) {
            where.push('price <= ?');
            params.push(parseInt(price_max));
        }

        const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

        let orderClause = 'ORDER BY id ASC';
        switch (sort) {
            case 'price-low': orderClause = 'ORDER BY price ASC'; break;
            case 'price-high': orderClause = 'ORDER BY price DESC'; break;
            case 'name': orderClause = 'ORDER BY title ASC'; break;
            case 'newest': orderClause = 'ORDER BY publish_date DESC'; break;
            case 'rating': orderClause = 'ORDER BY rating DESC'; break;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM books ${whereClause}`;
        const [countRows] = await pool.query(countQuery, params);
        const total = countRows[0].total;

        // Get paginated results
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const dataQuery = `SELECT * FROM books ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
        const [books] = await pool.query(dataQuery, [...params, parseInt(limit), offset]);

        const parsedBooks = books.map(parseBookRow);

        res.json({
            books: parsedBooks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Get books error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/books/featured
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const [books] = await pool.query('SELECT * FROM books WHERE featured = 1 LIMIT ?', [limit]);
        res.json({ books: books.map(parseBookRow) });
    } catch (err) {
        console.error('Get featured error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/books/new
router.get('/new', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const [books] = await pool.query('SELECT * FROM books WHERE new_release = 1 LIMIT ?', [limit]);
        res.json({ books: books.map(parseBookRow) });
    } catch (err) {
        console.error('Get new releases error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/books/categories - Get distinct categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category ASC');
        const [subcategories] = await pool.query('SELECT DISTINCT category, subcategory FROM books WHERE subcategory IS NOT NULL ORDER BY category, subcategory ASC');

        res.json({
            categories: categories.map(c => c.category),
            subcategories: subcategories
        });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [parseInt(req.params.id)]);
        const book = rows[0];

        if (!book) {
            return res.status(404).json({ error: 'Không tìm thấy sách!' });
        }

        res.json({ book: parseBookRow(book) });
    } catch (err) {
        console.error('Get book error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/books/:id/related
router.get('/:id/related', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const bookId = parseInt(req.params.id);

        const [currRows] = await pool.query('SELECT * FROM books WHERE id = ?', [bookId]);
        const currentBook = currRows[0];
        if (!currentBook) {
            return res.status(404).json({ error: 'Không tìm thấy sách!' });
        }

        let related = [];

        // 1. Same category
        const [sameCategory] = await pool.query(
            'SELECT * FROM books WHERE category = ? AND id != ? ORDER BY ABS(id - ?) ASC LIMIT ?',
            [currentBook.category, bookId, bookId, limit]
        );
        related.push(...sameCategory);

        // 2. Same publisher (if still need more)
        if (related.length < limit && currentBook.publisher) {
            const excludeIds = related.map(b => b.id).concat(bookId);
            const placeholders = excludeIds.map(() => '?').join(',');
            const [samePublisher] = await pool.query(
                `SELECT * FROM books WHERE publisher = ? AND id NOT IN (${placeholders}) LIMIT ?`,
                [currentBook.publisher, ...excludeIds, limit - related.length]
            );
            related.push(...samePublisher);
        }

        // 3. Similar price (fallback)
        if (related.length < limit) {
            const priceRange = currentBook.price * 0.3;
            const excludeIds = related.map(b => b.id).concat(bookId);
            const placeholders = excludeIds.map(() => '?').join(',');
            const [similarPrice] = await pool.query(
                `SELECT * FROM books WHERE id NOT IN (${placeholders}) AND ABS(price - ?) <= ? ORDER BY ABS(id - ?) ASC LIMIT ?`,
                [...excludeIds, currentBook.price, priceRange, bookId, limit - related.length]
            );
            related.push(...similarPrice);
        }

        res.json({ books: related.slice(0, limit).map(parseBookRow) });
    } catch (err) {
        console.error('Get related books error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/books/:id/reviews
router.get('/:id/reviews', async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const [reviews] = await pool.query(`
            SELECT r.*, u.name as user_name, u.avatar as user_avatar
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.book_id = ? 
            ORDER BY r.created_at DESC
        `, [bookId]);

        const formattedReviews = reviews.map(r => ({
            id: r.id,
            userId: r.user_id,
            user: r.user_name || 'Khách',
            avatar: r.user_avatar || null,
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.created_at).toLocaleDateString('vi-VN')
        }));

        res.json({ reviews: formattedReviews });
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// POST /api/books/:id/reviews
router.post('/:id/reviews', optionalAuth, async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const { rating, comment } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Đánh giá từ 1 đến 5 sao' });
        }

        await pool.query('INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)', [userId, bookId, rating, comment]);
            
        const [statsRows] = await pool.query('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE book_id = ?', [bookId]);
        const stats = statsRows[0];
            
        await pool.query('UPDATE books SET rating = ?, review_count = ? WHERE id = ?', [stats.avg || 0, stats.count, bookId]);

        res.json({ success: true, message: 'Đã thêm đánh giá' });
    } catch (err) {
        console.error('Add review error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
