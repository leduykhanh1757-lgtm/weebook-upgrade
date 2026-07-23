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

    // NON-DESTRUCTIVE SEEDING: Keep user data intact!
    // Truncate should ONLY be run explicitly if the developer manually passes --force
    const isForce = process.argv.includes('--force');
    if (isForce) {
        console.log('⚠️ --force flag detected: Resetting tables...');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('TRUNCATE TABLE order_items');
        await pool.query('TRUNCATE TABLE orders');
        await pool.query('TRUNCATE TABLE cart');
        await pool.query('TRUNCATE TABLE wishlist');
        await pool.query('TRUNCATE TABLE reviews');
        await pool.query('TRUNCATE TABLE addresses');
        await pool.query('TRUNCATE TABLE banners');
        await pool.query('TRUNCATE TABLE books');
        await pool.query('TRUNCATE TABLE users');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    } else {
        console.log('ℹ️ Running non-destructive seed (preserving user data)...');
    }

    // Seed admin user
    const adminPassword = await bcrypt.hash('12345678', 10);
    const [adminResult] = await pool.query(
        'INSERT IGNORE INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Administrator', 'admin@bookshelf.com', '0912345678', adminPassword, 'admin']
    );

    // Seed demo user
    const userPassword = await bcrypt.hash('12345678', 10);
    const [userResult] = await pool.query(
        'INSERT IGNORE INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Nguyễn Văn A', 'user@bookshelf.com', '0987654321', userPassword, 'user']
    );

    // Seed books
    const insertBookQuery = `
        INSERT IGNORE INTO books (id, title, author, publisher, publish_date, category, subcategory, price, original_price, discount, isbn, pages, language, format, weight, dimensions, stock, rating, review_count, images, description, tags, featured, new_release)
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

    // Seed sample demo orders ONLY if orders table is empty
    const [existingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
    if (existingOrders[0].count === 0) {
        const [order1] = await pool.query(
            `INSERT INTO orders (user_id, order_code, full_name, email, phone, address, city, district, ward, notes, subtotal, shipping_cost, discount_amount, total, status, payment_method, payment_status, created_at)
             VALUES (?, 'ORD-20240701-001', 'Nguyễn Văn A', 'user@bookshelf.com', '0987654321', '456 Đường Cầu Giấy, Phường Dịch Vọng', 'Thành phố Hà Nội', 'Quận Cầu Giấy', 'Phường Dịch Vọng', 'Giao trong giờ hành chính', 425000, 25000, 0, 450000, 'completed', 'cod', 'paid', NOW() - INTERVAL 5 DAY)`
        , [userResult.insertId]);

        await pool.query(
            `INSERT INTO order_items (order_id, book_id, title, author, price, quantity, total, image)
             VALUES (?, 1, 'Nexus - Lược sử của những lưới thông tin từ Thời Đồ Đá đến AI', 'Yuval Noah Harari', 325000, 1, 325000, '/src/assets/images/logo.png'),
                    (?, 3, 'All That IELTS - Trợ thủ giúp giảm nỗi lo trong phần thi Speaking', 'Gamma Books', 100000, 1, 100000, '/src/assets/images/logo.png')`
        , [order1.insertId, order1.insertId]);

        const [order2] = await pool.query(
            `INSERT INTO orders (user_id, order_code, full_name, email, phone, address, city, district, ward, notes, subtotal, shipping_cost, discount_amount, total, status, payment_method, payment_status, created_at)
             VALUES (?, 'ORD-20240702-002', 'Nguyễn Văn A', 'user@bookshelf.com', '0987654321', '456 Đường Cầu Giấy, Phường Dịch Vọng', 'Thành phố Hà Nội', 'Quận Cầu Giấy', 'Phường Dịch Vọng', 'Gọi trước khi giao 15p', 279000, 20000, 0, 299000, 'pending', 'bank', 'unpaid', NOW() - INTERVAL 1 DAY)`
        , [userResult.insertId]);

        await pool.query(
            `INSERT INTO order_items (order_id, book_id, title, author, price, quantity, total, image)
             VALUES (?, 4, 'Quản trị công ty hiện đại', 'Alpha Books', 279000, 1, 279000, '/src/assets/images/logo.png')`
        , [order2.insertId]);

        const [order3] = await pool.query(
            `INSERT INTO orders (user_id, order_code, full_name, email, phone, address, city, district, ward, notes, subtotal, shipping_cost, discount_amount, total, status, payment_method, payment_status, created_at)
             VALUES (?, 'ORD-20240703-003', 'Administrator', 'admin@bookshelf.com', '0912345678', '123 Đường Nguyễn Huệ, Phường Bến Nghé', 'Thành phố Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '', 199000, 0, 0, 199000, 'shipped', 'momo', 'paid', NOW())`
        , [adminResult.insertId]);

        await pool.query(
            `INSERT INTO order_items (order_id, book_id, title, author, price, quantity, total, image)
             VALUES (?, 5, 'Quy tắc số 1', 'Phil Town', 199000, 1, 199000, '/src/assets/images/logo.png')`
        , [order3.insertId]);

        console.log('📦 Sample demo orders created');
    }

    // Verify
    const [bookRows] = await pool.query('SELECT COUNT(*) as count FROM books');
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [orderRows] = await pool.query('SELECT COUNT(*) as count FROM orders');
    console.log(`\n📊 MySQL Database stats:`);
    console.log(`   Books: ${bookRows[0].count}`);
    console.log(`   Users: ${userRows[0].count}`);
    console.log(`   Orders: ${orderRows[0].count}`);
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
