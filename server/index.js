// ========== BOOKSELF SERVER ========== //
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (debug)
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});

// API health check (first route to ensure it works)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.DB_HOST ? 'configured' : 'missing' });
});

// API Routes
try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/books', require('./routes/books'));
    app.use('/api/cart', require('./routes/cart'));
    app.use('/api/orders', require('./routes/orders'));
    app.use('/api/wishlist', require('./routes/wishlist'));
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/marketing', require('./routes/marketing'));
    app.use('/api/chat', require('./routes/chat'));
    console.log('✅ All API routes loaded successfully');
} catch (err) {
    console.error('❌ Failed to load API routes:', err.message);
}

// Fallback for SPA (only non-API routes)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.status(200).json({ message: 'BookSelf API is running. Use /api/* endpoints.' });
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
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
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
