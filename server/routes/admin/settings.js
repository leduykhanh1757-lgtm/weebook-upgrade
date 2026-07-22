// ========== ADMIN — SETTINGS MANAGEMENT (MYSQL) ========== //
const express = require('express');
const { pool } = require('../../database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT `key`, `value` FROM settings');
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.key] = s.value; });
        res.json(settingsObj);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/', async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await pool.query("UPDATE settings SET `value` = ?, updated_at = NOW() WHERE `key` = ?", [value, key]);
        }
        res.json({ message: 'Cập nhật cấu hình thành công' });
    } catch (err) {
        console.error('PUT /settings Error:', err);
        res.status(500).json({ error: 'Lỗi server: ' + err.message });
    }
});

module.exports = router;
