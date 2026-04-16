const Recipe = require("../models/Recipe");
const { recipeBasePopulate, getRecipeQueryByRef } = require("./recipeShared");

exports.getRecipes = async (req, res, next) => {
  try {
    const {
      q,
      category,
      onlyApproved,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (onlyApproved === "true") {
      query.isApproved = true;
    } else if (onlyApproved === "false") {
      query.isApproved = false;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "ingredients.name": { $regex: q, $options: "i" } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { ratingAverage: -1, ratingCount: -1 },
    };

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const recipes = await Recipe.find(query)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate(recipeBasePopulate);

    const total = await Recipe.countDocuments(query);

    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      data: recipes,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPopularRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({})
      .sort({ ratingAverage: -1, ratingCount: -1, createdAt: -1 })
      .limit(10)
      .populate(recipeBasePopulate);

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Recipe.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

exports.findByIngredients = async (req, res, next) => {
  try {
    const { ingredients = [], onlyApproved = false } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Malzeme listesi gerekli",
      });
    }

    const normalized = ingredients
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);

    const query = {
      "ingredients.name": {
        $in: normalized.map((item) => new RegExp(item, "i")),
      },
    };

    if (onlyApproved) {
      query.isApproved = true;
    }

    const recipes = await Recipe.find(query).populate(recipeBasePopulate);

    const ranked = recipes
      .map((recipe) => {
        const recipeIngredients = recipe.ingredients.map((ingredient) =>
          String(ingredient.name || "")
            .trim()
            .toLowerCase(),
        );
        const matchCount = normalized.filter((item) =>
          recipeIngredients.some((ri) => ri.includes(item)),
        ).length;
        const matchRatio = Number((matchCount / normalized.length).toFixed(2));
        return { ...recipe.toObject(), matchCount, matchRatio };
      })
      .sort(
        (a, b) =>
          b.matchCount - a.matchCount || b.ratingAverage - a.ratingAverage,
      );

    res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecipe = async (req, res, next) => {
  try {
    const recipeQuery = getRecipeQueryByRef(req.params.id);

    if (!recipeQuery) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz tarif referansı",
      });
    }

    const recipe =
      await Recipe.findOne(recipeQuery).populate(recipeBasePopulate);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Tarif bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
};
