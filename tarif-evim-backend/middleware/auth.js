const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Token doğrulama - giriş yapmış mı?
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Bu işlem için giriş yapmanız gerekiyor",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Geçersiz veya süresi dolmuş token",
    });
  }
};

// Rol bazlı yetkilendirme
// Kullanım: authorize('dietitian')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bu işlem için '${roles.join(", ")}' rolü gerekiyor`,
      });
    }
    next();
  };
};
