// ========== SEED DATABASE ========== //
// Import data from data.js into SQLite
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb, initializeDatabase } = require('./database');

// Load the book data from data.js
// We need to simulate a browser environment for data.js
const vm = require('vm');
const fs = require('fs');

function seed() {
    console.log('🌱 Starting database seed...');

    // Initialize database tables
    initializeDatabase();

    const db = getDb();

    // Load and parse data.js
    let dataJs = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf-8');
    // Append export so we can extract it from the sandbox
    dataJs += '\nmodule.exports = { BOOK_DATABASE };\n';

    // Create a sandbox to execute data.js
    const sandbox = { module: { exports: {} }, console };
    const context = vm.createContext(sandbox);
    vm.runInContext(dataJs, context);

    const BOOK_DATABASE = sandbox.module.exports.BOOK_DATABASE;

    if (!BOOK_DATABASE) {
        console.error('❌ Could not load BOOK_DATABASE from data.js');
        process.exit(1);
    }

    const books = Object.values(BOOK_DATABASE);
    console.log(`📚 Found ${books.length} books to import`);

    // Clear existing data
    db.exec('DELETE FROM order_items');
    db.exec('DELETE FROM orders');
    db.exec('DELETE FROM cart');
    db.exec('DELETE FROM wishlist');
    db.exec('DELETE FROM reviews');
    db.exec('DELETE FROM books');
    db.exec('DELETE FROM users');

    // Seed admin user
    const adminPassword = bcrypt.hashSync('12345678', 10);
    db.prepare(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
    ).run('Administrator', 'admin@bookshelf.com', '0912345678', adminPassword, 'admin');
    console.log('👤 Admin account created: admin@bookshelf.com / 12345678');

    // Seed demo user
    const userPassword = bcrypt.hashSync('12345678', 10);
    db.prepare(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
    ).run('Nguyễn Văn A', 'user@bookshelf.com', '0987654321', userPassword, 'user');
    console.log('👤 Demo user created: user@bookshelf.com / 12345678');

    // Seed books
    const insertBook = db.prepare(`
        INSERT OR REPLACE INTO books (id, title, author, publisher, publish_date, category, subcategory, price, original_price, discount, isbn, pages, language, format, weight, dimensions, stock, rating, review_count, images, description, tags, featured, new_release)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((books) => {
        for (const book of books) {
            insertBook.run(
                book.id,
                book.title,
                book.author,
                book.publisher || null,
                book.publishDate || null,
                book.category,
                book.subcategory || null,
                book.price,
                book.originalPrice || book.price,
                book.discount || 0,
                book.isbn || null,
                book.pages || null,
                book.language || null,
                book.format || null,
                book.weight || null,
                book.dimensions || null,
                book.stock || 0,
                book.rating || 0,
                book.reviewCount || 0,
                JSON.stringify(book.images || []),
                book.description || '',
                JSON.stringify(book.tags || []),
                book.featured ? 1 : 0,
                book.newRelease ? 1 : 0
            );
        }
    });

    insertMany(books);
    console.log(`✅ Imported ${books.length} books`);

    // Verify
    const count = db.prepare('SELECT COUNT(*) as count FROM books').get();
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log(`\n📊 Database stats:`);
    console.log(`   Books: ${count.count}`);
    console.log(`   Users: ${userCount.count}`);
    console.log('\n✅ Seed completed successfully!');
}

seed();
