// utils/db.js
// SQLite database connection. Import this wherever db access is needed.

const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('resume.db', (err) => {
    if (err) {
        console.error("Db connection error:", err.message)
    } else {
        console.log("Connected to SQLite database")
    }
})

// Keeping SQLite foreign key enforcement enabled for the app connection.
db.run("PRAGMA foreign_keys = ON")

module.exports = db