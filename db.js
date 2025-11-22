const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const isRender = process.env.RENDER === "true";


const dbDir = isRender ? "/data" : __dirname;
const dbPath = isRender ? "/data/inventory.db" : path.join(__dirname, "inventory.db");


if (isRender && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}


const db = new Database(dbPath);

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
