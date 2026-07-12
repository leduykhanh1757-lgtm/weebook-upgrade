const db = require('better-sqlite3')('bookself.db');

console.log("Starting DB update for Admin Phase 2...");

// Create Categories Table
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      parent_id INTEGER DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
  );
`);
console.log("Categories table ensured.");

// Create Authors Table
db.exec(`
  CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      bio TEXT,
      image TEXT,
      created_at TEXT DEFAULT (datetime('now'))
  );
`);
console.log("Authors table ensured.");

// Create Publishers Table
db.exec(`
  CREATE TABLE IF NOT EXISTS publishers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
  );
`);
console.log("Publishers table ensured.");

// Update Books Table
const booksInfo = db.prepare('PRAGMA table_info(books)').all();
const hasImportPrice = booksInfo.some(col => col.name === 'import_price');
const hasIsVisible = booksInfo.some(col => col.name === 'is_visible');

if (!hasImportPrice) {
    db.prepare('ALTER TABLE books ADD COLUMN import_price INTEGER DEFAULT 0').run();
    console.log("Added import_price to books.");
}

if (!hasIsVisible) {
    db.prepare('ALTER TABLE books ADD COLUMN is_visible INTEGER DEFAULT 1').run();
    console.log("Added is_visible to books.");
}

// Update Reviews Table
const reviewsInfo = db.prepare('PRAGMA table_info(reviews)').all();
const hasStatus = reviewsInfo.some(col => col.name === 'status');

if (!hasStatus) {
    db.prepare("ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'approved'").run();
    console.log("Added status to reviews.");
}

// Seed basic categories if empty
const count = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
if (count === 0) {
    const stmt = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
    stmt.run('Văn học', 'van-hoc');
    stmt.run('Kinh tế', 'kinh-te');
    stmt.run('Kỹ năng', 'ky-nang');
    stmt.run('Thiếu nhi', 'thieu-nhi');
    stmt.run('Ngoại ngữ', 'ngoai-ngu');
    console.log("Seeded basic categories.");
}

console.log("DB Update Complete!");
