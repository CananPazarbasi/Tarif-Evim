const User = require("../models/User");
const Recipe = require("../models/Recipe");

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

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Tarif bulunamadı" });
    }

    const user = await User.findById(req.user.id);
    const alreadyExists = user.favoriteRecipes.some(
      (id) => id.toString() === recipeId,
    );

    if (!alreadyExists) {
      user.favoriteRecipes.push(recipeId);
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
    const user = await User.findById(req.user.id);

    user.favoriteRecipes = user.favoriteRecipes.filter(
      (id) => id.toString() !== recipeId,
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
