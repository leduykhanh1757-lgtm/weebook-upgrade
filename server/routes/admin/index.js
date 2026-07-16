// ========== ADMIN ROUTES — MAIN ROUTER ========== //
const express = require('express');
const { requireAuth, requireRoles } = require('../../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

// --- Sub-routers ---
const dashboardRouter = require('./dashboard');
const booksRouter = require('./books');
const ordersRouter = require('./orders');
const categoriesRouter = require('./categories');
const authorsRouter = require('./authors');
const reviewsRouter = require('./reviews');
const usersRouter = require('./users');
const marketingRouter = require('./marketing');
const settingsRouter = require('./settings');
const staffRouter = require('./staff');

// --- RBAC (Role-Based Access Control) ---
const catalogRoles = requireRoles(['admin', 'inventory_manager']);
const csRoles = requireRoles(['admin', 'customer_service']);
const adminOnly = requireRoles(['admin']);

// Mount with role guards
router.use('/dashboard', requireRoles(['admin', 'inventory_manager', 'customer_service']), dashboardRouter);

router.use('/books', catalogRoles, booksRouter);
router.use('/categories', catalogRoles, categoriesRouter);
router.use('/authors', catalogRoles, authorsRouter);
router.use('/publishers', catalogRoles, authorsRouter); // Shares router with authors

router.use('/orders', csRoles, ordersRouter);
router.use('/reviews', csRoles, reviewsRouter);

router.use('/users', adminOnly, usersRouter);
router.use('/coupons', adminOnly, marketingRouter);
router.use('/banners', adminOnly, marketingRouter);

router.use('/settings', adminOnly, settingsRouter);
router.use('/staff', adminOnly, staffRouter);

module.exports = router;
