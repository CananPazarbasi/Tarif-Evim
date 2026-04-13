const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");


// .env yükle
dotenv.config();

// MongoDB bağlantısı
connectDB();

const app = express();

// --- Middleware'ler ---
app.use(express.json()); // JSON body parse
app.use(express.urlencoded({ extended: true })); // Form data parse
app.use(cors()); // CORS
app.use(helmet()); // Güvenlik header'ları
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // HTTP loglama (sadece dev)
}

// --- Routes ---
app.use("/api/auth", require("./routes/auth"));

// İlerleyen fazlarda eklenecekler:
// app.use('/api/recipes', require('./routes/recipes'));
// app.use('/api/meal-plans', require('./routes/mealPlans'));
// app.use('/api/users', require('./routes/users'));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Tarif Evim API çalışıyor 🍴",
    env: process.env.NODE_ENV,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Endpoint bulunamadı" });
});

// Merkezi hata handler (en sonda olmalı)
app.use(errorHandler);

// --- Sunucuyu başlat ---
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "dev";
app.listen(PORT, () => {
  console.log(
    `🚀 Sunucu ${NODE_ENV} modunda ${PORT} portunda çalışıyor`,
  );
});
