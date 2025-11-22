const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

// GET all products
router.get("/", (req, res) => {
  try {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE product
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { name, unit, category, brand, stock, status } = req.body;

  try {
    const oldProduct = db.prepare("SELECT * FROM products WHERE id = ?").get(id);

    if (!oldProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Insert history if stock changed
    if (oldProduct.stock !== stock) {
      db.prepare(
        `INSERT INTO inventory_history 
         (product_id, old_quantity, new_quantity, change_date) 
         VALUES (?, ?, ?, ?)`
      ).run(id, oldProduct.stock, stock, new Date().toISOString());
    }

    // Update
    db.prepare(
      `UPDATE products 
       SET name=?, unit=?, category=?, brand=?, stock=?, status=? 
       WHERE id=?`
    ).run(name, unit, category, brand, stock, status, id);

    res.json({ message: "Product updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IMPORT CSV
router.post("/import", upload.single("csvFile"), (req, res) => {
  const filePath = req.file.path;
  let added = 0;
  let skipped = 0;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      const exists = db.prepare("SELECT id FROM products WHERE name=?").get(row.name);

      if (!exists) {
        db.prepare(
          `INSERT INTO products (name, unit, category, brand, stock, status)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          row.name,
          row.unit,
          row.category,
          row.brand,
          Number(row.stock),
          Number(row.stock) > 0 ? "In Stock" : "Out of Stock"
        );
        added++;
      } else {
        skipped++;
      }
    })
    .on("end", () => {
      fs.unlinkSync(filePath);

      res.json({
        message: "Import finished",
        added,
        skipped
      });
    });
});

// EXPORT CSV
router.get("/export", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM products").all();

    let csvData = "id,name,unit,category,brand,stock,status\n";

    rows.forEach((p) => {
      csvData += `${p.id},${p.name},${p.unit},${p.category},${p.brand},${p.stock},${p.status}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="products.csv"'
    );

    res.send(csvData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRODUCT HISTORY
router.get("/:id/history", (req, res) => {
  try {
    const rows = db
      .prepare(
        "SELECT * FROM inventory_history WHERE product_id=? ORDER BY change_date DESC"
      )
      .all(req.params.id);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
