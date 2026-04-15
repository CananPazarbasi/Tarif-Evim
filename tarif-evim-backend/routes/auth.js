const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  refreshToken,
  updatePassword,
  deleteMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Validasyon kuralları
const registerValidation = [
  body("name").trim().notEmpty().withMessage("İsim zorunludur"),
  body("email").isEmail().withMessage("Geçerli bir email giriniz"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Şifre en az 6 karakter olmalıdır"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Geçerli bir email giriniz"),
  body("password").notEmpty().withMessage("Şifre zorunludur"),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);
router.delete("/me", protect, deleteMe);
router.post("/refresh-token", refreshToken);
router.put("/update-password", protect, updatePassword);

module.exports = router;
