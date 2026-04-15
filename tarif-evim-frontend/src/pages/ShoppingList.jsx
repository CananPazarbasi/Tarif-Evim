import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRecipes } from "../services/recipeService";
import {
  addShoppingItem,
  clearShoppingList,
  getShoppingList,
  removeShoppingItem,
  updateShoppingItem,
} from "../services/shoppingListService";

const parseQuantity = (raw) => {
  if (!raw) return null;
  if (raw.includes("/")) {
    const [a, b] = raw.split("/").map((v) => Number(v.replace(",", ".")));
    if (!Number.isNaN(a) && !Number.isNaN(b) && b !== 0) return a / b;
  }
  const val = Number(raw.replace(",", "."));
  return Number.isNaN(val) ? null : val;
};

const formatQuantity = (value) => {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/\.00$/, "").replace(/0$/, "").replace(".", ",");
};

const scaleIngredient = (ingredient, factor) => {
  const match = ingredient.match(/^(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)\s+(.*)$/);
  if (!match) return ingredient;
  const qty = parseQuantity(match[1]);
  if (qty == null) return ingredient;
  return `${formatQuantity(qty * factor)} ${match[2]}`;
};

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

const withLocalId = (item, idx = 0) => ({
  ...item,
  id: item.id || item._id || `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
});

export default function ShoppingList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState([]);
  const [personCount, setPersonCount] = useState(Math.max(1, Number(searchParams.get("persons")) || 2));
  const [manualMenuInput, setManualMenuInput] = useState("");
  const [unmatchedMenus, setUnmatchedMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const loaded = await getRecipes({ onlyApproved: true, limit: 100 });
        setRecipes(loaded);
        const initialRecipes = (searchParams.get("recipes") || "")
          .split(",")
          .map((id) => Number(id))
          .filter((id) => loaded.some((r) => r.id === id));
        setSelectedRecipeIds(initialRecipes.length ? initialRecipes : [loaded[0]?.id].filter(Boolean));
      } catch {
        setRecipes([]);
        setSelectedRecipeIds([]);
      }
    };

    loadRecipes();
  }, [searchParams]);

  useEffect(() => {
    const loadShoppingList = async () => {
      if (!user) return;
      try {
        const data = await getShoppingList();
        setItems(data);
      } catch {
        setItems([]);
      }
    };

    loadShoppingList();
  }, [user]);

  const checked = useMemo(() => items.filter((i) => i.checked).length, [items]);

  const toggleRecipe = (id) => {
    setSelectedRecipeIds((prev) => (
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    ));
  };

  const syncUserItems = async (nextItems) => {
    if (!user) return;

    setSyncing(true);
    try {
      await clearShoppingList();
      let snapshot = [];
      for (const item of nextItems) {
        snapshot = await addShoppingItem({ name: item.name, quantity: item.quantity || "" });
      }
      setItems(snapshot);
    } finally {
      setSyncing(false);
    }
  };

  const generateFromSelection = async () => {
    const manualNames = manualMenuInput
      .split(/[\n,]/)
      .map((name) => name.trim())
      .filter(Boolean);

    const matchedManualIds = [];
    const unmatched = [];

    manualNames.forEach((menuName) => {
      const normalizedMenu = normalizeText(menuName);
      const match = recipes.find((recipe) => {
        const normalizedTitle = normalizeText(recipe.title);
        return normalizedTitle.includes(normalizedMenu) || normalizedMenu.includes(normalizedTitle);
      });
      if (match) {
        matchedManualIds.push(match.id);
      } else {
        unmatched.push(menuName);
      }
    });

    const allRecipeIds = [...new Set([...selectedRecipeIds, ...matchedManualIds])];

    if (allRecipeIds.length === 0) {
      setUnmatchedMenus(unmatched);
      if (user) {
        await syncUserItems([]);
      } else {
        setItems([]);
      }
      return;
    }

    const selectedRecipes = recipes.filter((recipe) => allRecipeIds.includes(recipe.id));
    const generated = selectedRecipes.flatMap((recipe) => {
      const factor = personCount / recipe.servings;
      return recipe.ingredients.map((ingredient) => ({
        name: scaleIngredient(ingredient, factor),
        checked: false,
        recipeTitle: recipe.title,
      }));
    });

    if (user) {
      await syncUserItems(generated);
    } else {
      setItems(generated.map((item, idx) => withLocalId(item, idx)));
    }

    setUnmatchedMenus(unmatched);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    if (user) {
      setSyncing(true);
      try {
        const data = await addShoppingItem({ name: newItem.trim(), quantity: "" });
        setItems(data);
      } finally {
        setSyncing(false);
      }
    } else {
      setItems((prev) => [
        ...prev,
        withLocalId({ name: newItem.trim(), checked: false }, prev.length),
      ]);
    }

    setNewItem("");
  };

  const toggleItem = async (id) => {
    if (user) {
      const current = items.find((item) => item.id === id);
      if (!current) return;
      setSyncing(true);
      try {
        const data = await updateShoppingItem(id, { checked: !current.checked });
        setItems(data);
      } finally {
        setSyncing(false);
      }
      return;
    }

    setItems((prev) => prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeItem = async (id) => {
    if (user) {
      setSyncing(true);
      try {
        const data = await removeShoppingItem(id);
        setItems(data);
      } finally {
        setSyncing(false);
      }
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCheckedItems = async () => {
    if (checked === 0) return;

    if (user) {
      const completed = items.filter((item) => item.checked);
      setSyncing(true);
      try {
        for (const item of completed) {
          await removeShoppingItem(item.id);
        }
        const refreshed = await getShoppingList();
        setItems(refreshed);
      } finally {
        setSyncing(false);
      }
      return;
    }

    setItems((prev) => prev.filter((item) => !item.checked));
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#1a1a1a", marginBottom: 8 }}>
        📋 Alışveriş Listesi
      </h1>
      <p style={{ color: "#999", marginBottom: 24, fontSize: 14 }}>{items.length} ürün · {checked} tamamlandı</p>

      <div style={{
        background: "white",
        borderRadius: 20,
        padding: "20px 24px",
        marginBottom: 24,
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#1a1a1a", fontFamily: "'Playfair Display', serif" }}>
          Tarif veya Menü Seç
        </h3>
        <p style={{ margin: "0 0 14px", color: "#888", fontSize: 13 }}>
          Tek tarif veya birden fazla tarif seç. Kişi sayısına göre gereken malzemeler otomatik hesaplanır.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <label style={{ fontSize: 13, color: "#666", fontWeight: 700 }}>Kaç kişilik?</label>
          <input
            type="number"
            min={1}
            value={personCount}
            onChange={(e) => setPersonCount(Math.max(1, Number(e.target.value) || 1))}
            style={{
              width: 86,
              border: "2px solid #f0e8de",
              borderRadius: 10,
              padding: "8px 10px",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {recipes.map((recipe) => {
            const active = selectedRecipeIds.includes(recipe.id);
            return (
              <button
                key={recipe.id}
                onClick={() => toggleRecipe(recipe.id)}
                style={{
                  border: active ? "none" : "2px solid #f0e8de",
                  background: active ? "linear-gradient(135deg, #ff6b35, #f7931e)" : "white",
                  color: active ? "white" : "#555",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {recipe.title}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#666", fontWeight: 700, marginBottom: 6 }}>
            Menü adını da yazabilirsin
          </label>
          <textarea
            value={manualMenuInput}
            onChange={(e) => setManualMenuInput(e.target.value)}
            rows={3}
            placeholder="Ornek: Mercimek Corbasi, Sufle veya satir satir menu yaz"
            style={{
              width: "100%",
              border: "2px solid #f0e8de",
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 13,
              fontFamily: "inherit",
              color: "#333",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: 12 }}>
            Yazdigin adlar mevcut tariflerle eslesirse malzemeler otomatik listeye eklenir.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={generateFromSelection}
            disabled={syncing}
            style={{
              background: "linear-gradient(135deg, #ff6b35, #f7931e)",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: syncing ? 0.7 : 1,
            }}
          >
            Listeyi Oluştur
          </button>
          <button
            onClick={() => {
              setSelectedRecipeIds([]);
              setManualMenuInput("");
              setUnmatchedMenus([]);
            }}
            style={{
              background: "white",
              color: "#999",
              border: "2px solid #f0e8de",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Seçimi Temizle
          </button>
        </div>

        {unmatchedMenus.length > 0 && (
          <div style={{
            marginTop: 12,
            borderRadius: 12,
            padding: "10px 12px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: 12,
            fontWeight: 600,
          }}>
            Eslesmeyen menuler: {unmatchedMenus.join(", ")}
          </div>
        )}
      </div>

      <div style={{
        background: "white",
        borderRadius: 20,
        padding: "20px 24px",
        marginBottom: 24,
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#555" }}>İlerleme</span>
          <span style={{ fontWeight: 800, color: "#ff6b35", fontSize: 13 }}>{items.length > 0 ? Math.round((checked / items.length) * 100) : 0}%</span>
        </div>
        <div style={{ background: "#f0e8de", borderRadius: 50, height: 8, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            borderRadius: 50,
            background: "linear-gradient(90deg, #ff6b35, #f7931e)",
            width: items.length > 0 ? `${(checked / items.length) * 100}%` : "0%",
            transition: "width .4s ease",
          }} />
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: 10,
        background: "white",
        borderRadius: 16,
        padding: "8px 8px 8px 20px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        marginBottom: 24,
        border: "2px solid #f0e8de",
      }}>
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          placeholder="Ürün ekle..."
          style={{
            flex: 1, border: "none", outline: "none",
            fontFamily: "inherit", fontSize: 14, color: "#333",
            background: "transparent",
          }}
        />
        <button onClick={addItem} disabled={syncing} style={{
          background: "linear-gradient(135deg, #ff6b35, #f7931e)",
          color: "white", border: "none",
          borderRadius: 10, padding: "10px 18px",
          fontWeight: 800, fontSize: 13, cursor: "pointer",
          fontFamily: "inherit",
          opacity: syncing ? 0.7 : 1,
        }}>+ Ekle</button>
      </div>

      <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#ccc" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            <p style={{ fontWeight: 700 }}>Liste boş</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 20px",
                borderBottom: i < items.length - 1 ? "1px solid #f5f5f5" : "none",
                transition: "background .15s",
                background: item.checked ? "#fafaf8" : "white",
              }}
            >
              <button
                onClick={() => toggleItem(item.id)}
                disabled={syncing}
                style={{
                  width: 24, height: 24,
                  borderRadius: 8,
                  border: item.checked ? "none" : "2px solid #f0e8de",
                  background: item.checked ? "linear-gradient(135deg, #ff6b35, #f7931e)" : "white",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 12, fontWeight: 800,
                  flexShrink: 0,
                  transition: "all .2s",
                  opacity: syncing ? 0.7 : 1,
                }}
              >{item.checked ? "✓" : ""}</button>
              <span style={{
                flex: 1,
                fontWeight: 600,
                fontSize: 14,
                color: item.checked ? "#bbb" : "#333",
                textDecoration: item.checked ? "line-through" : "none",
                transition: "all .2s",
              }}>
                {item.name}
                {item.recipeTitle && (
                  <span style={{ display: "block", marginTop: 2, fontSize: 11, color: "#aaa", fontWeight: 600 }}>
                    {item.recipeTitle}
                  </span>
                )}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                disabled={syncing}
                style={{
                  background: "none", border: "none",
                  color: "#ddd", cursor: "pointer", fontSize: 16,
                  padding: 4,
                  transition: "color .2s",
                  opacity: syncing ? 0.7 : 1,
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#e53e3e"}
                onMouseLeave={e => e.currentTarget.style.color = "#ddd"}
              >✕</button>
            </div>
          ))
        )}
      </div>

      {checked > 0 && (
        <button onClick={clearCheckedItems} disabled={syncing} style={{
          marginTop: 16,
          background: "none",
          border: "2px solid #f0e8de",
          borderRadius: 12,
          padding: "10px 20px",
          color: "#999",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 700,
          fontSize: 13,
          width: "100%",
          opacity: syncing ? 0.7 : 1,
        }}>✕ Tamamlananları Temizle ({checked})</button>
      )}
    </div>
  );
}
