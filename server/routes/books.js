// ========== BOOKS ROUTES ========== //
const express = require('express');
const { getDb } = require('../database');

const router = express.Router();

// GET /api/books - List books with filters, search, pagination, sort
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const {
            page = 1,
            limit = 30,
            category,
            subcategory,
            search,
            sort = 'default',
            price_min,
            price_max,
            type // 'featured' or 'new'
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
        const { total } = db.prepare(countQuery).get(...params);

        // Get paginated results
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const dataQuery = `SELECT * FROM books ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
        const books = db.prepare(dataQuery).all(...params, parseInt(limit), offset);

        // Parse JSON fields
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
router.get('/featured', (req, res) => {
    try {
        const db = getDb();
        const limit = parseInt(req.query.limit) || 10;
        const books = db.prepare('SELECT * FROM books WHERE featured = 1 LIMIT ?').all(limit);
        res.json({ books: books.map(parseBookRow) });
    } catch (err) {
        console.error('Get featured error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/books/new
router.get('/new', (req, res) => {
    try {
        const db = getDb();
        const limit = parseInt(req.query.limit) || 10;
        const books = db.prepare('SELECT * FROM books WHERE new_release = 1 LIMIT ?').all(limit);
        res.json({ books: books.map(parseBookRow) });
    } catch (err) {
        console.error('Get new releases error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// GET /api/books/categories - Get distinct categories
router.get('/categories', (req, res) => {
    try {
        const db = getDb();
        const categories = db.prepare('SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category ASC').all();
        
        // Also get subcategories if needed, or group them
        const subcategories = db.prepare('SELECT DISTINCT category, subcategory FROM books WHERE subcategory IS NOT NULL ORDER BY category, subcategory ASC').all();

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
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const book = db.prepare('SELECT * FROM books WHERE id = ?').get(parseInt(req.params.id));

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
router.get('/:id/related', (req, res) => {
    try {
        const db = getDb();
        const limit = parseInt(req.query.limit) || 4;
        const bookId = parseInt(req.params.id);

        const currentBook = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
        if (!currentBook) {
            return res.status(404).json({ error: 'Không tìm thấy sách!' });
        }

        // Algorithm: same category first, then same publisher, then similar price
        let related = [];

        // 1. Same category
        const sameCategory = db.prepare(
            'SELECT * FROM books WHERE category = ? AND id != ? ORDER BY ABS(id - ?) ASC LIMIT ?'
        ).all(currentBook.category, bookId, bookId, limit);
        related.push(...sameCategory);

        // 2. Same publisher (if still need more)
        if (related.length < limit && currentBook.publisher) {
            const samePublisher = db.prepare(
                'SELECT * FROM books WHERE publisher = ? AND id != ? AND id NOT IN (' + related.map(b => b.id).join(',') + (related.length ? '' : '0') + ') LIMIT ?'
            ).all(currentBook.publisher, bookId, limit - related.length);
            related.push(...samePublisher);
        }

        // 3. Similar price (fallback)
        if (related.length < limit) {
            const priceRange = currentBook.price * 0.3;
            const excludeIds = related.map(b => b.id).concat(bookId);
            const placeholders = excludeIds.map(() => '?').join(',');
            const similarPrice = db.prepare(
                `SELECT * FROM books WHERE id NOT IN (${placeholders}) AND ABS(price - ?) <= ? ORDER BY ABS(id - ?) ASC LIMIT ?`
            ).all(...excludeIds, currentBook.price, priceRange, bookId, limit - related.length);
            related.push(...similarPrice);
        }

        res.json({ books: related.slice(0, limit).map(parseBookRow) });
    } catch (err) {
        console.error('Get related books error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

// Helper: parse JSON fields from SQLite row
function parseBookRow(book) {
    return {
        ...book,
        images: JSON.parse(book.images || '[]'),
        tags: JSON.parse(book.tags || '[]'),
        featured: !!book.featured,
        newRelease: !!book.new_release
    };
}

// GET /api/books/:id/reviews
router.get('/:id/reviews', (req, res) => {
    try {
        const db = getDb();
        const bookId = parseInt(req.params.id);
        const reviews = db.prepare(`
            SELECT r.*, u.name as user_name, u.avatar as user_avatar
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.book_id = ? 
            ORDER BY r.created_at DESC
        `).all(bookId);

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

const { optionalAuth } = require('../middleware/auth');

// POST /api/books/:id/reviews
router.post('/:id/reviews', optionalAuth, (req, res) => {
    try {
        const db = getDb();
        const bookId = parseInt(req.params.id);
        const { rating, comment } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Đánh giá từ 1 đến 5 sao' });
        }

        const addReviewTx = db.transaction(() => {
            db.prepare('INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)').run(userId, bookId, rating, comment);
            
            const stats = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE book_id = ?').get(bookId);
            
            db.prepare('UPDATE books SET rating = ?, review_count = ? WHERE id = ?').run(stats.avg || 0, stats.count, bookId);
        });

        addReviewTx();

        res.json({ success: true, message: 'Đã thêm đánh giá' });
    } catch (err) {
        console.error('Add review error:', err);
        res.status(500).json({ error: 'Lỗi server!' });
    }
});

module.exports = router;
