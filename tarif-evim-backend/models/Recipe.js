const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Başlık zorunludur"],
      trim: true,
      maxlength: [100, "Başlık çok uzun"],
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },

    ingredients: [
      {
        name: String,
        amount: String,
      },
    ],

    steps: [
      {
        type: String,
        required: true,
      },
    ],

    category: {
      type: String,
      enum: ["diet", "vegan", "gluten-free", "keto", "general"],
      default: "general",
    },

    calories: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Recipe", RecipeSchema);
