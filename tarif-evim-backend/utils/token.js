const jwt = require("jsonwebtoken");

// Access token üret
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Refresh token üret
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

// Cookie'ye token set et
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Şifreyi response'dan çıkar
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendTokenResponse,
};
