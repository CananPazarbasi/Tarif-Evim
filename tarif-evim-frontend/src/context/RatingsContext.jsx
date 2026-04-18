import React, { createContext, useContext, useMemo, useState } from "react";
import { rateRecipe } from "../services/recipeService";

const RatingsContext = createContext(null);
const RATINGS_KEY = "tarif-evim-ratings";

const readStoredRatings = () => {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const persistRatings = (ratings) => {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
};

export const getRaterKey = (user) => {
  if (!user?.email) return null;
  return `user:${user.email.toLowerCase()}`;
};

const applyLocalRating = (prev, recipeId, raterKey, ratingValue) => {
  const id = String(recipeId);
  const current = prev[id] || { byUser: {} };
  const byUser = { ...current.byUser, [raterKey]: ratingValue };
  const values = Object.values(byUser);
  const total = values.reduce((sum, v) => sum + Number(v || 0), 0);
  const count = values.length;
  return {
    ...prev,
    [id]: { byUser, total, count },
  };
};

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState(readStoredRatings);
  const [syncError, setSyncError] = useState("");

  const setRating = async (recipeId, stars, user) => {
    const raterKey = getRaterKey(user);
    if (!raterKey) {
      return { ok: false, reason: "AUTH_REQUIRED", message: "Lütfen puan vermek için giriş yapın." };
    }

    const ratingValue = Math.max(1, Math.min(5, Number(stars) || 0));
    if (!ratingValue) {
      return { ok: false, reason: "INVALID_RATING" };
    }

    let prevSnapshot = null;
    let nextSnapshot = null;
    setRatings((prev) => {
      prevSnapshot = prev;
      const next = applyLocalRating(prev, recipeId, raterKey, ratingValue);
      nextSnapshot = next;
      persistRatings(next);
      return next;
    });

    try {
      const result = await rateRecipe(recipeId, ratingValue);

      const apiAverage = result?.ratingAverage;
      const apiCount = result?.ratingCount;
      if (typeof apiAverage === "number" && typeof apiCount === "number") {
        setRatings((prev) => {
          const id = String(recipeId);
          const current = prev[id] || { byUser: {} };
          const normalized = {
            ...prev,
            [id]: {
              byUser: current.byUser || {},
              total: apiAverage * apiCount,
              count: apiCount,
            },
          };
          persistRatings(normalized);
          return normalized;
        });
      }
      setSyncError("");
      return { ok: true, source: "api" };
    } catch {
      const rollback = prevSnapshot || {};
      setRatings(rollback);
      persistRatings(rollback);
      setSyncError("Puan kaydı sunucuya gönderilemedi.");
      return { ok: false, source: "api", message: "Puan kaydedilemedi. Lütfen tekrar deneyin." };
    }
  };

  const getRatingStats = (recipeId, raterKey, fallback = null) => {
    const record = ratings[String(recipeId)] || { byUser: {}, total: 0, count: 0 };
    const localCount = Number(record.count || 0);
    const localTotal = Number(record.total || 0);
    const localAverage = localCount > 0 ? localTotal / localCount : 0;

    const fallbackCount = Number(fallback?.count || 0);
    const fallbackAverage = Number(fallback?.average || 0);

    const count = localCount > 0 ? localCount : fallbackCount;
    const average = localCount > 0 ? localAverage : fallbackAverage;
    const myRating = raterKey ? record.byUser?.[raterKey] || 0 : 0;
    return { average, count, myRating };
  };

  const value = useMemo(() => ({ setRating, getRatingStats, syncError }), [ratings, syncError]);

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export const useRatings = () => useContext(RatingsContext);
