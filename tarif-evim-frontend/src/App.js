import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecipeDetail from "./pages/RecipeDetail";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import CategoryRecipes from "./pages/CategoryRecipes";
import ShoppingList from "./pages/ShoppingList";
import Favorites from "./pages/Favorites";
import IngredientSearch from "./pages/IngredientSearch";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { RatingsProvider } from "./context/RatingsContext";

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <RatingsProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="recipe/:id" element={<RecipeDetail />} />
                <Route path="recipe/:id/edit" element={<EditRecipe />} />
                <Route path="category/:categoryValue" element={<CategoryRecipes />} />
                <Route path="add-recipe" element={<AddRecipe />} />
                <Route path="ingredient-search" element={<IngredientSearch />} />
                <Route path="shopping-list" element={<ShoppingList />} />
                <Route path="favorites" element={<Favorites />} />
              </Route>
            </Routes>
          </Router>
        </RatingsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
