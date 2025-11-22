const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Correct persistent directory for Render
const renderDataDir = "/opt/render/project/data";

const isRender = process.env.RENDER === "true";

// Database path
const dbPath = isRender
  ? path.join(renderDataDir, "inventory.db")
  : path.join(__dirname, "inventory.db");

// Ensure directory exists in Render
if (isRender && !fs.existsSync(renderDataDir)) {
  fs.mkdirSync(renderDataDir, { recursive: true });
}

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
