// ========== MYSQL DATABASE SETUP ========== //
require('dotenv').config();
const mysql = require('mysql2/promise');

const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'defaultdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    ssl: sslConfig
});

async function initializeDatabase() {
    try {
        const dbName = process.env.DB_NAME || 'defaultdb';

        // Run DDL to create tables if missing
        const schemaSql = `
        USE \`${dbName}\`;

        CREATE TABLE IF NOT EXISTS \`users\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`name\` VARCHAR(255) NOT NULL,
            \`email\` VARCHAR(255) NOT NULL UNIQUE,
            \`phone\` VARCHAR(50),
            \`password\` VARCHAR(255) NOT NULL,
            \`role\` VARCHAR(20) DEFAULT 'user',
            \`birthday\` VARCHAR(50),
            \`address\` TEXT,
            \`gender\` VARCHAR(20) DEFAULT 'Khác',
            \`avatar\` LONGTEXT,
            \`email_verified\` TINYINT DEFAULT 1,
            \`phone_verified\` TINYINT DEFAULT 0,
            \`newsletter_subscribed\` TINYINT DEFAULT 1,
            \`helpful_votes\` INT DEFAULT 0,
            \`status\` VARCHAR(20) DEFAULT 'active',
            \`reset_code\` VARCHAR(100),
            \`reset_code_expires\` VARCHAR(100),
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS \`subscribers\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`email\` VARCHAR(255) NOT NULL UNIQUE,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS \`categories\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`name\` VARCHAR(255) NOT NULL,
            \`slug\` VARCHAR(255) NOT NULL UNIQUE,
            \`parent_id\` INT DEFAULT NULL,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS \`authors\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`name\` VARCHAR(255) NOT NULL,
            \`bio\` TEXT,
            \`image\` TEXT,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS \`publishers\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`name\` VARCHAR(255) NOT NULL,
            \`description\` TEXT,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS \`books\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`title\` VARCHAR(255) NOT NULL,
            \`slug\` VARCHAR(255),
            \`author\` VARCHAR(255) NOT NULL,
            \`publisher\` VARCHAR(255),
            \`publish_date\` VARCHAR(50),
            \`category\` VARCHAR(100) NOT NULL,
            \`subcategory\` VARCHAR(100),
            \`price\` INT NOT NULL,
            \`original_price\` INT,
            \`import_price\` INT DEFAULT 0,
            \`discount\` INT DEFAULT 0,
            \`isbn\` VARCHAR(100),
            \`pages\` INT,
            \`language\` VARCHAR(50),
            \`format\` VARCHAR(50),
            \`weight\` VARCHAR(50),
            \`dimensions\` VARCHAR(50),
            \`stock\` INT DEFAULT 0,
            \`rating\` DOUBLE DEFAULT 0,
            \`review_count\` INT DEFAULT 0,
            \`images\` LONGTEXT,
            \`description\` LONGTEXT,
            \`tags\` LONGTEXT,
            \`featured\` TINYINT DEFAULT 0,
            \`new_release\` TINYINT DEFAULT 0,
            \`is_visible\` TINYINT DEFAULT 1,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX \`idx_books_category\` (\`category\`),
            INDEX \`idx_books_subcategory\` (\`subcategory\`),
            INDEX \`idx_books_featured\` (\`featured\`),
            INDEX \`idx_books_new_release\` (\`new_release\`)
        );

        CREATE TABLE IF NOT EXISTS \`cart\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`user_id\` INT NOT NULL,
            \`book_id\` INT NOT NULL,
            \`quantity\` INT DEFAULT 1,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
            FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE,
            UNIQUE KEY \`unique_user_book\` (\`user_id\`, \`book_id\`),
            INDEX \`idx_cart_user\` (\`user_id\`)
        );

        CREATE TABLE IF NOT EXISTS \`wishlist\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`user_id\` INT NOT NULL,
            \`book_id\` INT NOT NULL,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
            FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE,
            UNIQUE KEY \`unique_wishlist\` (\`user_id\`, \`book_id\`),
            INDEX \`idx_wishlist_user\` (\`user_id\`)
        );

        CREATE TABLE IF NOT EXISTS \`orders\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`user_id\` INT,
            \`order_code\` VARCHAR(100) UNIQUE,
            \`full_name\` VARCHAR(255) NOT NULL,
            \`email\` VARCHAR(255),
            \`phone\` VARCHAR(50) NOT NULL,
            \`address\` TEXT NOT NULL,
            \`city\` VARCHAR(100),
            \`district\` VARCHAR(100),
            \`ward\` VARCHAR(100),
            \`notes\` TEXT,
            \`subtotal\` DOUBLE NOT NULL,
            \`shipping_cost\` DOUBLE NOT NULL,
            \`discount_amount\` DOUBLE DEFAULT 0,
            \`total\` DOUBLE NOT NULL,
            \`status\` VARCHAR(50) DEFAULT 'pending',
            \`payment_method\` VARCHAR(50) NOT NULL,
            \`payment_status\` VARCHAR(50) DEFAULT 'unpaid',
            \`coupon_code\` VARCHAR(50),
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`),
            INDEX \`idx_orders_user\` (\`user_id\`)
        );

        CREATE TABLE IF NOT EXISTS \`order_items\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`order_id\` INT NOT NULL,
            \`book_id\` INT NOT NULL,
            \`title\` VARCHAR(255) NOT NULL,
            \`author\` VARCHAR(255),
            \`price\` INT NOT NULL,
            \`quantity\` INT NOT NULL,
            \`total\` INT NOT NULL,
            \`image\` TEXT,
            FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE,
            FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`),
            INDEX \`idx_order_items_order\` (\`order_id\`)
        );

        CREATE TABLE IF NOT EXISTS \`reviews\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`user_id\` INT,
            \`book_id\` INT NOT NULL,
            \`rating\` INT NOT NULL CHECK (\`rating\` >= 1 AND \`rating\` <= 5),
            \`comment\` TEXT,
            \`status\` VARCHAR(50) DEFAULT 'approved',
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
            FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS \`addresses\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`user_id\` INT,
            \`receiver_name\` VARCHAR(255) NOT NULL,
            \`phone\` VARCHAR(50) NOT NULL,
            \`full_address\` TEXT NOT NULL,
            \`is_default\` TINYINT DEFAULT 0,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`),
            INDEX \`idx_addresses_user\` (\`user_id\`)
        );

        CREATE TABLE IF NOT EXISTS \`coupons\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`code\` VARCHAR(50) NOT NULL UNIQUE,
            \`discount_type\` VARCHAR(20) NOT NULL,
            \`discount_value\` DOUBLE NOT NULL,
            \`min_order_value\` DOUBLE DEFAULT 0,
            \`max_uses\` INT DEFAULT NULL,
            \`used_count\` INT DEFAULT 0,
            \`start_date\` VARCHAR(50),
            \`end_date\` VARCHAR(50),
            \`status\` VARCHAR(20) DEFAULT 'active',
            \`user_email\` VARCHAR(255),
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS \`banners\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`image_url\` TEXT NOT NULL,
            \`title\` VARCHAR(255),
            \`description\` TEXT,
            \`link_url\` TEXT,
            \`is_active\` TINYINT DEFAULT 1,
            \`sort_order\` INT DEFAULT 0,
            \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS \`settings\` (
            \`id\` INT AUTO_INCREMENT PRIMARY KEY,
            \`key\` VARCHAR(100) NOT NULL UNIQUE,
            \`value\` TEXT,
            \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        `;

        await pool.query(schemaSql);

        // Seed basic categories if empty
        const [catRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
        if (catRows[0].count === 0) {
            await pool.query(`
                INSERT INTO categories (name, slug) VALUES 
                ('Văn học', 'van-hoc'),
                ('Kinh tế', 'kinh-te'),
                ('Kỹ năng', 'ky-nang'),
                ('Thiếu nhi', 'thieu-nhi'),
                ('Ngoại ngữ', 'ngoai-ngu');
            `);
        }

        // Seed default settings if empty
        const [settingRows] = await pool.query('SELECT COUNT(*) as count FROM settings');
        if (settingRows[0].count === 0) {
            await pool.query(`
                INSERT INTO settings (\`key\`, \`value\`) VALUES 
                ('store_email', 'support@bookself.vn'),
                ('store_phone', '1900 1508'),
                ('store_address', '123 Đường Sách, Quận 1, TP.HCM'),
                ('shipping_fee', '30000');
            `);
        }

        // Seed authors & publishers if empty (extracted safely from books)
        const [authorRows] = await pool.query('SELECT COUNT(*) as count FROM authors');
        if (authorRows[0].count === 0) {
            const [bookAuthors] = await pool.query('SELECT DISTINCT author FROM books WHERE author IS NOT NULL AND author != ""');
            for (const row of bookAuthors) {
                await pool.query('INSERT IGNORE INTO authors (name) VALUES (?)', [row.author.trim()]);
            }
        }

        const [publisherRows] = await pool.query('SELECT COUNT(*) as count FROM publishers');
        if (publisherRows[0].count === 0) {
            const [bookPublishers] = await pool.query('SELECT DISTINCT publisher FROM books WHERE publisher IS NOT NULL AND publisher != ""');
            for (const row of bookPublishers) {
                await pool.query('INSERT IGNORE INTO publishers (name) VALUES (?)', [row.publisher.trim()]);
            }
        }

        console.log('✅ MySQL Database & Tables initialized successfully');
    } catch (err) {
        console.error('❌ Failed to initialize MySQL Database:', err);
    }
}

// Helper query function for convenience
async function query(sql, params = []) {
    const [results] = await pool.query(sql, params);
    return results;
}

module.exports = { pool, query, initializeDatabase };
