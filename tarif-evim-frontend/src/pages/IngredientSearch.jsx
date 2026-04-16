import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRecipes } from "../services/recipeService";

const normalizeText = (value) =>
  value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();

const ingredientNameOnly = (ingredient) =>
  normalizeText(
    ingredient
      .replace(/^\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?\s*/g, "")
      .replace(/^(su\s*bardagi|yemek\s*kasigi|tatli\s*kasigi|cay\s*kasigi|adet|gram|g|kg|ml|lt|litre)\s*/g, "")
      .replace(/[(),.]/g, " ")
      .replace(/\s+/g, " ")
  );

const computeMatch = (recipe, userIngredients) => {
  const userSet = new Set(userIngredients.map((item) => normalizeText(item)));

  const analyzed = recipe.ingredients.map((raw) => {
    const name = ingredientNameOnly(raw);
    const hasIngredient = Array.from(userSet).some(
      (userItem) => name.includes(userItem) || userItem.includes(name)
    );

    return {
      raw,
      name,
      hasIngredient,
    };
  });

  const matched = analyzed.filter((item) => item.hasIngredient).length;
  const total = analyzed.length;
  const ratio = total > 0 ? matched / total : 0;

  return {
    recipe,
    matched,
    total,
    ratio,
    percent: Math.round(ratio * 100),
    missing: analyzed.filter((item) => !item.hasIngredient).map((item) => item.raw),
  };
};

