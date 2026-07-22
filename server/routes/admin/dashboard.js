// ========== ADMIN — DASHBOARD (MYSQL) ========== //
const express = require('express');
const { pool } = require('../../database');
const { ORDER_STATUS } = require('../../constants/statusEnum');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // 1. Revenue calculations from completed orders
        const [completedOrdersData] = await pool.query(
            `SELECT total, created_at FROM orders WHERE status = ?`,
            [ORDER_STATUS.COMPLETED]
        );

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
        const [totalOrderRows] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [pendingOrderRows] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = ?', [ORDER_STATUS.PENDING]);
        const [processingOrderRows] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = ?', [ORDER_STATUS.PROCESSING]);
        const [completedRows] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = ?', [ORDER_STATUS.COMPLETED]);
        const [canceledOrderRows] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = ?', [ORDER_STATUS.CANCELLED]);

        const totalOrders = totalOrderRows[0].count;
        const pendingOrders = pendingOrderRows[0].count;
        const processingOrders = processingOrderRows[0].count;
        const completedCount = completedRows[0].count;
        const canceledOrders = canceledOrderRows[0].count;

        // 3. User stats
        const [userRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
        const totalUsers = userRows[0].count;

        // 4. Alerts
        const [lowStockBooks] = await pool.query('SELECT id, title, stock, images FROM books WHERE stock < 5 ORDER BY stock ASC LIMIT 10');
        const [stagnantOrders] = await pool.query(
            `SELECT id, order_code, created_at, status, total FROM orders 
             WHERE status IN (?, ?) AND created_at <= DATE_SUB(NOW(), INTERVAL 3 DAY) 
             ORDER BY created_at ASC`,
            [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING]
        );

        // 5. Bestsellers (this month)
        const [bestsellers] = await pool.query(`
            SELECT b.id, b.title, SUM(oi.quantity) as sold_count, b.images
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN books b ON oi.book_id = b.id
            WHERE o.status = ? AND o.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
            GROUP BY b.id, b.title, b.images ORDER BY sold_count DESC LIMIT 5
        `, [ORDER_STATUS.COMPLETED]);

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
