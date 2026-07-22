// ========== SEED MYSQL DATABASE ========== //
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const bcrypt = require('bcryptjs');
const { pool, initializeDatabase } = require('./database');

async function seed() {
    console.log('🌱 Starting MySQL database seed...');

    // Initialize database tables
    await initializeDatabase();

    // Load and parse data.js
    let dataJs = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf-8');
    dataJs += '\nmodule.exports = { BOOK_DATABASE };\n';

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

    // Disable foreign key checks to safely truncate
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE order_items');
    await pool.query('TRUNCATE TABLE orders');
    await pool.query('TRUNCATE TABLE cart');
    await pool.query('TRUNCATE TABLE wishlist');
    await pool.query('TRUNCATE TABLE reviews');
    await pool.query('TRUNCATE TABLE addresses');
    await pool.query('TRUNCATE TABLE books');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // Seed admin user
    const adminPassword = await bcrypt.hash('12345678', 10);
    const [adminResult] = await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Administrator', 'admin@bookshelf.com', '0912345678', adminPassword, 'admin']
    );
    console.log('👤 Admin account created: admin@bookshelf.com / 12345678');

    // Seed demo user
    const userPassword = await bcrypt.hash('12345678', 10);
    const [userResult] = await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Nguyễn Văn A', 'user@bookshelf.com', '0987654321', userPassword, 'user']
    );
    console.log('👤 Demo user created: user@bookshelf.com / 12345678');

    // Seed default addresses for demo user & admin
    await pool.query(
        'INSERT INTO addresses (user_id, receiver_name, phone, full_address, is_default) VALUES (?, ?, ?, ?, ?)',
        [adminResult.insertId, 'Administrator', '0912345678', '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh', 1]
    );
    await pool.query(
        'INSERT INTO addresses (user_id, receiver_name, phone, full_address, is_default) VALUES (?, ?, ?, ?, ?)',
        [userResult.insertId, 'Nguyễn Văn A', '0987654321', '456 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Thành phố Hà Nội', 1]
    );
    console.log('🏠 Default addresses seeded for Admin and Demo User');

    // Seed books
    const insertBookQuery = `
        INSERT INTO books (id, title, author, publisher, publish_date, category, subcategory, price, original_price, discount, isbn, pages, language, format, weight, dimensions, stock, rating, review_count, images, description, tags, featured, new_release)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const book of books) {
        await pool.query(insertBookQuery, [
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
        ]);
    }
    console.log(`✅ Imported ${books.length} books into MySQL`);

    // Verify
    const [bookRows] = await pool.query('SELECT COUNT(*) as count FROM books');
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [addressRows] = await pool.query('SELECT COUNT(*) as count FROM addresses');
    console.log(`\n📊 MySQL Database stats:`);
    console.log(`   Books: ${bookRows[0].count}`);
    console.log(`   Users: ${userRows[0].count}`);
    console.log(`   Addresses: ${addressRows[0].count}`);
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
