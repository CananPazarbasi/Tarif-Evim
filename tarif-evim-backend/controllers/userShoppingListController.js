const User = require("../models/User");
const Recipe = require("../models/Recipe");

exports.getShoppingList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("shoppingList");

    res.status(200).json({
      success: true,
      count: user.shoppingList.length,
      data: user.shoppingList,
    });
  } catch (error) {
    next(error);
  }
};

exports.addShoppingItem = async (req, res, next) => {
  try {
    const { name, quantity } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Ürün adı zorunludur",
      });
    }

    const user = await User.findById(req.user.id);

    user.shoppingList.push({
      name: String(name).trim(),
      quantity: quantity ? String(quantity).trim() : "",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Alışveriş listesine eklendi",
      data: user.shoppingList,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateShoppingItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { name, quantity, checked } = req.body;

    const user = await User.findById(req.user.id);
    const item = user.shoppingList.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Alışveriş öğesi bulunamadı",
      });
    }

    if (typeof name !== "undefined") {
      item.name = String(name).trim();
    }
    if (!item.name) {
      return res.status(400).json({
        success: false,
        message: "Ürün adı boş bırakılamaz",
      });
    }

    if (typeof quantity !== "undefined") {
      item.quantity = String(quantity).trim();
    }

    if (typeof checked !== "undefined") {
      item.checked = Boolean(checked);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Alışveriş öğesi güncellendi",
      data: user.shoppingList,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeShoppingItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const user = await User.findById(req.user.id);
    const item = user.shoppingList.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Alışveriş öğesi bulunamadı",
      });
    }

    item.deleteOne();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Alışveriş öğesi silindi",
      data: user.shoppingList,
    });
  } catch (error) {
    next(error);
  }
};

exports.buildShoppingListFromRecipes = async (req, res, next) => {
  try {
    const { recipeIds = [] } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "recipeIds dizisi zorunludur",
      });
    }

    const recipes = await Recipe.find({ _id: { $in: recipeIds } }).select(
      "ingredients",
    );

    const user = await User.findById(req.user.id);

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const name = String(ingredient.name || "").trim();
        if (!name) {
          return;
        }

        user.shoppingList.push({
          name,
          quantity: String(ingredient.amount || "").trim(),
          checked: false,
        });
      });
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Alışveriş listesi tariflerden oluşturuldu",
      data: user.shoppingList,
    });
  } catch (error) {
    next(error);
  }
};

exports.clearShoppingList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.shoppingList = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Alışveriş listesi temizlendi",
    });
  } catch (error) {
    next(error);
  }
};