export default function IngredientSearch() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      try {
        const allRecipes = await getRecipes({ limit: 100 });
        setRecipes(allRecipes);
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const addIngredient = () => {
    const value = inputValue.trim();
    if (!value) return;

    const normalized = normalizeText(value);
    const alreadyExists = selectedIngredients.some((item) => normalizeText(item) === normalized);
    if (alreadyExists) {
      setInputValue("");
      return;
    }

    setSelectedIngredients((prev) => [...prev, value]);
    setInputValue("");
  };

  const removeIngredient = (ingredientToRemove) => {
    setSelectedIngredients((prev) => prev.filter((item) => item !== ingredientToRemove));
  };

  const searchResults = useMemo(() => {
    if (!searched || selectedIngredients.length === 0) return [];

    return recipes.map((recipe) => computeMatch(recipe, selectedIngredients))
      .filter((item) => item.matched > 0)
      .sort((a, b) => b.ratio - a.ratio || b.matched - a.matched || a.recipe.title.localeCompare(b.recipe.title));
  }, [recipes, searched, selectedIngredients]);

  const topResult = searchResults[0];

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 44px" }}>
      <section
        style={{
          background: "linear-gradient(145deg, #fff7ed 0%, #ffffff 60%)",
          border: "1px solid #fed7aa",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 14px 32px rgba(249,115,22,0.12)",
          position: "relative",
          overflow: "hidden",
          marginBottom: 18,
        }}
      >
        <div style={{ position: "absolute", right: -50, top: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(251,146,60,0.14)" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 900, color: "#ea580c" }}>
            Malzemeye Gore Tarif Bul
          </h1>
          <p style={{ margin: "10px 0 18px", color: "#6b7280", fontSize: 16, maxWidth: 760 }}>
            Elindeki malzemeleri ekle, sana en uygun tarifleri eslesme oranina gore siralayalim.
          </p>
          {loading && (
            <p style={{ margin: "0 0 10px", color: "#9ca3af", fontSize: 13, fontWeight: 700 }}>Tarifler yukleniyor...</p>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addIngredient();
                }
              }}
              placeholder="Orn: domates, sogan, mercimek"
              style={{
                flex: 1,
                minWidth: 280,
                border: "2px solid #fed7aa",
                background: "white",
                borderRadius: 14,
                padding: "12px 14px",
                fontSize: 14,
                color: "#374151",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={addIngredient}
              style={{
                border: "none",
                background: "linear-gradient(135deg, #f97316, #f59e0b)",
                color: "white",
                borderRadius: 12,
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(249,115,22,0.28)",
              }}
            >
              + Malzeme Ekle
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 40, marginBottom: 14 }}>
            {selectedIngredients.length === 0 && (
              <span style={{ fontSize: 13, color: "#9ca3af" }}>Henuz malzeme eklenmedi.</span>
            )}
            {selectedIngredients.map((ingredient) => (
              <span
                key={ingredient}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 999,
                  border: "1px solid #fed7aa",
                  background: "#fff",
                  color: "#c2410c",
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {ingredient}
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient)}
                  aria-label={`${ingredient} malzemesini sil`}
                  style={{ border: "none", background: "transparent", color: "#f97316", cursor: "pointer", fontWeight: 900 }}
                >
                  x
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSearched(true)}
              disabled={selectedIngredients.length === 0}
              style={{
                border: "none",
                background: selectedIngredients.length === 0 ? "#fdba74" : "#f97316",
                color: "white",
                borderRadius: 12,
                padding: "11px 18px",
                fontSize: 13,
                fontWeight: 800,
                cursor: selectedIngredients.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Tarif Bul
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedIngredients([]);
                setInputValue("");
                setSearched(false);
              }}
              style={{
                border: "1px solid #e5e7eb",
                background: "white",
                color: "#4b5563",
                borderRadius: 12,
                padding: "11px 18px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Temizle
            </button>
          </div>
        </div>
      </section>

      {searched && selectedIngredients.length > 0 && (
        <section style={{ marginBottom: 18, borderRadius: 14, border: "1px solid #fed7aa", background: "#fff7ed", padding: "12px 14px", fontSize: 14, color: "#9a3412", fontWeight: 700 }}>
          {searchResults.length > 0
            ? `En iyi eslesen tarif: ${topResult.recipe.title} (${topResult.matched}/${topResult.total} - %${topResult.percent})`
            : "Bu malzemelerle eslesen tarif bulunamadi."}
        </section>
      )}

      {searched && searchResults.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px 0", color: "#9ca3af", fontWeight: 700 }}>
          Bu malzemelerle uygun tarif bulunamadi.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {searchResults.map((item) => (
            <article key={item.recipe.id} style={{ overflow: "hidden", borderRadius: 20, border: "1px solid #ffedd5", background: "white", boxShadow: "0 8px 22px rgba(0,0,0,0.08)" }}>
              <img src={item.recipe.image} alt={item.recipe.title} style={{ width: "100%", height: 190, objectFit: "cover" }} />

              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 26, lineHeight: 1.15, color: "#1f2937" }}>{item.recipe.title}</h2>
                  <span style={{ borderRadius: 999, background: "#ffedd5", color: "#c2410c", padding: "5px 10px", fontSize: 12, fontWeight: 800 }}>%{item.percent}</span>
                </div>

                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#4b5563" }}>
                  {item.matched}/{item.total} malzeme elinizde var
                </p>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ height: 8, borderRadius: 999, background: "#ffedd5", overflow: "hidden" }}>
                    <div style={{ width: `${item.percent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #f97316, #f59e0b)" }} />
                  </div>
                </div>

                <div style={{ marginBottom: 14, borderRadius: 12, border: "1px solid #ffedd5", background: "#fffaf5", padding: 10 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, color: "#c2410c" }}>Eksik Malzemeler</p>
                  {item.missing.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#16a34a" }}>Tum malzemeler elinizde.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {item.missing.map((missingItem) => (
                        <li key={missingItem} style={{ color: "#dc2626", fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                          {missingItem}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Link
                  to={`/recipe/${item.recipe.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    textDecoration: "none",
                    background: "linear-gradient(135deg, #f97316, #f59e0b)",
                    color: "white",
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 800,
                    boxShadow: "0 8px 18px rgba(249,115,22,0.25)",
                  }}
                >
                  Tarifi Goruntule
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
