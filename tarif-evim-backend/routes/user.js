const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  getShoppingList,
  addShoppingItem,
  updateShoppingItem,
  removeShoppingItem,
  buildShoppingListFromRecipes,
  clearShoppingList,
} = require("../controllers/userController");

router.use(protect);

router.get("/favorites", getFavorites);
router.post("/favorites/:recipeId", addFavorite);
router.delete("/favorites/:recipeId", removeFavorite);

router.get("/shopping-list", getShoppingList);
router.post("/shopping-list", addShoppingItem);
router.post("/shopping-list/from-recipes", buildShoppingListFromRecipes);
router.put("/shopping-list/:itemId", updateShoppingItem);
router.delete("/shopping-list/:itemId", removeShoppingItem);
router.delete("/shopping-list", clearShoppingList);

module.exports = router;
