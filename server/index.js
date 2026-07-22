// ========== BOOKSELF SERVER ========== //
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (production build if client/dist exists)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/books', require('./routes/books'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/chat', require('./routes/chat'));

// API health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback: serve client/dist/index.html or redirect to Vite dev server
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        const indexPath = path.join(__dirname, '../client/dist/index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.redirect('http://localhost:5173' + req.path);
        }
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 BookSelf Server running at http://localhost:${PORT}`);
    console.log(`📖 API: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend (Vite Dev): http://localhost:5173\n`);
});
