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
      enum: [
        "diet",
        "vegan",
        "gluten-free",
        "keto",
        "general",
        "breakfast",
        "lunch",
        "dinner",
        "dessert",
      ],
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

    servings: {
      type: Number,
      min: 1,
      default: 1,
    },

    preparationTime: {
      type: Number,
      min: 0,
      default: 0,
    },

    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    ratingCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        score: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],

    isApproved: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
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

RecipeSchema.index({
  title: "text",
  description: "text",
  "ingredients.name": "text",
});

module.exports = mongoose.model("Recipe", RecipeSchema);
