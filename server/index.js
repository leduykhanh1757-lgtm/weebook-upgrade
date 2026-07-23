// ========== BOOKSELF SERVER ========== //
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');

// Catch ALL crashes — prevent silent exit
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 UNHANDLED REJECTION:', reason);
});
process.on('exit', (code) => {
    console.log('🔴 PROCESS EXIT with code:', code);
});

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});

// API health check (first route)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), port: PORT });
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

// Fallback
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

// Start server - bind to 0.0.0.0 explicitly for Render
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
    console.log(`📖 Health: http://0.0.0.0:${PORT}/api/health`);
});

server.on('error', (err) => {
    console.error('💥 SERVER ERROR:', err.message);
});

// Heartbeat - log every 30s to confirm process is alive
setInterval(() => {
    console.log(`💓 heartbeat - ${new Date().toISOString()} - connections: ${server.listening}`);
}, 30000);

// Initialize database (async, non-blocking)
initializeDatabase().catch(err => {
    console.error('❌ DB init error:', err.message);
});
