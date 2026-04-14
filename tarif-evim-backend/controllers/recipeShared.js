const mongoose = require("mongoose");

const recipeBasePopulate = { path: "createdBy", select: "name email role" };

const calculateRating = (ratings) => {
  if (!ratings || ratings.length === 0) {
    return { ratingAverage: 0, ratingCount: 0 };
  }

  const total = ratings.reduce((sum, item) => sum + item.score, 0);
  const average = total / ratings.length;
  return {
    ratingAverage: Number(average.toFixed(2)),
    ratingCount: ratings.length,
  };
};

const getRecipeQueryByRef = (recipeRef) => {
  const ref = String(recipeRef || "").trim();

  if (/^\d+$/.test(ref)) {
    return { recipeNo: Number(ref) };
  }

  if (mongoose.Types.ObjectId.isValid(ref)) {
    return { _id: ref };
  }

  return null;
};

module.exports = {
  recipeBasePopulate,
  calculateRating,
  getRecipeQueryByRef,
};
