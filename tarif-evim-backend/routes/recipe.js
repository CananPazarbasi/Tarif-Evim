const express = require("express");
const router = express.Router();

const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getPopularRecipes,
  getCategories,
  findByIngredients,
  rateRecipe,
  approveRecipe,
  chatAboutRecipe,
} = require("../controllers/recipeController");

const { protect, authorize } = require("../middleware/auth");

// Public
router.get("/", getRecipes);
router.get("/popular", getPopularRecipes);
router.get("/categories", getCategories);
router.get("/:id", getRecipe);

// Private
router.post("/", protect, createRecipe);
router.post("/find-by-ingredients", protect, findByIngredients);
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);
router.post("/:id/rate", protect, rateRecipe);
router.post("/:id/chat", protect, chatAboutRecipe);
router.post("/:id/approve", protect, authorize("dietitian"), approveRecipe);

module.exports = router;
