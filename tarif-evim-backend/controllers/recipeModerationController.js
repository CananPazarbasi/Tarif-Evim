const Recipe = require("../models/Recipe");
const { calculateRating, getRecipeQueryByRef } = require("./recipeShared");
const { generateRecipeAnswer } = require("../utils/recipeAi");

exports.rateRecipe = async (req, res, next) => {
  try {
    const { score } = req.body;

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "Puan 1 ile 5 arasında tam sayı olmalıdır",
      });
    }

    const recipeQuery = getRecipeQueryByRef(req.params.id);

    if (!recipeQuery) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz tarif referansı",
      });
    }

    const recipe = await Recipe.findOne(recipeQuery);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Tarif bulunamadı" });
    }

    const userRating = recipe.ratings.find(
      (rating) => rating.user.toString() === req.user.id,
    );

    if (userRating) {
      userRating.score = score;
    } else {
      recipe.ratings.push({ user: req.user.id, score });
    }

    const { ratingAverage, ratingCount } = calculateRating(recipe.ratings);
    recipe.ratingAverage = ratingAverage;
    recipe.ratingCount = ratingCount;

    await recipe.save();

    res.status(200).json({
      success: true,
      data: {
        recipeNo: recipe.recipeNo,
        ratingAverage: recipe.ratingAverage,
        ratingCount: recipe.ratingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.approveRecipe = async (req, res, next) => {
  try {
    const recipeQuery = getRecipeQueryByRef(req.params.id);

    if (!recipeQuery) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz tarif referansı",
      });
    }

    const recipe = await Recipe.findOne(recipeQuery);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Tarif bulunamadı" });
    }

    recipe.isApproved = true;
    recipe.approvedBy = req.user.id;
    recipe.approvedAt = new Date();
    await recipe.save();

    res.status(200).json({
      success: true,
      message: "Tarif onaylandı",
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

exports.chatAboutRecipe = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "Mesaj alanı zorunludur",
      });
    }

    const recipeQuery = getRecipeQueryByRef(req.params.id);

    if (!recipeQuery) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz tarif referansı",
      });
    }

    const recipe = await Recipe.findOne(recipeQuery);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Tarif bulunamadı" });
    }

    const lowerMessage = String(message).toLowerCase();

    let answer = await generateRecipeAnswer({ recipe, message });

    if (!answer) {
      answer = "Bu tarifle ilgili başka bir şey sorabilirsin.";

      if (lowerMessage.includes("malzeme")) {
        answer = `Malzemeler: ${recipe.ingredients
          .map((item) => `${item.name}${item.amount ? ` (${item.amount})` : ""}`)
          .join(", ")}`;
      } else if (
        lowerMessage.includes("nasıl") ||
        lowerMessage.includes("adım")
      ) {
        answer = `Yapılışı: ${recipe.steps.map((step, index) => `${index + 1}. ${step}`).join(" ")}`;
      } else if (
        lowerMessage.includes("kaç kişilik") ||
        lowerMessage.includes("kişi")
      ) {
        answer = `Bu tarif yaklaşık ${recipe.servings} kişiliktir.`;
      } else if (lowerMessage.includes("kalori")) {
        answer = `Bu tarifin tahmini kalorisi ${recipe.calories} kcal.`;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        recipeNo: recipe.recipeNo,
        question: message,
        answer,
      },
    });
  } catch (error) {
    next(error);
  }
};
