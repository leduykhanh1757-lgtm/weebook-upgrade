// ========== DATABASE SETUP ========== //
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'bookself.db');

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
    }
    return db;
}

function initializeDatabase() {
    const db = getDb();

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            birthday TEXT,
            address TEXT,
            gender TEXT DEFAULT 'Khác',
            avatar TEXT,
            email_verified INTEGER DEFAULT 1,
            phone_verified INTEGER DEFAULT 0,
            newsletter_subscribed INTEGER DEFAULT 1,
            helpful_votes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            reset_code TEXT,
            reset_code_expires TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            parent_id INTEGER DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS authors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            bio TEXT,
            image TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS publishers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT,
            author TEXT NOT NULL,
            publisher TEXT,
            publish_date TEXT,
            category TEXT NOT NULL,
            subcategory TEXT,
            price INTEGER NOT NULL,
            original_price INTEGER,
            import_price INTEGER DEFAULT 0,
            discount INTEGER DEFAULT 0,
            isbn TEXT,
            pages INTEGER,
            language TEXT,
            format TEXT,
            weight TEXT,
            dimensions TEXT,
            stock INTEGER DEFAULT 0,
            rating REAL DEFAULT 0,
            review_count INTEGER DEFAULT 0,
            images TEXT, -- JSON array
            description TEXT,
            tags TEXT, -- JSON array
            featured INTEGER DEFAULT 0,
            new_release INTEGER DEFAULT 0,
            is_visible INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE(user_id, book_id)
        );

        CREATE TABLE IF NOT EXISTS wishlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE(user_id, book_id)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            order_code TEXT UNIQUE,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT,
            district TEXT,
            ward TEXT,
            notes TEXT,
            subtotal REAL NOT NULL,
            shipping_cost REAL NOT NULL,
            discount_amount REAL DEFAULT 0,
            total REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_method TEXT NOT NULL,
            payment_status TEXT DEFAULT 'unpaid',
            coupon_code TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            author TEXT,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            total INTEGER NOT NULL,
            image TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id)
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            book_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            status TEXT DEFAULT 'approved',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            receiver_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            full_address TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT NOT NULL, -- 'percent' or 'fixed'
            discount_value REAL NOT NULL,
            min_order_value REAL DEFAULT 0,
            max_uses INTEGER DEFAULT NULL,
            used_count INTEGER DEFAULT 0,
            start_date TEXT,
            end_date TEXT,
            status TEXT DEFAULT 'active',
            user_email TEXT, -- NULL for global, email for private
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS banners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_url TEXT NOT NULL,
            title TEXT,
            description TEXT,
            link_url TEXT,
            is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            updated_at TEXT DEFAULT (datetime('now'))
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
        CREATE INDEX IF NOT EXISTS idx_books_subcategory ON books(subcategory);
        CREATE INDEX IF NOT EXISTS idx_books_featured ON books(featured);
        CREATE INDEX IF NOT EXISTS idx_books_new_release ON books(new_release);
        CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
        CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
        CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
        CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
    `);

    // Seed basic categories if empty
    const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    if (catCount === 0) {
        const insertCat = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
        insertCat.run('Văn học', 'van-hoc');
        insertCat.run('Kinh tế', 'kinh-te');
        insertCat.run('Kỹ năng', 'ky-nang');
        insertCat.run('Thiếu nhi', 'thieu-nhi');
        insertCat.run('Ngoại ngữ', 'ngoai-ngu');
    }

    // Seed default settings if empty
    const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get().count;
    if (settingsCount === 0) {
        const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
        insertSetting.run('store_email', 'support@bookself.vn');
        insertSetting.run('store_phone', '1900 1508');
        insertSetting.run('store_address', '123 Đường Sách, Quận 1, TP.HCM');
        insertSetting.run('shipping_fee', '30000');
    }

    console.log('✅ Database initialized successfully');
}

module.exports = { getDb, initializeDatabase };
