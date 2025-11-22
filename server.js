require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const productRoutes = require("./routes/products");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Inventory Management Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
