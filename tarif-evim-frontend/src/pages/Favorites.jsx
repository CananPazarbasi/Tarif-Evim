import React from "react";
import { Link } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

export default function Favorites() {
  const { favorites } = useFavorites();
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#1a1a1a", marginBottom: 8 }}>
          Favoriler Yalnizca Uyeler Icin
        </h2>
        <p style={{ color: "#888", marginBottom: 24 }}>
          Favori tariflerini gormek ve kaydetmek icin lutfen giris yap.
        </p>
        <Link to="/login" style={{
          background: "linear-gradient(135deg, #ff6b35, #f7931e)",
          color: "white",
          textDecoration: "none",
          borderRadius: 50,
          padding: "12px 28px",
          fontWeight: 800,
        }}>
          Giris Yap
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#1a1a1a", marginBottom: 8 }}>
        ♥ Favori Tariflerim
      </h1>
      <p style={{ color: "#999", marginBottom: 36, fontSize: 14 }}>Kaydettiğin tarifler burada</p>

      {favorites.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🤍</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#1a1a1a" }}>Henüz favori yok</h2>
          <p style={{ color: "#aaa", marginBottom: 24 }}>Tarifleri kalp ikonuna tıklayarak favorile</p>
          <Link to="/" style={{
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            color: "white",
            textDecoration: "none",
            borderRadius: 50,
            padding: "12px 28px",
            fontWeight: 800,
          }}>Tarifleri Keşfet</Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 24,
        }}>
          {favorites.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}
