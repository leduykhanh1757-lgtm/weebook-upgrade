const db = require('better-sqlite3')('bookself.db');
db.prepare("UPDATE users SET role='admin' WHERE email='kim@gmail.com'").run();
console.log("Promoted kim@gmail.com to admin");
