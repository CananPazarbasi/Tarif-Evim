import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { getRecipes } from "../services/recipeService";
import { CATEGORY_OPTIONS } from "../constants/categories";

export default function CategoryRecipes() {
  const { categoryValue } = useParams();
  const decodedCategory = decodeURIComponent(categoryValue || "");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryRecipes = async () => {
      setLoading(true);
      try {
        const categoryRecipes = await getRecipes({ category: decodedCategory, limit: 200 });
        setRecipes(categoryRecipes);
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryRecipes();
  }, [decodedCategory]);

  const categoryLabel = useMemo(() => {
    const found = CATEGORY_OPTIONS.find((item) => item.value === decodedCategory);
    return found?.label || decodedCategory;
  }, [decodedCategory]);

  return (
    <div>
      <Link to="/" style={{ color: "#ff6b35", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 14 }}>
        ← Ana Sayfa
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 34, margin: 0, color: "#1a1a1a" }}>
          {categoryLabel}
        </h1>
        <p style={{ margin: "10px 0 0", color: "#6b7280", fontSize: 14 }}>
          {recipes.length} tarif bulundu
        </p>
      </div>

      {loading && (
        <p style={{ color: "#888", marginBottom: 18, fontWeight: 700 }}>Tarifler yukleniyor...</p>
      )}

      {!loading && recipes.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#ccc" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🍽️</div>
          <p style={{ fontSize: 18, fontWeight: 700 }}>Bu kategoride tarif bulunamadi</p>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
      }}>
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
