const mongoose = require("mongoose");

const connectWithUri = async (uri) => {
  const conn = await mongoose.connect(uri);
  console.log(`✅ MongoDB Bağlandı: ${conn.connection.host}`);
};

const connectDB = async () => {
  const candidateUris = [
    process.env.MONGO_URI_STANDARD,
    process.env.MONGO_URI,
  ]
    .map((uri) => String(uri || "").trim())
    .filter(Boolean);

  if (candidateUris.length === 0) {
    console.error("❌ MongoDB bağlantı URI'si tanımlı değil. .env dosyanızı kontrol edin.");
    process.exit(1);
  }

  let lastError = null;

  for (const uri of [...new Set(candidateUris)]) {
    try {
      await connectWithUri(uri);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    const isSrvDnsError =
      lastError.message.includes("querySrv") || lastError.message.includes("ENOTFOUND");

    if (isSrvDnsError && candidateUris.length > 1) {
      try {
        console.warn(
          "⚠️ MongoDB bağlantısı ilk URI ile kurulamadı, alternatif URI ile tekrar deneniyor...",
        );
        await connectWithUri(candidateUris[1]);
        return;
      } catch (fallbackError) {
        console.error(
          `❌ MongoDB Bağlantı Hatası (fallback): ${fallbackError.message}`,
        );
        process.exit(1);
      }
    }

    console.error(`❌ MongoDB Bağlantı Hatası: ${lastError.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
