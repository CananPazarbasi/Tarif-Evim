const User = require("../models/User");
const Recipe = require("../models/Recipe");
const { getRecipeQueryByRef } = require("./recipeShared");

exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "favoriteRecipes",
      populate: { path: "createdBy", select: "name email role" },
    });

    res.status(200).json({
      success: true,
      count: user.favoriteRecipes.length,
      data: user.favoriteRecipes,
    });
  } catch (error) {
    next(error);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const recipeQuery = getRecipeQueryByRef(recipeId);

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

    const user = await User.findById(req.user.id);
    const alreadyExists = user.favoriteRecipes.some(
      (id) => id.toString() === recipe._id.toString(),
    );

    if (!alreadyExists) {
      user.favoriteRecipes.push(recipe._id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: alreadyExists ? "Tarif zaten favorilerde" : "Favorilere eklendi",
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const recipeQuery = getRecipeQueryByRef(recipeId);

    if (!recipeQuery) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz tarif referansı",
      });
    }

    const recipe = await Recipe.findOne(recipeQuery).select("_id");

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Tarif bulunamadı" });
    }

    const user = await User.findById(req.user.id);

    user.favoriteRecipes = user.favoriteRecipes.filter(
      (id) => id.toString() !== recipe._id.toString(),
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Favorilerden kaldırıldı",
    });
  } catch (error) {
    next(error);
  }
};
