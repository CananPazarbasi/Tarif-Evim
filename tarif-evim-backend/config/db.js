const mongoose = require("mongoose");

const connectWithUri = async (uri) => {
  const conn = await mongoose.connect(uri);
  console.log(`✅ MongoDB Bağlandı: ${conn.connection.host}`);
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI tanımlı değil. .env dosyanızı kontrol edin.");
    process.exit(1);
  }

  try {
    await connectWithUri(process.env.MONGO_URI);
  } catch (error) {
    const isSrvDnsError =
      error.message.includes("querySrv") || error.message.includes("ENOTFOUND");

    if (isSrvDnsError && process.env.MONGO_URI_STANDARD) {
      try {
        console.warn(
          "⚠️ SRV DNS sorgusu başarısız oldu, MONGO_URI_STANDARD ile tekrar deneniyor...",
        );
        await connectWithUri(process.env.MONGO_URI_STANDARD);
        return;
      } catch (fallbackError) {
        console.error(
          `❌ MongoDB Bağlantı Hatası (fallback): ${fallbackError.message}`,
        );
        process.exit(1);
      }
    }

    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);
    if (isSrvDnsError) {
      console.error(
        "İpucu: DNS sağlayıcınız SRV kayıtlarını engelliyor olabilir. Atlas'tan standart bağlantı URI'si alıp MONGO_URI_STANDARD olarak tanımlayabilirsiniz.",
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;
