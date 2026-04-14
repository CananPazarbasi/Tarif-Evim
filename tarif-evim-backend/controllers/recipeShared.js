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

module.exports = {
  recipeBasePopulate,
  calculateRating,
};
