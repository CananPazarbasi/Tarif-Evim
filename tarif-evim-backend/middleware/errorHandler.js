// Merkezi hata yönetimi middleware'i
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Geliştirme ortamında detaylı log
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Hata:", err);
  }

  // Mongoose - Geçersiz ObjectId
  if (err.name === "CastError") {
    error.message = "Kayıt bulunamadı";
    return res.status(404).json({ success: false, message: error.message });
  }

  // Mongoose - Duplicate key (unique alan çakışması)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Bu ${field} zaten kullanımda`;
    return res.status(400).json({ success: false, message: error.message });
  }

  // Mongoose - Validasyon hatası
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ success: false, message: messages.join(", ") });
  }

  // JWT hataları
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Geçersiz token" });
  }
  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ success: false, message: "Token süresi dolmuş" });
  }

  // Genel hata
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Sunucu hatası",
  });
};

module.exports = errorHandler;
