import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import StarRating from "./StarRating";
import { useRatings } from "../context/RatingsContext";

export default function RecipeCard({ recipe }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { getRatingStats } = useRatings();
  const { average, count } = getRatingStats(recipe.id, null, {
    average: Number(recipe.ratingAverage || 0),
    count: Number(recipe.ratingCount || 0),
  });
  const fav = isFavorite(recipe.id);
  const [warning, setWarning] = useState("");
  const categories = Array.isArray(recipe.categories) && recipe.categories.length > 0
    ? recipe.categories
    : [recipe.category].filter(Boolean);
  const categoryLabel = categories.slice(0, 2).join(" • ");

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    const result = await toggleFavorite(recipe);
    if (!result?.ok) {
      setWarning(result.message || "Lutfen giris yapin.");
      window.setTimeout(() => setWarning(""), 2200);
    }
  };

  return (
    <div style={{
      background: "white",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      transition: "transform .25s, box-shadow .25s",
      position: "relative",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(255,107,53,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img
          src={recipe.image}
          alt={recipe.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        />
        {/* Category badge */}
        <span style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          color: "white",
          borderRadius: 20,
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.5,
        }}>{categoryLabel || "Kategori"}</span>

        {/* Fav button */}
        <button
          onClick={handleFavoriteClick}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 36, height: 36,
            borderRadius: "50%",
            background: fav ? "#ff6b35" : "rgba(255,255,255,0.85)",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all .2s",
          }}
        >
          {fav ? "♥" : "♡"}
        </button>

        {warning && (
          <div style={{
            position: "absolute",
            top: 52,
            right: 8,
            background: "rgba(17,24,39,0.95)",
            color: "white",
            borderRadius: 10,
            padding: "6px 10px",
            fontSize: 11,
            fontWeight: 700,
            maxWidth: 220,
            zIndex: 20,
          }}>
            {warning}
          </div>
        )}

        {/* Dietitian badge */}
        {recipe.dietitianApproved && (
          <div style={{
            position: "absolute", bottom: 12, left: 12,
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            borderRadius: 20,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            <span style={{ fontSize: 12 }}>✓</span>
            <span style={{ color: "white", fontSize: 10, fontWeight: 800, letterSpacing: 0.5 }}>DİYETİSYEN ONAYLI</span>
          </div>
        )}

        <StarRating
          recipeId={recipe.id}
          compact
          className="absolute bottom-3 right-3"
          initialAverage={Number(recipe.ratingAverage || 0)}
          initialCount={Number(recipe.ratingCount || 0)}
        />
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px 20px" }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 17,
          fontWeight: 700,
          color: "#1a1a1a",
          margin: "0 0 12px",
          lineHeight: 1.3,
        }}>{recipe.title}</h3>

        <div style={{ marginBottom: 10, fontSize: 13, color: "#374151", fontWeight: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ReadOnlyStars average={average} />
            <span>{average.toFixed(1)}/5 ({count} oy)</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Stat icon="🔥" value={`${recipe.calories}`} unit="kcal" />
            <Stat icon="🍽️" value={`${recipe.servings}`} unit="kişilik" />
          </div>
          <Link to={`/recipe/${recipe.id}`} style={{
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            color: "white",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
          }}>Görüntüle →</Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value, unit }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 12 }}>{icon} <strong style={{ color: "#ff6b35" }}>{value}</strong></div>
      <div style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>{unit}</div>
    </div>
  );
}

function ReadOnlyStars({ average }) {
  return (
    <div aria-hidden="true" style={{ display: "flex", gap: 2, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: average >= star - 0.5 ? "#f59e0b" : "#d1d5db",
            fontSize: 16,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
