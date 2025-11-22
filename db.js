const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const isRender = process.env.RENDER === "true";

// Use correct database paths
const dbPath = isRender
  ? "/data/inventory.db"        // Render uses /data automatically
  : path.join(__dirname, "inventory.db");

// Just ensure the file exists, do NOT create the directory
if (isRender && !fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, ""); 
}

// Create DB connection
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    unit TEXT,
    category TEXT,
    brand TEXT,
    stock INTEGER NOT NULL,
    status TEXT,
    image TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS inventory_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    old_quantity INTEGER,
    new_quantity INTEGER,
    change_date TEXT,
    user_info TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

module.exports = db;
