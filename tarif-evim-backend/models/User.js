const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "İsim zorunludur"],
      trim: true,
      maxlength: [50, "İsim 50 karakterden uzun olamaz"],
    },
    email: {
      type: String,
      required: [true, "Email zorunludur"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Geçerli bir email giriniz"],
    },
    password: {
      type: String,
      required: [true, "Şifre zorunludur"],
      minlength: [6, "Şifre en az 6 karakter olmalıdır"],
      select: false, // Sorgularda varsayılan olarak gelmesin
    },
    role: {
      type: String,
      enum: ["user", "dietitian"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [200, "Bio 200 karakterden uzun olamaz"],
      default: "",
    },
    favoriteRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    shoppingList: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: String,
          default: "",
        },
        checked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Diyetisyen rolü için ek bilgi
    dietitianInfo: {
      isApproved: { type: Boolean, default: false },
      certificate: { type: String, default: null },
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
  },
);

// Kayıt öncesi şifreyi hashle
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Şifre karşılaştırma metodu
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
