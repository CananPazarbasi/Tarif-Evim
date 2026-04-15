const mongoose = require("mongoose");

const getNextRecipeNo = async () => {
  const counters = mongoose.connection.collection("counters");
  const counter = await counters.findOne({ name: "recipeNo" });

  if (!counter) {
    await counters.insertOne({ name: "recipeNo", seq: 1 });
    return 1;
  }

  await counters.updateOne({ name: "recipeNo" }, { $inc: { seq: 1 } });
  const updatedCounter = await counters.findOne({ name: "recipeNo" });

  if (!updatedCounter || typeof updatedCounter.seq !== "number") {
    throw new Error("recipeNo üretilemedi");
  }

  return updatedCounter.seq;
};

const RecipeSchema = new mongoose.Schema(
  {
    recipeNo: {
      type: Number,
      unique: true,
      index: true,
    },

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
        "Tavuk kategorisi",
        "Et kategorisi",
        "Sebze kategorisi",
        "Baklagiller",
        "Deniz mahsülleri",
        "Corba",
        "Hamur işleri",
        "Makarna",
        "Glutensiz kategori",
        "Vegan kategorisi",
        "Atıştırmalık ve Tatlı",
        "Diyetisyen onaylı tarifler",
      ],
      default: "Sebze kategorisi",
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
    id: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

RecipeSchema.pre("validate", async function (next) {
  if (!this.isNew || this.recipeNo) {
    return next();
  }

  try {
    this.recipeNo = await getNextRecipeNo();
    next();
  } catch (error) {
    next(error);
  }
});

RecipeSchema.index({
  title: "text",
  description: "text",
  "ingredients.name": "text",
});

module.exports = mongoose.model("Recipe", RecipeSchema);
