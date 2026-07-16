// ========== ADMIN — SETTINGS MANAGEMENT ========== //
const express = require('express');
const { getDb } = require('../../database');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const db = getDb();
        const settings = db.prepare('SELECT key, value FROM settings').all();
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.key] = s.value; });
        res.json(settingsObj);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.put('/', (req, res) => {
    try {
        const db = getDb();
        const settings = req.body;
        const stmt = db.prepare("UPDATE settings SET value = ?, updated_at = datetime('now') WHERE key = ?");

        db.transaction(() => {
            for (const [key, value] of Object.entries(settings)) {
                stmt.run(value, key);
            }
        })();

        res.json({ message: 'Cập nhật cấu hình thành công' });
    } catch (err) {
        console.error('PUT /settings Error:', err);
        res.status(500).json({ error: 'Lỗi server: ' + err.message });
    }
});

module.exports = router;
