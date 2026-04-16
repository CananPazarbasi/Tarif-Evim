import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../services/apiClient";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.email) {
        setFavorites([]);
        return;
      }

      try {
        const response = await apiClient.get("/users/favorites", { auth: true });
        const normalized = (response?.data || []).map((recipe) => ({
          id: recipe.recipeNo,
          recipeNo: recipe.recipeNo,
          title: recipe.title,
          image: recipe.image,
          calories: recipe.calories,
          servings: recipe.servings,
          categories: Array.isArray(recipe.category)
            ? recipe.category
            : [recipe.category].filter(Boolean),
          category: Array.isArray(recipe.category)
            ? recipe.category[0] || "Sebze kategorisi"
            : recipe.category,
          dietitianApproved: Boolean(recipe.isApproved),
          ingredients: (recipe.ingredients || []).map((item) =>
            `${String(item.amount || "").trim()} ${String(item.name || "").trim()}`.trim(),
          ).filter(Boolean),
          steps: recipe.steps || [],
          ratingAverage: Number(recipe.ratingAverage || 0),
          ratingCount: Number(recipe.ratingCount || 0),
        }));
        setFavorites(normalized);
      } catch {
        setFavorites([]);
      }
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = async (recipe) => {
    if (!user?.email) {
      return { ok: false, reason: "AUTH_REQUIRED", message: "Favorilere eklemek icin lutfen giris yapin." };
    }

    const recipeRef = recipe.recipeNo || recipe.id;
    if (!recipeRef) {
      return { ok: false, message: "Tarif referansi bulunamadi" };
    }

    const exists = favorites.some((item) => item.id === recipeRef);

    try {
      if (exists) {
        await apiClient.delete(`/users/favorites/${recipeRef}`, { auth: true });
        setFavorites((prev) => prev.filter((item) => item.id !== recipeRef));
      } else {
        await apiClient.post(`/users/favorites/${recipeRef}`, {}, { auth: true });
        setFavorites((prev) => [
          ...prev,
          {
            ...recipe,
            id: recipeRef,
            recipeNo: recipeRef,
          },
        ]);
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || "Favori guncellenemedi" };
    }
  };

  const isFavorite = (id) => favorites.some((r) => r.id === id || r.recipeNo === id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
