const Recipe = require("../models/Recipe");

exports.createRecipe = async (req, res, next) => {
  try {
    const canAutoApprove = ["dietitian", "admin"].includes(req.user.role);

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
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Tarif bulunamadı",
      });
    }

    const isOwner = recipe.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
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

    recipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, {
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
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Tarif bulunamadı",
      });
    }

    const isOwner = recipe.createdBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
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
