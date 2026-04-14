const Recipe = require("../models/Recipe");
const { getRecipeQueryByRef } = require("./recipeShared");

exports.createRecipe = async (req, res, next) => {
  try {
    const canAutoApprove = req.user.role === "dietitian";

    const recipe = await Recipe.create({
      ...req.body,
      createdBy: req.user.id,
      isApproved: canAutoApprove,
      approvedBy: canAutoApprove ? req.user.id : null,
      approvedAt: canAutoApprove ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRecipe = async (req, res, next) => {
  try {
    const recipeQuery = getRecipeQueryByRef(req.params.id);

    if (!recipeQuery) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz tarif referansı",
      });
    }

    let recipe = await Recipe.findOne(recipeQuery);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Tarif bulunamadı",
      });
    }

    const isOwner = recipe.createdBy.toString() === req.user.id;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Yetkiniz yok",
      });
    }

    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, "isApproved")) {
      delete updateData.isApproved;
      delete updateData.approvedAt;
      delete updateData.approvedBy;
    }

    recipe = await Recipe.findOneAndUpdate(recipeQuery, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRecipe = async (req, res, next) => {
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
      return res.status(404).json({
        success: false,
        message: "Tarif bulunamadı",
      });
    }

    const isOwner = recipe.createdBy.toString() === req.user.id;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Yetkiniz yok",
      });
    }

    await recipe.deleteOne();

    res.status(200).json({
      success: true,
      message: "Tarif silindi",
    });
  } catch (error) {
    next(error);
  }
};
