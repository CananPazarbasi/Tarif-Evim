const express = require("express");
const router = express.Router();

const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

const { protect } = require("../middleware/auth");

// Public
router.get("/", getRecipes);
router.get("/:id", getRecipe);

// Private
router.post("/", protect, createRecipe);
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);

module.exports = router;
