// ========== ADMIN — DASHBOARD ========== //
const express = require('express');
const { getDb } = require('../../database');
const { ORDER_STATUS } = require('../../constants/statusEnum');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const db = getDb();

        // 1. Revenue calculations from completed orders
        const completedOrdersData = db.prepare(
            `SELECT total, created_at FROM orders WHERE status = ?`
        ).all(ORDER_STATUS.COMPLETED);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const thisWeekStart = new Date(today); thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
        const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

        const revenue = { today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, thisMonth: 0, lastMonth: 0, thisYear: 0, lastYear: 0 };

        completedOrdersData.forEach(o => {
            const d = new Date(o.created_at);
            if (d >= today) revenue.today += o.total;
            else if (d >= yesterday && d < today) revenue.yesterday += o.total;

            if (d >= thisWeekStart) revenue.thisWeek += o.total;
            else if (d >= lastWeekStart && d < thisWeekStart) revenue.lastWeek += o.total;

            if (d >= thisMonthStart) revenue.thisMonth += o.total;
            else if (d >= lastMonthStart && d < thisMonthStart) revenue.lastMonth += o.total;

            if (d >= thisYearStart) revenue.thisYear += o.total;
            else if (d >= lastYearStart && d < thisYearStart) revenue.lastYear += o.total;
        });

        const calcGrowth = (current, previous) =>
            previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

        // 2. Order stats
        const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const pendingOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get(ORDER_STATUS.PENDING).count;
        const processingOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get(ORDER_STATUS.PROCESSING).count;
        const completedCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get(ORDER_STATUS.COMPLETED).count;
        const canceledOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get(ORDER_STATUS.CANCELLED).count;

        // 3. User stats
        const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role != 'admin'").get().count;

        // 4. Alerts
        const lowStockBooks = db.prepare('SELECT id, title, stock, images FROM books WHERE stock < 5 ORDER BY stock ASC LIMIT 10').all();
        const stagnantOrders = db.prepare(
            `SELECT id, order_code, created_at, status, total FROM orders 
             WHERE status IN (?, ?) AND datetime(created_at) <= datetime('now', '-3 days') 
             ORDER BY created_at ASC`
        ).all(ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING);

        // 5. Bestsellers (this month)
        const bestsellers = db.prepare(`
            SELECT b.id, b.title, SUM(oi.quantity) as sold_count, b.images
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN books b ON oi.book_id = b.id
            WHERE o.status = ? AND datetime(o.created_at) >= datetime('now', 'start of month')
            GROUP BY b.id ORDER BY sold_count DESC LIMIT 5
        `).all(ORDER_STATUS.COMPLETED);

        res.json({
            revenue: {
                today: { value: revenue.today, growth: calcGrowth(revenue.today, revenue.yesterday) },
                week: { value: revenue.thisWeek, growth: calcGrowth(revenue.thisWeek, revenue.lastWeek) },
                month: { value: revenue.thisMonth, growth: calcGrowth(revenue.thisMonth, revenue.lastMonth) },
                year: { value: revenue.thisYear, growth: calcGrowth(revenue.thisYear, revenue.lastYear) }
            },
            orders: {
                total: totalOrders, pending: pendingOrders, processing: processingOrders,
                completed: completedCount, canceled: canceledOrders,
                cancelRate: totalOrders > 0 ? Math.round((canceledOrders / totalOrders) * 100) : 0
            },
            users: totalUsers,
            alerts: { lowStock: lowStockBooks, stagnantOrders },
            bestsellers
        });
    } catch (err) {
        console.error('Admin Dashboard Error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
