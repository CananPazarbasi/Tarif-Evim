import axios from "axios";
import React, { createContext, useContext, useMemo, useState } from "react";

const RatingsContext = createContext(null);
const RATINGS_KEY = "tarif-evim-ratings";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
      return { ok: false, reason: "AUTH_REQUIRED", message: "Lutfen puan vermek icin giris yapin." };
    }

    const ratingValue = Math.max(1, Math.min(5, Number(stars) || 0));
    if (!ratingValue) {
      return { ok: false, reason: "INVALID_RATING" };
    }

    let nextSnapshot = null;
    setRatings((prev) => {
      const next = applyLocalRating(prev, recipeId, raterKey, ratingValue);
      nextSnapshot = next;
      persistRatings(next);
      return next;
    });

    if (!API_BASE_URL) {
      return { ok: true, source: "local" };
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/ratings/upsert`, {
        recipeId,
        rating: ratingValue,
      });

      const apiAverage = response.data?.average;
      const apiCount = response.data?.count;
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
      setSyncError("Puan kaydi sunucuya gonderilemedi. Yerel olarak kaydedildi.");
      if (nextSnapshot) persistRatings(nextSnapshot);
      return { ok: true, source: "local-fallback" };
    }
  };

  const getRatingStats = (recipeId, raterKey) => {
    const record = ratings[String(recipeId)] || { byUser: {}, total: 0, count: 0 };
    const count = record.count || 0;
    const total = record.total || 0;
    const average = count > 0 ? total / count : 0;
    const myRating = raterKey ? record.byUser?.[raterKey] || 0 : 0;
    return { average, count, myRating };
  };

  const value = useMemo(() => ({ setRating, getRatingStats, syncError }), [ratings, syncError]);

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export const useRatings = () => useContext(RatingsContext);
