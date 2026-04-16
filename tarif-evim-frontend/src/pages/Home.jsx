import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { getPopularRecipes, getRecipes } from "../services/recipeService";
import { CATEGORY_OPTIONS } from "../constants/categories";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [suggestedRecipe, setSuggestedRecipe] = useState(null);
  const activeCategory = searchParams.get("category") || "Tümü";

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      try {
        const [allRecipes, popular] = await Promise.all([
          getRecipes({ limit: 100 }),
          getPopularRecipes(),
        ]);
        setRecipes(allRecipes);
        setPopularRecipes(popular.length > 0 ? popular : allRecipes.slice(0, 3));
        setSelectedRecipeId(allRecipes[0]?.id || "");
        setSuggestedRecipe(allRecipes[0] || null);
      } catch {
        setRecipes([]);
        setPopularRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const handleCategoryChange = (category) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category === "Tümü") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }
    setSearchParams(nextParams);
  };

  const filtered = useMemo(() => recipes.filter((r) => {
    const categoryMatch =
      activeCategory === "Tümü"
      || (activeCategory === "Diyetisyen onaylı tarifler"
        ? r.dietitianApproved
        : r.category === activeCategory);

    const ingredientMatch = !ingredientQuery || r.ingredients.some((i) =>
      i.toLowerCase().includes(ingredientQuery.toLowerCase())
    );

    return categoryMatch && ingredientMatch;
  }), [activeCategory, ingredientQuery, recipes]);

  const suggestRecipe = () => {
    const pool = filtered.length > 0 ? filtered : recipes;
    const randomRecipe = pool[Math.floor(Math.random() * pool.length)];
    setSuggestedRecipe(randomRecipe || null);
  };

  const handleShoppingStart = () => {
    navigate(`/shopping-list?recipes=${selectedRecipeId}&persons=2`);
  };

  return (
    <div>
      {loading && (
        <p style={{ color: "#888", marginBottom: 18, fontWeight: 700 }}>Tarifler yukleniyor...</p>
      )}

      {/* Popular */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, margin: "0 0 14px", color: "#1a1a1a" }}>
          Popüler
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {popularRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/recipe/${recipe.id}`}
              style={{
                textDecoration: "none",
                borderRadius: 16,
                overflow: "hidden",
                background: "white",
                boxShadow: "0 2px 14px rgba(0,0,0,0.08)",
                border: "1px solid #f0e8de",
              }}
            >
              <img src={recipe.image} alt={recipe.title} style={{ width: "100%", height: 120, objectFit: "cover" }} />
              <div style={{ padding: 12 }}>
                <p style={{ margin: 0, color: "#1f2937", fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>{recipe.title}</p>
                <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: 12 }}>{recipe.calories} kcal</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Suggestion + Shopping + Ingredient Search */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #fffaf6 100%)", border: "1px solid #f0e8de", borderRadius: 18, padding: 18, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 10px", color: "#1a1a1a", fontSize: 20, fontFamily: "'Playfair Display', serif" }}>Tarif Öneri</h3>
          <p style={{ margin: "0 0 14px", color: "#6b7280", fontSize: 13 }}>Bana bir tarif öner butonuna bas, sana hızlıca bir seçenek çıkaralım.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={suggestRecipe}
              style={{
                background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                color: "white",
                border: "none",
                borderRadius: 999,
                padding: "10px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Bana Öner
            </button>
            {suggestedRecipe && (
              <Link
                to={`/recipe/${suggestedRecipe.id}`}
                style={{
                  border: "2px solid #ffe4d4",
                  color: "#c2410c",
                  borderRadius: 999,
                  padding: "8px 14px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {suggestedRecipe.title}
              </Link>
            )}
          </div>
        </div>

        <div style={{ background: "linear-gradient(180deg, #ffffff 0%, #fffaf6 100%)", border: "1px solid #f0e8de", borderRadius: 18, padding: 18, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 10px", color: "#1a1a1a", fontSize: 20, fontFamily: "'Playfair Display', serif" }}>Alışveriş Listesi Oluştur</h3>
          <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: 13 }}>Bir tarif seç, ardından alışveriş listene eklemeye başla.</p>
          <button
            onClick={handleShoppingStart}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #ff6b35, #f7931e)",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(255,107,53,0.25)",
            }}
          >
            Listeyi Aç
          </button>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
          border: "1px solid #fed7aa",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 6px 20px rgba(251,146,60,0.16)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -18, top: -20, width: 110, height: 110, borderRadius: "50%", background: "rgba(251,146,60,0.12)" }} />
          <h3 style={{ position: "relative", margin: "0 0 10px", color: "#1a1a1a", fontSize: 20, fontFamily: "'Playfair Display', serif" }}>
            Malzemeye Göre Bul
          </h3>
          <p style={{ position: "relative", margin: "0 0 14px", color: "#6b7280", fontSize: 13 }}>
            Elindeki malzemeleri gir, en uygun tarifleri eşleşme oranına göre sıralı şekilde bul.
          </p>
          <div style={{ position: "relative", display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {["domates", "mercimek", "tavuk", "sogan"].map((tag) => (
              <span key={tag} style={{
                border: "1px solid #fed7aa",
                background: "#fff",
                color: "#c2410c",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 700,
              }}>{tag}</span>
            ))}
          </div>
          <Link
            to="/ingredient-search"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #ff6b35, #f7931e)",
              color: "white",
              textDecoration: "none",
              borderRadius: 12,
              padding: "10px 14px",
              fontWeight: 800,
              fontSize: 13,
              boxShadow: "0 6px 18px rgba(255,107,53,0.28)",
            }}
          >
            Malzeme ile Tarif Bul →
          </Link>
        </div>
      </section>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        <button
          onClick={() => handleCategoryChange("Tümü")}
          style={{
            padding: "10px 20px",
            borderRadius: 50,
            border: activeCategory === "Tümü" ? "none" : "2px solid #e8e0d8",
            background: activeCategory === "Tümü"
              ? "linear-gradient(135deg, #ff6b35, #f7931e)"
              : "white",
            color: activeCategory === "Tümü" ? "white" : "#666",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .2s",
            boxShadow: activeCategory === "Tümü" ? "0 4px 12px rgba(255,107,53,0.3)" : "none",
          }}
        >Tümü</button>
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            style={{
              padding: "10px 20px",
              borderRadius: 50,
              border: activeCategory === cat.value ? "none" : "2px solid #e8e0d8",
              background: activeCategory === cat.value
                ? "linear-gradient(135deg, #ff6b35, #f7931e)"
                : "white",
              color: activeCategory === cat.value ? "white" : "#666",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
              boxShadow: activeCategory === cat.value ? "0 4px 12px rgba(255,107,53,0.3)" : "none",
            }}
          >{cat.label}</button>
        ))}
        <div style={{ marginLeft: "auto", color: "#999", fontSize: 13, display: "flex", alignItems: "center" }}>
          {filtered.length} tarif bulundu
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
      }}>
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#ccc" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🍽️</div>
          <p style={{ fontSize: 18, fontWeight: 700 }}>Tarif bulunamadı</p>
        </div>
      )}

      {/* Ingredient Modal */}
      {showIngredientModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }} onClick={() => setShowIngredientModal(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 24,
              padding: 36,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, margin: "0 0 8px", color: "#1a1a1a" }}>
              🧅 Malzemeye Göre Ara
            </h2>
            <p style={{ color: "#999", fontSize: 13, marginBottom: 24 }}>Elimdeki malzemelere göre tarifler bul</p>
            <div style={{
              display: "flex",
              gap: 10,
              background: "#f9f5f0",
              borderRadius: 50,
              padding: "4px 4px 4px 16px",
              border: "2px solid #f0e8de",
            }}>
              <input
                value={ingredientSearch}
                onChange={e => setIngredientSearch(e.target.value)}
                placeholder="örn: domates, mercimek..."
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "#333",
                }}
              />
              <button
                onClick={() => {
                  setIngredientQuery(ingredientSearch);
                  setShowIngredientModal(false);
                  handleCategoryChange("Tümü");
                }}
                style={{
                  background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                  color: "white",
                  border: "none",
                  borderRadius: 50,
                  padding: "10px 20px",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >Ara</button>
            </div>
            {ingredientQuery && (
              <button
                onClick={() => { setIngredientQuery(""); setIngredientSearch(""); }}
                style={{ marginTop: 12, background: "none", border: "none", color: "#ff6b35", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
              >✕ Filtreyi Temizle</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
