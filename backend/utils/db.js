// utils/db.js
// SQLite database connection. Import this wherever db access is needed.

const sqlite3 = require('sqlite3').verbose()

// AI Assisted: Recommended t make this path here absolute, I figured no harm in trying
const path = require('path')
const db = new sqlite3.Database(path.join(__dirname, '../resume.db'), (err) => {
    if (err) {
        console.error("Db connection error:", err.message)
    } else {
        console.log("Connected to SQLite database")
    }
})

// Keeping SQLite foreign key enforcement enabled for the app connection.
db.run("PRAGMA foreign_keys = ON")

// Enable write ahead whatever it's called, keeps concurrent users able to write to database
db.run('PRAGMA journal_mode=WAL')

module.exports = db