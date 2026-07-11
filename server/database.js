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
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            publisher TEXT,
            publish_date TEXT,
            category TEXT NOT NULL,
            subcategory TEXT,
            price INTEGER NOT NULL,
            original_price INTEGER,
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
            order_code TEXT,
            user_id INTEGER NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            city TEXT,
            district TEXT,
            ward TEXT,
            address TEXT NOT NULL,
            delivery_method TEXT DEFAULT 'standard',
            payment_method TEXT DEFAULT 'cod',
            notes TEXT,
            subtotal INTEGER NOT NULL,
            shipping_cost INTEGER DEFAULT 0,
            total INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            receiver_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            full_address TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

    console.log('✅ Database initialized successfully');
}

module.exports = { getDb, initializeDatabase };
