import React, { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getRaterKey, useRatings } from "../context/RatingsContext";

export default function StarRating({ recipeId, compact = false, className = "", initialAverage = 0, initialCount = 0 }) {
  const { user } = useAuth();
  const { setRating, getRatingStats, syncError } = useRatings();
  const [hovered, setHovered] = useState(0);
  const [toast, setToast] = useState("");

  const raterKey = getRaterKey(user);
  const { average, count, myRating } = getRatingStats(recipeId, raterKey, {
    average: initialAverage,
    count: initialCount,
  });

  const activeStars = hovered || myRating;
  const summary = useMemo(() => `${average.toFixed(1)}/5`, [average]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const handleRate = async (star) => {
    if (!user) {
      showToast("Lutfen puan vermek icin giris yapin");
      return;
    }
    const result = await setRating(recipeId, star, user);
    if (!result?.ok) {
      showToast(result?.message || "Puan kaydedilemedi.");
      return;
    }
    if (syncError) {
      showToast(syncError);
    }
  };

  if (compact) {
    return (
      <div className={`relative inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ${className}`}>
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span>{summary}</span>
        <span className="text-amber-500">({count})</span>
        {toast && (
          <div className="absolute -bottom-10 left-1/2 w-max -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl border border-amber-200 bg-amber-50 p-3 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-700">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold">{summary}</span>
          <span className="text-xs text-amber-600">({count} oy)</span>
        </div>
        <span className="text-xs font-medium text-amber-700">Tarifi puanla</span>
      </div>

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Tarif puanlama">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={myRating === star}
            aria-label={`${star} yildiz`}
            className="rounded p-0.5 transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(star)}
            style={{ border: "none", background: "transparent", lineHeight: 1, cursor: "pointer" }}
          >
            <span
              style={{
                color: activeStars >= star ? "#f59e0b" : "#d1d5db",
                fontSize: 30,
                textShadow: activeStars >= star ? "0 0 6px rgba(245,158,11,0.45)" : "none",
                transition: "all .15s",
              }}
            >
              ★
            </span>
          </button>
        ))}
      </div>

      {toast && (
        <div className="mt-2 rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
