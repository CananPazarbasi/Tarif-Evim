import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);
const STORAGE_PREFIX = "tarif-evim-favorites";

const getStorageKey = (email) => `${STORAGE_PREFIX}:${email.toLowerCase()}`;

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user?.email) {
      setFavorites([]);
      return;
    }
    try {
      const raw = localStorage.getItem(getStorageKey(user.email));
      setFavorites(raw ? JSON.parse(raw) : []);
    } catch {
      setFavorites([]);
    }
  }, [user]);

  const persist = (nextFavorites) => {
    if (!user?.email) return;
    localStorage.setItem(getStorageKey(user.email), JSON.stringify(nextFavorites));
  };

  const toggleFavorite = (recipe) => {
    if (!user?.email) {
      return { ok: false, reason: "AUTH_REQUIRED", message: "Favorilere eklemek icin lutfen giris yapin." };
    }

    let next = [];
    setFavorites((prev) => {
      next = prev.find((r) => r.id === recipe.id)
        ? prev.filter((r) => r.id !== recipe.id)
        : [...prev, recipe];
      return next;
    });
    persist(next);
    return { ok: true };
  };

  const isFavorite = (id) => favorites.some((r) => r.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
