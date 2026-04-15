const { validationResult } = require("express-validator");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const { sendTokenResponse, generateAccessToken } = require("../utils/token");
const jwt = require("jsonwebtoken");

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password, role } = req.body;

    // 'admin' rolünü dışarıdan atamayı engelle
    const allowedRoles = ["user", "dietitian"];
    const userRole = allowedRoles.includes(role) ? role : "user";

    const user = await User.create({ name, email, password, role: userRole });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email ve şifre zorunludur",
      });
    }

    // Şifre dahil kullanıcıyı getir (select: false olduğu için özel çekiyoruz)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email veya şifre hatalı" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Email veya şifre hatalı" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Giriş yapmış kullanıcı bilgisi
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "favoriteRecipes",
      "title image",
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token ile yeni access token al
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token gerekli" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    const accessToken = generateAccessToken(user._id);
    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Geçersiz refresh token" });
  }
};

// @desc    Şifre güncelle
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Mevcut şifre ve yeni şifre zorunludur",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mevcut şifre hatalı" });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Hesabı kalıcı olarak sil
// @route   DELETE /api/auth/me
// @access  Private
exports.deleteMe = async (req, res, next) => {
  try {
    await Recipe.deleteMany({ createdBy: req.user.id });

    const deletedUser = await User.findByIdAndDelete(req.user.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hesap başarıyla silindi",
    });
  } catch (error) {
    next(error);
  }
};
